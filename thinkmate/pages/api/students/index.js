import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const students = await prisma.student.findMany({
                include: {
                    user: true,
                     interests: true, 
                    },
            });
            res.status(200).json(students)
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch students' })
        }
    } else if (req.method === 'POST') {
        try {
            const { name, email} = req.body

            // create user
            const user = await prisma.user.create({
                data: { 
                    name, 
                    email,
                    role: 'STUDENT',
                 },
            })

            // create student profile
            const student = await prisma.student.create({
                data: {
                    userId: user.id,
                },
                include: { 
                    user: true,
                interests: true,
            },
            })
            res.status(201).json(student)
        } catch (error) {
            console.error('Error creating student:', error)
            res.status(500).json({ error: 'Failed to create student' })
        }
        
    }
    else {
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
