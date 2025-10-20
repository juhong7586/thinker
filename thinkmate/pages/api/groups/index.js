import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { studentId } = req.query;
  if (!studentId) return res.status(200).json({ groups: [] });

  try {
    const sid = Number(studentId);
    if (!Number.isFinite(sid)) return res.status(400).json({ error: 'invalid studentId' });

    // find groups where this student is a member
    const groups = await prisma.group.findMany({
      where: { members: { some: { studentId: sid } } },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, description: true, inviteCode: true, teacherId: true }
    });

    return res.status(200).json({ groups });
  } catch (err) {
    console.error('GET /api/groups error', err);
    return res.status(500).json({ error: 'server error' });
  }
}
