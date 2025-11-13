// Server-side proxy to call Databricks Model Serving safely from the browser.
// Keep your DATABRICKS_TOKEN secret in server env (.env.local) and never expose it to the client.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });



  const endpoint = process.env.DATABRICKS_SERVING_URL || process.env.DATABRICKS_SERVING_ENDPOINT;
  const token = process.env.DATABRICKS_TOKEN;
  if (!endpoint || !token) return res.status(500).json({ error: 'Missing Databricks config on server' });

  // Try a few common payload formats used by model serving endpoints. First try chat-style messages,
  // then a simple `inputs` string, then `instances` array. This helps with different model server configs.
  const bodyCandidates = [];
  if (mode === 'chat' || mode === 'auto') {
    bodyCandidates.push({ messages: [{ role: 'user', content: String(prompt) }] });
  }
  bodyCandidates.push({ inputs: String(prompt) });
  bodyCandidates.push({ instances: [String(prompt)] });

  let lastError = null;

  for (const body of bodyCandidates) {
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const text = await r.text();
      let payload = null;
      try { payload = JSON.parse(text); } catch (e) { payload = text; }

      if (!r.ok) {
        lastError = { status: r.status, body: payload };
        // try next payload shape
        continue;
      }

      // Try to extract a sensible reply from the returned payload.
      const extract = (p) => {
        if (p == null) return null;
        if (typeof p === 'string') return p;
        if (Array.isArray(p) && p.length === 1 && typeof p[0] === 'string') return p[0];
        if (p.result) return p.result;
        if (p.outputs) return p.outputs;
        if (p.choices && p.choices[0]) {
          const c = p.choices[0];
          return c.text ?? c.message ?? c.output ?? c;
        }
        if (p.data) return p.data;
        if (p.message) return p.message;
        return p;
      };

      const reply = extract(payload);
      return res.status(200).json({ ok: true, reply, raw: payload });
    } catch (err) {
      lastError = err;
      // try the next candidate
    }
  }

  console.error('Databricks invocation failed', lastError);
  return res.status(502).json({ error: 'Model invocation failed', detail: lastError });
}
