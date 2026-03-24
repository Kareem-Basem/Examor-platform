# Examor Platform

Examor is a full-stack online examination platform with role-based dashboards for admins, teachers, and students.

## Project Status
- Active development since **10-03-2026**.

## Live
- Frontend: `https://examor-frontend.vercel.app`
- Backend API: `https://examor-backend.vercel.app`

## Key Features
- Role-based dashboards (Admin / Doctor / Student)
- Exam creation and management
- Question bank and grading
- Auto-save + heartbeat tracking
- Proctoring controls and violation tracking

## Tech Stack
- Frontend: React (CRA)
- Backend: Node.js + Express (Vercel serverless)
- Database: PostgreSQL (Supabase compatible)

## Quick Start (Local)

### Backend
```bash
cd examor-backend
npm install
npm run dev
```

### Frontend
```bash
cd examor-frontend
npm install
npm start
```

## Environment Variables (Backend)
Create `.env` in `examor-backend`:
```
DATABASE_URL=...
JWT_SECRET=...
JWT_EXPIRES_IN=...
CORS_ORIGINS=...
```

## Deployment
- Frontend + Backend deployed on Vercel.

## Author
Kareem Basem (KeMoO)

## License
Private project — all rights reserved.
