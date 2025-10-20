export async function generateFromAnswers(answersOrPayload, opts = {}) {
  // Accept either an answers array or a full payload object
  const endpoint = process.env.NEXT_PUBLIC_PY_GEN_ENDPOINT || '/api/generate';

  const payload = typeof answersOrPayload === 'object' && !Array.isArray(answersOrPayload)
    ? answersOrPayload
    : { type: 'answers', answers: answersOrPayload };

  // normalize common shapes: if caller passed { data: ... } (survey payload),
  // forward it as { answers: data } which the model server expects
  if (!payload.answers && payload.data) {
    payload.answers = payload.data;
    delete payload.data;
  }

  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new Error('Network error when contacting generation server: ' + err.message);
  }

  let json = null;
  try {
    json = await res.json();
  } catch (err) {
    // Non-JSON response
    const text = await res.text().catch(() => null);
    if (!res.ok) throw new Error(text || 'Generation server returned non-JSON response');
    return text;
  }

  if (!res.ok) {
    throw new Error(json.error || json.detail || 'Generation failed');
  }

  return json; // { reply: '...' } or other structured response
}

export default generateFromAnswers;