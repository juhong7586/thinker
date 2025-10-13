// pages/api/generate-response.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { answers, consent, promptOverride } = req.body || {};
  if (!consent) return res.status(400).json({ error: 'User consent required' });
  if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'Invalid answers' });

  // Build prompt
  const systemMessage = {
    role: 'system',
    content: 'You are an empathetic assistant that summarizes short surveys and provides two practical, kind suggestions.'
  };

  // Instruct the model to return a JSON object only for easier, safe parsing.
  let userContent = `User survey answers (JSON):\n${JSON.stringify(answers, null, 2)}\n\nTask: Return a JSON object only (no extra text) with the following shape:\n{
  "summary": "A short friendly summary (3-5 sentences)",
  "suggestions": ["First suggestion","Second suggestion"]
}\n
If you cannot produce the JSON exactly, return a single JSON object with an 'error' key describing the problem.\n`;

  if (promptOverride && typeof promptOverride === 'string' && promptOverride.trim().length > 0) {
    userContent += `\nAdditional instructions from client: ${promptOverride}`;
  }

  const userMessage = { role: 'user', content: userContent };

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not configured' });

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, userMessage],
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error('Provider error', resp.status, txt);
      return res.status(502).json({ error: 'Model provider error' });
    }

    const data = await resp.json();
    console.log('OpenAI response data:', JSON.stringify(data, null, 2));
    const rawText = data?.choices?.[0]?.message?.content ?? null;

    // Try to parse the returned text as JSON. If it fails, try to extract JSON substring.
    let structured = null;
    if (rawText) {
      try {
        structured = JSON.parse(rawText);
      } catch (e) {
        // Try to extract a JSON substring between first { and last }
        const first = rawText.indexOf('{');
        const last = rawText.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) {
          const maybe = rawText.substring(first, last + 1);
          try {
            structured = JSON.parse(maybe);
          } catch (e2) {
            // leave structured null
          }
        }
      }
    }

    return res.status(200).json({ reply: rawText, structured, raw: data });
  } catch (err) {
    console.error('Server error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
