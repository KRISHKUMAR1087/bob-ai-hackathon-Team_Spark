# PortsPilot AI — Source Code Directory

This directory contains the complete source code for **PortsPilot AI** (Port Operations Command Center), organized as a unified monorepo.

---

## Directory Layout

```
src/
├── frontend/                     # Modern React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/           # Reusable maritime UI cards, metrics, Gantt boards
│   │   ├── context/              # Synchronized OperationsContext (global reactive state)
│   │   ├── pages/                # 15+ operational screens (Dashboard, Vessels, Berths, Optimizer, Simulator, etc.)
│   │   ├── services/             # API client, PortOperationsService, Gemini Copilot proxy
│   │   └── types/                # TypeScript interfaces for all operational domain entities
│   ├── package.json              # Frontend dependencies and build scripts
│   ├── tailwind.config.js        # Deep maritime color tokens & typography
│   └── vite.config.ts            # Vite 6 config with backend proxy
│
├── backend/                      # Dual-Engine Backend Architecture
│   ├── app/                      # Python FastAPI Engine
│   │   ├── api/routes.py         # Endpoints for congestion forecast, BAP/CAP optimization, shift planning
│   │   ├── models/               # Pydantic validation schemas
│   │   └── services/             # Algorithmic solvers (congestion predictor, routing intelligence)
│   ├── src/                      # TypeScript / Hono API Gateway
│   │   ├── routes/               # Modular REST endpoints (auth, operations, agent, copilot, uploads)
│   │   ├── services/             # Database access and business orchestration
│   │   └── index.ts              # Server bootstrap and CORS configuration
│   ├── prisma/                   # PostgreSQL schema and database seed scripts
│   ├── tests/                    # Pytest test suite (10/10 automated tests)
│   ├── package.json              # Node.js backend dependencies
│   └── requirements.txt          # Python engine dependencies
│
├── 02-supabase-tables-and-rls.sql # Supabase PostgreSQL relational schema & RLS policies
├── 03-supabase-seed-demo-data.sql # Maritime operations seed dataset
├── .env.example                  # Consolidated environment variable template
└── README.md                     # This file
```

---

## Quick Reference

- **Frontend Development:**
  ```bash
  cd frontend
  npm install
  npm run dev      # http://localhost:5173
  ```

- **Backend API (Node / Hono):**
  ```bash
  cd backend
  npm install
  npm run dev      # http://localhost:3001
  ```

- **Python Optimization Engine (FastAPI):**
  ```bash
  cd backend
  pip install -r requirements.txt
  python -m uvicorn app.main:app --port 8000
  ```
