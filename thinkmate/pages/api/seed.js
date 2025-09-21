import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // 테스트 학생들 생성
      const students = [
        { name: '김민지', email: 'minji@test.com' },
        { name: '박준호', email: 'junho@test.com' },
        { name: '이서현', email: 'seohyun@test.com' },
      ]
      
      for (const studentData of students) {
        // 사용자 생성
        const user = await prisma.user.create({
          data: {
            name: studentData.name,
            email: studentData.email,
            role: 'STUDENT',
          },
        })
        
        // 학생 생성
        const student = await prisma.student.create({
          data: {
            userId: user.id,
          },
        })
        
        // 테스트 관심사 추가
        const interests = [
          { field: 'AI', level: 8, socialImpact: 'HIGH' },
          { field: '환경보호', level: 6, socialImpact: 'MODERATE' },
        ]
        
        for (const interestData of interests) {
          await prisma.interest.create({
            data: {
              studentId: student.id,
              field: interestData.field,
              level: interestData.level,
              socialImpact: interestData.socialImpact,
            },
          })
        }
      }
      
      res.status(200).json({ message: 'Test data created successfully' })
    } catch (error) {
      console.error('Seed error:', error)
      res.status(500).json({ error: 'Failed to seed data' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}