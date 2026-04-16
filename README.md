# CareerCompass

AI-powered career development platform that helps students discover opportunities, get matched with relevant roles, and improve their applications through intelligent AI agents.

## Key Differentiators

### 1. Multi-Agent AI System
Unlike basic job boards, CareerCompass uses 5 specialized AI agents that work together:
- **Scout Agent** - Discovers opportunities across the web
- **Analyzer Agent** - Parses and structures raw opportunity data
- **Matching Agent** - Smart student-opportunity matching with scoring
- **Audit Agent** - Resume evaluation and cover letter generation
- **Learning Agent** - Improves recommendations based on user behavior

### 2. Intelligent Matching
- Semantic skill matching beyond keyword search
- CGPA-weighted scoring for eligibility
- Personalized recommendations based on career goals

### 3. Application Audit System
- Score-based resume evaluation (0-100)
- Gap identification with improvement suggestions
- AI-generated tailored cover letters

### 4. End-to-End Career Pipeline
- Profile management → Opportunity search → Matching → Application audit

## How to Use

### Prerequisites
- Python 3.10+ (for backend)
- Node.js 18+ (for frontend)
- API keys (see below)

### Quick Start

**1. Clone the repository**
```bash
git clone https://github.com/Abdur-rahman-01/CareerCompass.git
cd CareerCompass
```

**2. Backend Setup**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your API keys (see API Keys section below)
uvicorn app.main:app --reload
# Backend runs at http://localhost:8000
```

**3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

### API Keys Required

Create `backend/.env` with:
```env
# Required for AI features (get free key at https://litellm.ai)
GEMINI_API_KEY=your_gemini_api_key

# Optional - for web scraping opportunities
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

### Features Walkthrough

| Feature | URL | Description |
|---------|-----|-------------|
| **Home** | `/` | Landing page with overview |
| **Dashboard** | `/dashboard` | View matched opportunities |
| **Profile** | `/profile` | Manage your student profile |
| **Resume** | `/resume` | Upload & analyze resume |
| **Audit** | `/audit` | Get application feedback |

### Using the Platform

1. **Create Profile** - Go to `/profile` and fill in your details (name, year, branch, CGPA, skills, goals)

2. **Search Opportunities** - Use the dashboard to find internships/jobs that match your profile

3. **Get Matched** - The AI calculates a match score based on your skills vs requirements

4. **Audit Your Application** - Select an opportunity to get:
   - Match score (0-100)
   - Strengths & gaps analysis
   - AI-generated cover letter

5. **Track & Improve** - Use feedback to improve your profile and applications

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, LiteLLM, CrewAI concepts
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: SQLite

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET/POST/PUT | `/api/profile` | User profile management |
| GET/POST | `/api/opportunities` | Opportunity CRUD |
| POST | `/api/ai/search` | AI-powered opportunity search |
| POST | `/api/ai/match` | Match opportunities to profile |
| POST | `/api/ai/audit` | Audit application readiness |
| POST | `/api/ai/cover-letter` | Generate cover letter |

## Project Structure

```
CareerCompass/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── services/     # AI agents
│   │   ├── models.py     # DB models
│   │   ├── schemas.py    # Pydantic schemas
│   │   └── main.py       # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # UI components
│   │   └── context/      # Auth context
│   └── package.json
└── README.md
```