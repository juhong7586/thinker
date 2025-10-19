import { prisma } from '../../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'group id required' });

  try {
    const gid = Number(id);
    const members = await prisma.groupMember.findMany({ where: { groupId: gid }, include: { student: { include: { user: true } } } });
    return res.status(200).json({ members });
  } catch (err) {
    console.error('GET /api/groups/[id]/members error', err);
    return res.status(500).json({ error: 'server error' });
  }
}
