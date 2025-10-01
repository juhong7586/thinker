import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      
      const { studentId, field, level, socialImpact } = req.body
      
      const interest = await prisma.interest.create({
        data: {
          studentId: parseInt(studentId),
          field,
          level: parseInt(level),
          socialImpact: socialImpact.toUpperCase()
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      })
      
      res.status(201).json(interest)
    } catch (error) {
      console.error('Error creating interest:', error)
      res.status(500).json({ error: 'Failed to create interest' })
    }
  }
  
  else if (req.method === 'GET') {
    try {
      const interests = await prisma.interest.findMany({
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      })
      res.status(200).json(interests)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch interests' })
    }
  }
  
  else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}