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
            const { name, email, studentColor} = req.body
            // check for existing user by email
            let user = await prisma.user.findUnique({ where: { email } })

            if (!user) {
                // create user if it doesn't exist
                user = await prisma.user.create({
                    data: {
                        name,
                        email,
                        role: 'STUDENT',
                    },
                })
            }

            // check if a student profile already exists for this user
            const existingStudent = await prisma.student.findUnique({ where: { userId: user.id } })
            if (existingStudent) {
                // conflict: student already exists for this user
                return res.status(409).json({ error: 'Student profile already exists for this user' })
            }

            // create student profile (Student model doesn't include `color` in schema)
            const student = await prisma.student.create({
                data: {
                    userId: user.id,
                    color: studentColor
                },
                include: {
                    user: true,
                    interests: true,
                },
            })

            res.status(201).json(student)
        } catch (error) {
            console.error('Error creating student:', error)
            // Prisma unique constraint error on email
            if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
                return res.status(409).json({ error: 'Email already in use' })
            }
            res.status(500).json({ error: 'Failed to create student' })
        }
        
    }
    else {
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
