# ThinkMate 🤝

AI-powered collaborative ideation platform that helps students discover shared interests, form meaningful groups, and generate impactful project ideas.

## Features

- 3D interest visualization with clustering
- Real-time collaborative workspace
- AI-supported project ideation
- Social impact analysis

## Getting Started

\`\`\`bash
npm run dev
pyenv activate .venv   
MODEL_ID="google/gemma-3-1b-it" uvicorn server.app:app --host 0.0.0.0 --port 8000 &> server.log &
tail -f server.log
npx prisma studio --schema='thinkmate/prisma/schema.prisma' 

\`\`\`
 

## Tech Stack

- React + Three.js
- Tailwind CSS
- D3.js for data analysis

rm -rf prisma/migrations    
npx prisma migrate reset --force --skip-seed
npx prisma migrate dev --name init  
npx prisma migrate deploy 
\`\`\`





thinkmate/
├── pages/
│   ├── _app.js
│   ├── index.js                    # 메인 대시보드
│   ├── login.js                    # 로그인 페이지
│   ├── register.js                 # 회원가입 페이지
│   ├── dashboard/
│   │   ├── student.js              # 학생 개인 대시보드
│   │   └── teacher.js              # 교사 대시보드
│   ├── groups/
│   │   ├── create.js               # 그룹 생성
│   │   ├── [id].js                 # 그룹별 워크스페이스
│   │   └── join/[code].js          # 그룹 참여 (초대코드)
│   └── api/                        # API 라우트 (백엔드)
│       ├── auth/
│       │   ├── login.js
│       │   ├── register.js
│       │   └── logout.js
│       ├── students/
│       │   ├── index.js            # GET /api/students
│       │   ├── [id].js             # GET/PUT/DELETE /api/students/[id]
│       │   └── interests.js        # POST /api/students/interests
│       ├── groups/
│       │   ├── index.js            # 그룹 CRUD
│       │   ├── [id].js
│       │   └── join.js
│       ├── clusters.js             # 클러스터 분석 API
│       └── ai/
│           └── suggestions.js      # AI 아이디어 제안
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx      # 로그인 필요한 페이지 보호
│   ├── visualization/
│   │   ├── InterestVisualization.jsx
│   │   ├── Visualization3D.jsx
│   │   └── ClusterAnalysis.jsx
│   ├── forms/
│   │   ├── InterestInputPanel.jsx
│   │   └── GroupCreationForm.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Layout.jsx
│   └── ui/                         # 재사용 UI 컴포넌트
│       ├── Button.jsx
│       ├── Modal.jsx
│       └── LoadingSpinner.jsx
├── lib/                            # 핵심 라이브러리
│   ├── db.js                       # 데이터베이스 연결
│   ├── auth.js                     # 인증 미들웨어
│   ├── validation.js               # 입력값 검증
│   └── clustering.js               # 클러스터링 알고리즘
├── models/                         # 데이터 모델
│   ├── User.js
│   ├── Student.js
│   ├── Group.js
│   ├── Interest.js
│   └── Project.js
├── middleware/                     # Next.js 미들웨어
│   └── auth.middleware.js
├── hooks/
│   ├── useAuth.js                  # 인증 상태 관리
│   ├── useStudents.js
│   ├── useGroups.js
│   └── useInterests.js
├── utils/
│   ├── database.js                 # DB 헬퍼 함수들
│   ├── auth-helpers.js
│   └── clustering.js
├── prisma/                         # Prisma ORM (추천)
│   ├── schema.prisma              # 데이터베이스 스키마
│   └── migrations/
├── styles/
│   └── globals.css
└── .env.local                      # 환경변수 (DB 연결 정보 등)