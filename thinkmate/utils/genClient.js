export async function generateFromAnswers(answers, opts = {}) {
  const body = { answers, max_new_tokens: opts.max_new_tokens || 120, temperature: opts.temperature ?? 0.2 };
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Generation failed');
  return json; // { reply: "..." }
}

export default generateFromAnswers;