import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { groupId, inviteCode, studentId } = req.body || {}

    if (!groupId && !inviteCode) return res.status(400).json({ error: 'groupId or inviteCode required' })

    // find the group by id or inviteCode
    const group = groupId
      ? await prisma.group.findUnique({ where: { id: Number(groupId) } })
      : await prisma.group.findUnique({ where: { inviteCode: String(inviteCode) } })

    if (!group) return res.status(404).json({ error: 'group not found' })

    // if inviteCode provided, validate it matches the group's code
    if (inviteCode && String(inviteCode) !== String(group.inviteCode)) {
      return res.status(403).json({ error: 'invalid invite code' })
    }

    // if a studentId is supplied, create a GroupMember record (idempotent)
    if (studentId) {
      const sid = Number(studentId)
      if (!Number.isFinite(sid)) return res.status(400).json({ error: 'invalid studentId' })

      try {
        await prisma.groupMember.create({ data: { groupId: group.id, studentId: sid, role: 'MEMBER' } })
      } catch (err) {
        // ignore unique constraint violation (already a member)
        const isUniqueConstraint = err && err.code === 'P2002'
        if (!isUniqueConstraint) {
          console.error('POST /api/groups/join error creating GroupMember', err)
          return res.status(500).json({ error: 'failed to add member' })
        }
      }
    }

    // return the group (include members count)
    const fullGroup = await prisma.group.findUnique({ where: { id: group.id }, include: { members: true } })

    return res.status(200).json({ group: fullGroup })
  } catch (err) {
    console.error('POST /api/groups/join error', err)
    return res.status(500).json({ error: 'server error' })
  }
}
