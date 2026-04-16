# DevArena

AI-powered competitive programming platform.

## Setup

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure .env with your API keys
uvicorn app.main:app --reload
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, LiteLLM, CrewAI, Firecrawl
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Database**: SQLite (devarena.db)