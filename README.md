<p align="center">
  <img src="https://img.shields.io/badge/SIH-2026-16a34a?style=for-the-badge&logo=swift&logoColor=white" alt="SIH 2026"/>
  <img src="https://img.shields.io/badge/Problem-1608-ef4444?style=for-the-badge" alt="Problem ID"/>
  <img src="https://img.shields.io/badge/Status-MVP_Complete-3b82f6?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/Tests-153_passed-16a34a?style=for-the-badge" alt="Tests"/>
  <img src="https://img.shields.io/badge/License-MIT-6b7280?style=for-the-badge" alt="License"/>
</p>

<h1 align="center">UdaanSetu</h1>

<p align="center">
  <strong>Innovation Ecosystem Platform for India</strong><br/>
  Research → Innovation → IPR → Mentor/Funding/Incubator → Startup → Impact
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-live-demo">Live Demo</a> ·
  <a href="#-api-documentation">API Docs</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-testing">Tests</a>
</p>

---

## What is UdaanSetu?

UdaanSetu (उड़ान सेतु — "Bridge to Flight") is a full-stack innovation lifecycle management platform built for **Smart India Hackathon 2026 (Problem ID: SIH1608)**. It tracks the entire journey from research ideation to startup impact, powered by real ML models for risk prediction, semantic matching, and duplicate detection.

> **All data is DEMO DATA.** This is a prototype demonstration — no government integration, no real patents, no real funding.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15, React 19, TypeScript | 10-page SPA with real-time AI panels |
| **Backend** | FastAPI, Python 3.12 | REST API with 25+ endpoints |
| **Database** | PostgreSQL 16, SQLAlchemy 2.0 | Relational data with ORM |
| **Auth** | JWT + Argon2, RBAC | 5 roles with route-level access |
| **ML Pipeline** | sentence-transformers, scikit-learn | Semantic search, risk prediction |
| **Risk Model** | GradientBoosting (2000 synthetic samples) | 10-feature risk classifier |
| **Embeddings** | all-MiniLM-L6-v2 (384-dim) | Semantic similarity |
| **LLM (Optional)** | Ollama + deepseek-r1:8b | Natural language insights |
| **Deployment** | Docker Compose | 3-service orchestration |
| **Testing** | pytest (153 tests) | AI, auth, CRUD, security, utils |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │Dashboard │ │Research  │ │Innovations│ │Analytics │  ...     │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       └─────────────┼───────────┼─────────────┘                │
│                     ▼           ▼                               │
│              ┌─────────────────────┐                           │
│              │   API Client (JWT)  │                           │
│              └─────────┬───────────┘                           │
└────────────────────────┼───────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────┼───────────────────────────────────────┐
│                   Backend (FastAPI)                             │
│  ┌──────────┐ ┌───────────────┐ ┌──────────────┐              │
│  │Auth/RBAC │ │ Records CRUD  │ │  Dashboard   │              │
│  └────┬─────┘ └───────┬───────┘ └──────┬───────┘              │
│       │               │                │                       │
│  ┌────▼───────────────▼────────────────▼───────┐              │
│  │              ML Engine (engine.py)           │              │
│  │  ┌────────────┐ ┌──────────┐ ┌────────────┐│              │
│  │  │ Semantic   │ │  Risk    │ │  Duplicate ││              │
│  │  │ Engine     │ │  Engine  │ │  Detector  ││              │
│  │  │(MiniLM-L6) │ │(GBM 10f) │ │(Agglom.)  ││              │
│  │  └────────────┘ └──────────┘ └────────────┘│              │
│  └─────────────────────────────────────────────┘              │
│                         │                                      │
│              ┌──────────▼──────────┐                          │
│              │   PostgreSQL (SQLA)  │                          │
│              └─────────────────────┘                          │
└───────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- **Docker Desktop** (recommended) — or Node.js 20+ and Python 3.11+
- **4 GB RAM** minimum (sentence-transformers model download on first run)

### Option 1: Docker (recommended)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/UdaanSetu.git
cd UdaanSetu

# Configure environment
cp .env.example .env

# Start all services
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Docs | http://localhost:8000/docs |
| Database | localhost:5432 |

### Option 2: Local Development

<details>
<summary><strong>Backend Setup</strong></summary>

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Configure (edit .env or set env vars)
export DATABASE_URL="postgresql+psycopg://udaansetu:udaansetu@localhost:5432/udaansetu"
export SECRET_KEY="your-dev-secret"

# Run server
uvicorn app.main:app --reload --port 8000
```
</details>

<details>
<summary><strong>Frontend Setup</strong></summary>

```bash
cd frontend
npm install

# Configure
export NEXT_PUBLIC_API_URL="http://localhost:8000"

# Run dev server
npm run dev
```
</details>

---

## Demo Credentials

All passwords are `Demo@123`. Each role sees different parts of the UI.

| Role | Email | Access |
|------|-------|--------|
| **Admin** | `admin@udaansetu.demo` | Everything + user management + audit log + ML retrain |
| **Researcher** | `researcher@udaansetu.demo` | Research, innovations, milestones, IPR |
| **Mentor** | `mentor@udaansetu.demo` | Mentoring assignments, ecosystem |
| **Investor** | `investor@udaansetu.demo` | Funding requests, startups, ecosystem |
| **Incubator** | `incubator@udaansetu.demo` | Incubation pipeline, startups, ecosystem |

---

## Features

### Core Platform
- **JWT Authentication** — Secure login with Argon2 password hashing, token blacklist, refresh
- **Role-Based Access Control** — 5 roles (admin, researcher, mentor, investor, incubator) with route-level enforcement
- **Research Projects** — Full CRUD with institution, sector, district, progress tracking, funding requirements
- **Milestones** — Linked to projects, due dates, overdue detection, progress percentage
- **Innovations** — TRL (Technology Readiness Level) tracking, linked to parent research
- **IPR/Patents** — Full lifecycle: Idea → Screening → Filed → Examination → Granted
- **Startups** — Impact metrics: jobs created, users/farmers reached, revenue, descriptions
- **Ecosystem** — Mentors, government schemes, incubators, funding requests
- **Notifications** — System notifications with read/unread tracking, auto-notify on stage changes
- **Audit Log** — Admin-only action trail with actor, action, entity, timestamp
- **Document Upload** — PDF, DOCX, TXT with best-effort text extraction

### AI/ML Pipeline

| Component | Algorithm | Details |
|-----------|-----------|---------|
| **Risk Prediction** | GradientBoosting Classifier | 10 features, 2000 synthetic training samples, cross-validated |
| **Semantic Search** | sentence-transformers (all-MiniLM-L6-v2) | 384-dimensional embeddings, cosine similarity |
| **Success Prediction** | Risk inversion + confidence intervals | Bootstrap approximation, comparable project analysis |
| **Duplicate Detection** | Agglomerative Clustering | Distance threshold on semantic embeddings |
| **Smart Matching** | Cosine similarity on embeddings | Mentor/scheme/incubator recommendations |
| **TF-IDF Fallback** | TfidfVectorizer + cosine | Automatic fallback when sentence-transformers unavailable |

**10 Engineered Features for Risk Prediction:**
`progress`, `milestones_total`, `milestones_overdue`, `milestones_done`, `days_since_creation`, `stage_encoded`, `has_funding`, `funding_ratio`, `sector_encoded`, `district_encoded`

**Model Performance (trained on synthetic data):**
- Accuracy: ~85% | Precision: ~83% | Recall: ~87% | F1: ~85% | AUC-ROC: ~92%

### Analytics Dashboard
- Platform-wide metrics (total records, avg progress, funding, revenue, jobs, farmers)
- District-level breakdown with filterable table
- Sector distribution with bar charts
- Record type distribution
- ML model performance metrics (accuracy, precision, recall, F1, AUC-ROC)

---

## API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | — | Login, returns JWT |
| `POST` | `/auth/logout` | JWT | Revoke token |
| `GET` | `/auth/me` | JWT | Current user profile |
| `GET` | `/auth/users` | Admin | List all users |

### Records
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/records?kind=&district=&sector=&q=` | JWT | List with filters |
| `GET` | `/records/{id}` | JWT | Get single record |
| `POST` | `/records/{kind}` | JWT | Create (research, innovation, ipr, startup, milestone, mentor, scheme, incubator, funding_request) |
| `PATCH` | `/records/{id}` | Owner/Admin | Update |
| `DELETE` | `/records/{id}` | Admin | Delete |

### AI/ML
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/ai/risk/{research_id}` | JWT | GradientBoosting risk score with feature importance |
| `GET` | `/ai/success/{research_id}` | JWT | Success probability + confidence interval |
| `GET` | `/ai/recommendations/{innovation_id}` | JWT | Semantic mentor/scheme/incubator recommendations |
| `GET` | `/ai/similar/{record_id}` | JWT | Sentence-transformer similarity search |
| `GET` | `/ai/match/{innovation_id}` | JWT | Smart semantic matching |
| `GET` | `/ai/duplicates?threshold=75` | JWT | NLP duplicate detection via clustering |
| `GET` | `/ai/metrics` | Admin | Model performance metrics |
| `POST` | `/ai/retrain` | Admin | Retrain all ML models |

### Dashboard & Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/dashboard` | JWT | Summary counts, at-risk projects, pipeline |
| `GET` | `/analytics/overview` | JWT | Platform-wide metrics |
| `GET` | `/analytics/districts` | JWT | District-level breakdown |

### Other
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notifications` | JWT | User notifications |
| `PATCH` | `/notifications/{id}/read` | JWT | Mark as read |
| `POST` | `/notifications/read-all` | JWT | Mark all as read |
| `GET` | `/audit` | Admin | System audit trail |
| `POST` | `/documents/upload` | JWT | Upload PDF/DOCX/TXT |
| `GET` | `/health` | — | Health check |

---

## Project Structure

```
UdaanSetu/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app (1088 lines) — models, routes, seed data
│   │   └── ml/
│   │       └── engine.py        # ML engine (633 lines) — 5 components
│   ├── tests/                   # 153 tests across 7 files
│   │   ├── conftest.py          # Fixtures (SQLite in-memory, clean between tests)
│   │   ├── test_ai.py           # 27 tests — ML endpoints
│   │   ├── test_auth.py         # 22 tests — JWT + RBAC
│   │   ├── test_records.py      # 28 tests — CRUD operations
│   │   ├── test_security.py     # 35 tests — headers, CORS, rate limit, upload
│   │   ├── test_endpoints.py    # 16 tests — dashboard, analytics, notifications
│   │   └── test_utils.py        # 23 tests — similarity, risk, password, sanitize
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Login page
│   │   ├── lib/
│   │   │   ├── api.ts           # API client with JWT management
│   │   │   ├── auth.tsx         # Auth context provider
│   │   │   └── types.ts         # TypeScript interfaces
│   │   └── (app)/               # 10 authenticated pages
│   │       ├── dashboard/       # Pipeline flow + ML risk cards
│   │       ├── research/        # Research project management
│   │       ├── innovations/     # Innovations + semantic AI panel
│   │       ├── ipr/             # IPR lifecycle visualization
│   │       ├── startups/        # Startups + impact metrics + smart matching
│   │       ├── ecosystem/       # Mentors, schemes, incubators, funding
│   │       ├── analytics/       # Analytics + ML model metrics dashboard
│   │       ├── notifications/   # Notification center
│   │       ├── audit/           # Admin audit log
│   │       └── settings/        # Platform settings
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml           # 3-service orchestration
├── .env.example                 # Environment template
└── README.md
```

---

## Testing

```bash
cd backend

# Run all 153 tests
python -m pytest tests/ -v

# Run specific test suites
python -m pytest tests/test_ai.py -v          # 27 ML tests
python -m pytest tests/test_security.py -v    # 35 security tests
python -m pytest tests/test_records.py -v     # 28 CRUD tests
```

**Test Coverage:**
- AI/ML endpoints (27) — risk, success prediction, recommendations, similar, matching, duplicates, metrics, retrain
- Auth & RBAC (22) — login, logout, token validation, role enforcement
- Records CRUD (28) — create, read, update, delete, filters, notifications
- Security (35) — headers, CORS, rate limiting, input sanitization, JWT, file upload, audit
- Endpoints (16) — dashboard, analytics, notifications, audit log
- Utilities (23) — similarity, risk computation, password validation, input sanitization

---

## Optional: LLM Integration with Ollama

For natural language AI insights (optional — app works without it):

```bash
# 1. Install Ollama
# https://ollama.ai

# 2. Pull the model
ollama pull deepseek-r1:8b

# 3. Enable in .env
OLLAMA_ENABLED=true
OLLAMA_URL=http://localhost:11434
```

The system uses **deterministic fallbacks** when Ollama is unavailable — no functionality is lost.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+psycopg://udaansetu:udaansetu@db:5432/udaansetu` | PostgreSQL connection string |
| `SECRET_KEY` | `dev-only-change-me-in-production` | JWT signing secret |
| `OLLAMA_ENABLED` | `false` | Enable Ollama LLM |
| `OLLAMA_URL` | `http://host.docker.internal:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `deepseek-r1:8b` | Model to use |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Frontend → Backend URL |

---

## Important Notes

- **All data is DEMO DATA** — clearly marked on every seeded record
- **No government integration** — this is a prototype demonstration
- **No real patents or funding** — representative examples only
- **No WebSockets** — REST-only as per SIH prototype requirements
- **ML models train on first request** — initial load takes ~10 seconds
- Built for **Smart India Hackathon 2026** (36-hour prototype timeframe)

---

## License

This project is licensed under the MIT License.

---

<p align="center">
  Built with passion for India's innovation ecosystem
</p>
