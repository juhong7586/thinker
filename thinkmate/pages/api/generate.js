export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const endpoint = process.env.PY_GEN_ENDPOINT || 'http://localhost:8000/generate';
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const json = await r.json();
    if (!r.ok) return res.status(502).json({ error: json.detail || 'generation failed' });
    return res.status(200).json(json);
  } catch (err) {
    console.error('Proxy error', err);
    return res.status(500).json({ error: 'server proxy error' });
  }
}