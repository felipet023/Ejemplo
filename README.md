# CRM Assessment

Plataforma empresarial de evaluación de competencias mediante inteligencia artificial.

## Estructura
- `backend/` Express + TypeScript + Prisma + PostgreSQL
- `frontend/` React + Vite + TypeScript + Tailwind

## Requisitos
- Node.js 20+
- PostgreSQL 15+ (usuario `crm_user` / `crm_password`, BD `crm_assessment`)

## Instalación
```bash
# Base de datos
psql -U postgres -c "CREATE DATABASE crm_assessment;"
psql -U postgres -c "CREATE USER crm_user WITH PASSWORD 'crm_password';"
psql -U postgres -d crm_assessment -c "GRANT ALL ON SCHEMA public TO crm_user; ALTER USER crm_user CREATEDB;"

# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

## Credenciales DEMO
- admin@crm.local / Password123!
- gerente@crm.local / Password123!
- evaluador@crm.local / Password123!

## IA
Configura `AI_PROVIDER`, `OPENAI_API_KEY` o `GEMINI_API_KEY` en `backend/.env`. Si no hay clave, se usan preguntas de respaldo.

## Pruebas
```bash
cd backend && npm test
cd frontend && npm test
```
