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
        } catch {
            res.status(500).json({ error: 'Failed to fetch students' })
        }
    } else if (req.method === 'POST') {
        try {
            // accept either `studentColor` or `color` to be tolerant of client naming
            const { name, email, studentColor, color } = req.body

            // basic required fields check
            if (!name || !email) return res.status(400).json({ error: 'name and email are required' })

            // log body for easier debugging
            console.log('POST /api/students body:', req.body)
            const incomingColor = studentColor || color
            // validate & normalize color BEFORE creating any DB records
            const hex3 = /^#?[0-9A-Fa-f]{3}$/
            const hex6 = /^#?[0-9A-Fa-f]{6}$/
            let colorToUse = '#999999'

            if (incomingColor) {
                let c = String(incomingColor).trim()
                if (!c.startsWith('#')) c = '#' + c 
                if (hex3.test(c)) c = c.replace(/^#?([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/, (m, r, g, b) => '#' + r + r + g + g + b + b)
                if (!hex6.test(c)) return res.status(400).json({ error: 'Invalid color format. Use #RRGGBB or #RGB' ,c})
                colorToUse = c.toUpperCase()
            }

            // create user
            const user = await prisma.user.create({
                data: { name, email, role: 'STUDENT' },
            })

            // create student profile
            const student = await prisma.student.create({
                data: { userId: user.id, studentColor: colorToUse },
                include: { user: true, interests: true },
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
