// pages/api/assistant.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, userData } = req.body;
  if (!message) return res.status(400).json({ error: 'no message' });

  // Support multiple env var naming conventions. Prefer explicit host/deployment,
  // but fall back to `DATABRICKS_SERVER_HOSTNAME` or a full `DATABRICKS_SERVING_URL`.
  const DATABRICKS_HOST = process.env.DATABRICKS_HOST || (process.env.DATABRICKS_SERVER_HOSTNAME ? `https://${process.env.DATABRICKS_SERVER_HOSTNAME}` : undefined);
  const DATABRICKS_TOKEN = process.env.DATABRICKS_TOKEN || process.env.DATABRICKS_DBTOKEN;
  const DEPLOYMENT_ID = process.env.DATABRICKS_DEPLOYMENT_ID;
  const SERVING_URL = process.env.DATABRICKS_SERVING_URL;

  // Determine the invocation URL: prefer a full serving URL, otherwise construct one
  let invokeUrl;
  if (SERVING_URL) {
    invokeUrl = SERVING_URL.startsWith('http') ? SERVING_URL : `https://${SERVING_URL}`;
  } else if (DATABRICKS_HOST && DEPLOYMENT_ID) {
    invokeUrl = `${DATABRICKS_HOST}/api/realtime/v1.0/deployments/${DEPLOYMENT_ID}/invoke`;
  }

  if (!invokeUrl || !DATABRICKS_TOKEN) {
    const missing = [];
    if (!invokeUrl) missing.push('DATABRICKS_HOST + DATABRICKS_DEPLOYMENT_ID or DATABRICKS_SERVING_URL');
    if (!DATABRICKS_TOKEN) missing.push('DATABRICKS_TOKEN');
    return res.status(500).json({ error: 'Databricks not configured', missing });
  }

  try {
    // Databricks Responses/ResponsesAgent models expect each input item to be a
    // Message-like object with `role` and `content` (an array of typed items).
    // Build an input array where the user message is represented with role/user
    // and content containing a text OutputItem. This matches the pydantic
    // ResponsesAgentRequest schema.
    const payload = {
      input: [
        {
          role: 'user',
          content: [
            { type: 'text', text: message }
          ]
        }
      ],
      // Common optional params (adjust per your model's API)
      max_output_tokens: 512,
      temperature: 0.2,
      stream: false
    };

    // If the client provided user profile / interests, attach as metadata
    // and also prepend a system message so the model sees it as context.
    if (userData && typeof userData === 'object') {
      payload.metadata = userData;
      try {
        const summary = typeof userData.summary === 'string' ? userData.summary : JSON.stringify(userData);
        payload.input.unshift({
          role: 'system',
          content: [{ type: 'text', text: `User profile: ${summary}` }]
        });
      } catch  {
        // ignore serialization errors
      }
    }

    const url = invokeUrl;

    const dbRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRICKS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    if (!dbRes.ok) {
      const errText = await dbRes.text();
      console.error('Databricks error', dbRes.status, errText);
      return res.status(502).json({ error: 'Databricks request failed', details: errText });
    }

    const dbJson = await dbRes.json();

    // Try several common response shapes to extract assistant text.
    function extractReply(obj) {
      if (!obj) return null;
      // direct output.text
      if (obj.output && typeof obj.output === 'object') {
        if (typeof obj.output.text === 'string') return obj.output.text;
        // sometimes output is an array
        if (Array.isArray(obj.output) && obj.output[0] && typeof obj.output[0].text === 'string') return obj.output[0].text;
      }
      // predictions array
      if (Array.isArray(obj.predictions) && obj.predictions.length) {
        const p = obj.predictions[0];
        if (typeof p === 'string') return p;
        if (p.output && typeof p.output === 'string') return p.output;
        if (p.text && typeof p.text === 'string') return p.text;
        if (p.value && typeof p.value === 'string') return p.value;
        // nested content
        if (p.data && typeof p.data === 'string') return p.data;
        // try JSON-stringifying first prediction if nothing else
        return JSON.stringify(p);
      }
      // fallback: if obj has a top-level string field
      for (const k of Object.keys(obj)) {
        if (typeof obj[k] === 'string') return obj[k];
      }
      return JSON.stringify(obj);
    }

    // If the response follows the Responses API shape, try to extract the
    // assistant message text from output[].content[].text which may be
    // wrapped in markdown fences containing JSON.
    let assistantText = null;
    try {
      if (Array.isArray(dbJson.output) && dbJson.output.length) {
        // Prefer the first message-like output
        const msg = dbJson.output.find(m => m && m.type && m.type === 'message') || dbJson.output[0];
        const content = Array.isArray(msg.content) && msg.content.length ? msg.content[0] : null;
        if (content && typeof content.text === 'string') {
          let text = content.text;
          // If text contains a fenced code block, extract inner content
          const fenceMatch = text.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
          if (fenceMatch && fenceMatch[1]) {
            text = fenceMatch[1].trim();
          }
          // If the extracted text is JSON, parse it and pick a sensible field
          try {
            const parsed = JSON.parse(text);
            // Prefer explicit reply fields if present
            assistantText = parsed.reply || parsed.text || parsed.question || parsed.reaction || JSON.stringify(parsed);
          } catch {
            // not JSON — use the raw text
            assistantText = text.trim();
          }
        }
      }
    } catch {
      // ignore and fall back
      assistantText = null;
    }

    if (!assistantText) {
      assistantText = extractReply(dbJson);
    }

    return res.status(200).json({ reply: assistantText, raw: dbJson });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal error' });
  }
}