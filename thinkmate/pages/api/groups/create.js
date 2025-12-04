import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  
  if (req.method === 'POST'){
  const { name, description, inviteCode, teacherId } = req.body || {};

  if (!name) return res.status(400).json({ error: 'name required' });

  try {

    const group = await prisma.group.create({ data: { name, description: description || '', inviteCode: inviteCode || null, teacherId: teacherId || null } });
    return res.status(200).json({ group });
  } catch (err) {
    console.error('POST /api/groups/create error', err);
    return res.status(500).json({ error: 'server error' });
  }
  } else {
    return res.status(405).end();
  }
}
