import getStudentsByCountryServer from '../../../lib/getStudentsByCountryServer';

export default async function handler(req, res) {
  const country = req.query.country || req.body?.country;
  if (!country) return res.status(400).json({ error: 'country is required' });
  try {
    const rows = await getStudentsByCountryServer(country);
    return res.status(200).json({ rows });
  } catch (err) {
    console.error('API getStudentsByCountry error:', err);
    return res.status(500).json({ error: err.message || 'server error' });
  }
}
