# UdaanSetu — SIH1608 MVP

**Innovation Ecosystem Platform**: Research → Innovation → IPR → Mentor/Funding/Incubator → Startup → Impact

> All seeded records are conspicuously **DEMO DATA**. The app makes no claim to use government data, real funding, real patents, or verified official statistics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | FastAPI, Python 3.11 |
| Database | PostgreSQL 16 + SQLAlchemy 2.0 |
| Auth | JWT with RBAC (5 roles) |
| AI/ML | sentence-transformers (all-MiniLM-L6-v2), scikit-learn (GradientBoosting), TF-IDF fallback |
| LLM | Ollama (`deepseek-r1:8b`) with deterministic fallback |
| Deploy | Docker Compose |

## Quick Start

### Prerequisites
- Docker Desktop (recommended)
- Node.js 20+ (for local dev)
- Python 3.11+ (for local dev)

### Option 1: Docker (recommended)

```powershell
Copy-Item .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs
- Database: localhost:5432

### Option 2: Local Development

**Backend:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL for local PostgreSQL
$env:DATABASE_URL="postgresql+psycopg://udaansetu:udaansetu@localhost:5432/udaansetu"
$env:SECRET_KEY="dev-secret-key"
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```powershell
cd frontend
npm install
$env:NEXT_PUBLIC_API_URL="http://localhost:8000"
npm run dev
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@udaansetu.demo | Demo@123 |
| Researcher | researcher@udaansetu.demo | Demo@123 |
| Researcher 2 | researcher2@udaansetu.demo | Demo@123 |
| Mentor | mentor@udaansetu.demo | Demo@123 |
| Investor | investor@udaansetu.demo | Demo@123 |
| Incubator | incubator@udaansetu.demo | Demo@123 |

## Main API Endpoints

### Auth
- `POST /auth/login` — Login, returns JWT
- `POST /auth/logout` — Revoke token
- `GET /auth/me` — Current user profile
- `GET /auth/users` — List all users (admin)

### Records CRUD
- `GET /records?kind=&district=&sector=&q=` — List records with filters
- `GET /records/{id}` — Get single record
- `POST /records/{kind}` — Create record (kind: research, innovation, ipr, startup, milestone, mentor, scheme, incubator, funding_request)
- `PATCH /records/{id}` — Update record
- `DELETE /records/{id}` — Delete record (admin)

### Dashboard
- `GET /dashboard` — Summary counts, at-risk projects, recent activity, pipeline

### AI/ML Features
- `GET /ai/risk/{research_id}` — ML risk score (GradientBoosting + 10 features)
- `GET /ai/success/{research_id}` — Success probability with confidence intervals
- `GET /ai/recommendations/{innovation_id}` — Semantic mentor/scheme/incubator recommendations
- `GET /ai/similar/{record_id}` — Sentence-transformer similarity matching
- `GET /ai/match/{innovation_id}` — Smart semantic matching
- `GET /ai/duplicates` — NLP duplicate detection (agglomerative clustering)
- `GET /ai/metrics` — ML model performance metrics (admin)
- `POST /ai/retrain` — Retrain all ML models (admin)

### Analytics
- `GET /analytics/overview` — Platform-wide metrics
- `GET /analytics/districts` — District-level breakdown

### Notifications
- `GET /notifications` — User notifications
- `PATCH /notifications/{id}/read` — Mark as read
- `POST /notifications/read-all` — Mark all as read

### Audit Log
- `GET /audit` — System audit trail (admin)

### Documents
- `POST /documents/upload` — Upload PDF/DOCX/TXT with text extraction

## Folder Structure

```
UdaanSetu/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, models, routes, seed data
│   │   └── ml/
│   │       ├── __init__.py
│   │       └── engine.py        # ML engine (SemanticEngine, RiskEngine, SuccessPredictor, DuplicateDetector)
│   ├── tests/
│   │   ├── conftest.py          # Test fixtures (SQLite in-memory)
│   │   ├── test_ai.py           # 27 ML endpoint tests
│   │   ├── test_auth.py         # 22 auth/RBAC tests
│   │   ├── test_records.py      # 28 CRUD tests
│   │   ├── test_security.py     # 35 security tests
│   │   ├── test_endpoints.py    # 16 dashboard/analytics tests
│   │   └── test_utils.py        # 23 utility tests
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Login page
│   │   ├── lib/
│   │   │   ├── api.ts           # API client
│   │   │   ├── auth.tsx         # Auth context
│   │   │   └── types.ts         # TypeScript types (includes ML types)
│   │   └── (app)/
│   │       ├── layout.tsx       # App layout with sidebar
│   │       ├── dashboard/       # Dashboard with ML risk details
│   │       ├── research/        # Research projects
│   │       ├── innovations/     # Innovations with semantic AI
│   │       ├── ipr/             # IPR/Patent lifecycle
│   │       ├── startups/        # Startups with smart matching
│   │       ├── ecosystem/       # Mentors/Schemes/Incubators
│   │       ├── analytics/       # Analytics + ML model metrics
│   │       ├── notifications/   # User notifications
│   │       ├── audit/           # Audit log (admin)
│   │       └── settings/        # Platform settings
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── .env
├── .gitignore
└── README.md
```

## Features Implemented

1. **JWT Auth + RBAC** — 5 roles with route-level access control
2. **Research Projects** — Full CRUD with institution, sector, district, progress, funding
3. **Milestones** — Linked to projects, due dates, overdue detection
4. **Innovations** — Linked to projects, readiness tracking, AI recommendations
5. **IPR/Patents** — Full lifecycle: Idea → Screening → Filed → Examination → Granted
6. **Startups** — Impact metrics: jobs, users, revenue, descriptions
7. **Ecosystem** — Mentors, funding schemes, incubators, funding requests
8. **AI/ML Features** — Real ML pipeline:
   - **Risk Prediction**: GradientBoosting classifier trained on 2000 synthetic samples, 10 engineered features (progress, milestones, funding, stage, sector, district)
   - **Semantic Search**: sentence-transformers (all-MiniLM-L6-v2) with TF-IDF fallback
   - **Success Prediction**: Confidence intervals via bootstrap approximation, comparable project analysis
   - **Duplicate Detection**: Agglomerative clustering on semantic embeddings
   - **Smart Matching**: Mentor/scheme/incubator recommendations using cosine similarity on embeddings
   - **Model Metrics**: Accuracy, Precision, Recall, F1, AUC-ROC exposed via admin API
9. **Analytics** — District-level breakdown, sector distribution, key metrics
10. **Notifications** — System notifications with read/unread tracking
11. **Audit Log** — Admin-only action trail
12. **Document Upload** — PDF, DOCX, TXT with best-effort text extraction
13. **API Documentation** — Auto-generated at `/docs`

## Optional: AI with Ollama

1. Install Ollama: https://ollama.ai
2. Pull model: `ollama pull deepseek-r1:8b`
3. Set in `.env`:
   ```
   OLLAMA_ENABLED=true
   OLLAMA_URL=http://localhost:11434
   ```
4. The system always has deterministic fallbacks — works without Ollama

## Important Notes

- **All data is DEMO DATA** — clearly marked on every seeded record
- **No government integration** — this is a prototype demonstration
- **No real patents or funding** — representative examples only
- **No WebSockets** — REST-only as per SIH prototype requirements
- Built for SIH 2026 (36-hour prototype timeframe)
