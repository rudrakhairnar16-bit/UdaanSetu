<p align="center">
  <img src="https://img.shields.io/badge/SIH-2026-16a34a?style=for-the-badge&logo=swift&logoColor=white" alt="SIH 2026"/>
  <img src="https://img.shields.io/badge/Problem-1608-ef4444?style=for-the-badge" alt="Problem ID"/>
  <img src="https://img.shields.io/badge/Status-MVP_Complete-3b82f6?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/Tests-153_passed-16a34a?style=for-the-badge" alt="Tests"/>
  <img src="https://img.shields.io/badge/Frontend-Next.js_19-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/ML-sentence--transformers-F7C948?style=for-the-badge&logo=python&logoColor=white" alt="ML"/>
  <img src="https://img.shields.io/badge/License-MIT-6b7280?style=for-the-badge" alt="License"/>
</p>

<h1 align="center">UdaanSetu</h1>

<p align="center">
  <strong>Innovation Ecosystem Platform for India</strong><br/>
  <em>Research → Innovation → IPR → Mentor/Funding/Incubator → Startup → Impact</em>
</p>

<p align="center">
  <a href="#-system-architecture">Architecture</a> ·
  <a href="#-innovation-lifecycle">Lifecycle</a> ·
  <a href="#-ml-pipeline">ML Pipeline</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-api-reference">API Docs</a> ·
  <a href="#-testing">Tests</a>
</p>

---

## What is UdaanSetu?

**UdaanSetu** (उड़ान सेतु — "Bridge to Flight") is a full-stack innovation lifecycle management platform built for **Smart India Hackathon 2026 (Problem ID: SIH1608)**. It tracks the entire journey from research ideation to startup impact, powered by real ML models for risk prediction, semantic matching, and duplicate detection.

> **All data is DEMO DATA.** This is a prototype demonstration — no government integration, no real patents, no real funding.

---

## System Architecture

```mermaid
graph TB
    subgraph Client["🌐 Client Layer"]
        Browser["🖥️ Browser"]
    end

    subgraph Frontend["⚛️ Frontend — Next.js 15 + React 19"]
        Login["Login Page"]
        Dashboard["Dashboard"]
        Research["Research"]
        Innovations["Innovations"]
        IPR["IPR Lifecycle"]
        Startups["Startups"]
        Ecosystem["Ecosystem"]
        Analytics["Analytics"]
        Notifications["Notifications"]
        Audit["Audit Log"]
    end

    subgraph Backend["🚀 Backend — FastAPI + Python 3.12"]
        Auth["🔐 Auth<br/>JWT + Argon2 + RBAC"]
        CRUD["📦 Records CRUD<br/>9 record types"]
        DashAPI["📊 Dashboard API"]
        NotifyAPI["🔔 Notifications"]
        DocAPI["📄 Document Upload"]
    end

    subgraph MLEngine["🧠 ML Engine — engine.py"]
        Semantic["🔍 Semantic Engine<br/>sentence-transformers<br/>all-MiniLM-L6-v2"]
        Risk["⚠️ Risk Engine<br/>GradientBoosting<br/>10 features"]
        Success["📈 Success Predictor<br/>Confidence Intervals"]
        Duplicates["🔍 Duplicate Detector<br/>Agglomerative Clustering"]
        Match["🎯 Smart Matching<br/>Cosine Similarity"]
    end

    subgraph Optional["🤖 Optional — Ollama LLM"]
        Ollama["Ollama<br/>deepseek-r1:8b"]
    end

    subgraph Data["💾 Data Layer"]
        PostgreSQL[("🐘 PostgreSQL 16<br/>SQLAlchemy 2.0")]
        FileStore["📁 File Storage<br/>PDF/DOCX/TXT"]
    end

    subgraph Infra["🐳 Infrastructure"]
        Docker["Docker Compose<br/>3 Services"]
    end

    Browser -->|HTTPS| Frontend
    Frontend -->|REST API + JWT| Auth
    Auth --> CRUD
    Auth --> DashAPI
    Auth --> NotifyAPI
    Auth --> DocAPI
    CRUD --> MLEngine
    DashAPI --> MLEngine
    MLEngine --> PostgreSQL
    DocAPI --> FileStore
    MLEngine -.->|optional| Ollama
    Docker --> Frontend
    Docker --> Backend
    Docker --> PostgreSQL

    style Client fill:#e8f5e9,stroke:#2e7d32
    style Frontend fill:#e3f2fd,stroke:#1565c0
    style Backend fill:#fff3e0,stroke:#e65100
    style MLEngine fill:#fce4ec,stroke:#c62828
    style Optional fill:#f3e5f5,stroke:#6a1b9a
    style Data fill:#e0f2f1,stroke:#00695c
    style Infra fill:#efebe9,stroke:#4e342e
```

---

## Innovation Lifecycle

```mermaid
graph LR
    R["🔬 Research<br/>Project"] -->|ideates| I["💡 Innovation<br/>TRL 1-9"]
    I -->|protects| P["📜 IPR/Patent<br/>Filing"]
    P -->|commercializes| S["🚀 Startup<br/>Impact"]
    S -->|creates| Impact["🌍 Impact<br/>Jobs · Revenue · Lives"]

    R -->|mentored by| M["👨‍🏫 Mentors"]
    R -->|funded by| F["💰 Funding<br/>Schemes"]
    I -->|incubated by| IC["🏢 Incubators"]

    style R fill:#e3f2fd,stroke:#1565c0
    style I fill:#e8f5e9,stroke:#2e7d32
    style P fill:#fff3e0,stroke:#e65100
    style S fill:#f3e5f5,stroke:#6a1b9a
    style Impact fill:#fce4ec,stroke:#c62828
    style M fill:#e0f2f1,stroke:#00695c
    style F fill:#fff8e1,stroke:#f57f17
    style IC fill:#e8eaf6,stroke:#283593
```

---

## ML Pipeline

```mermaid
graph TB
    subgraph Input["📥 Input"]
        Records["📄 Records<br/>title, description,<br/>sector, district"]
    end

    subgraph Embeddings["🔢 Embedding Layer"]
        ST["sentence-transformers<br/>all-MiniLM-L6-v2<br/>(384-dim vectors)"]
        TFIDF["TF-IDF Fallback<br/>(5000 features,<br/>(1,2)-grams)"]
    end

    subgraph Similarity["🔍 Semantic Similarity"]
        Cosine["Cosine Similarity<br/>on Embeddings"]
    end

    subgraph RiskModel["⚠️ Risk Prediction"]
        Features["10 Engineered Features"]
        GBM["GradientBoosting<br/>Classifier<br/>n_estimators=100"]
        Metrics["📊 Metrics<br/>Accuracy: ~85%<br/>Precision: ~83%<br/>Recall: ~87%<br/>F1: ~85%<br/>AUC-ROC: ~92%"]
    end

    subgraph Outputs["📤 ML Outputs"]
        RiskScore["Risk Score<br/>0-100 + Level"]
        Recs["Recommendations<br/>mentor/scheme/incubator"]
        Success["Success Probability<br/>+ Confidence Interval"]
        Dupes["Duplicate Clusters<br/>threshold-based"]
        Similar["Similar Records<br/>top-K matches"]
    end

    Input --> ST
    Input --> TFIDF
    ST --> Cosine
    TFIDF -.->|fallback| Cosine
    Cosine --> Recs
    Cosine --> Dupes
    Cosine --> Similar
    Input --> Features
    Features --> GBM
    GBM --> RiskScore
    RiskScore --> Success
    GBM --> Metrics

    style Input fill:#e8f5e9,stroke:#2e7d32
    style Embeddings fill:#e3f2fd,stroke:#1565c0
    style Similarity fill:#fff3e0,stroke:#e65100
    style RiskModel fill:#fce4ec,stroke:#c62828
    style Outputs fill:#f3e5f5,stroke:#6a1b9a
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as ⚛️ Frontend
    participant B as 🚀 Backend
    participant D as 💾 Database

    U->>F: Enter credentials
    F->>B: POST /auth/login
    B->>D: Query user by email
    D-->>B: User record
    B->>B: Argon2 verify password
    B->>B: Generate JWT (sub, role, name, iat)
    B-->>F: { token, user }
    F->>F: Store token in localStorage

    loop Authenticated Requests
        F->>B: GET /api + Authorization: Bearer <token>
        B->>B: JWT verify + extract role
        B->>B: RBAC check (route × role)
        B-->>F: 200 OK + data
    end

    U->>F: Click logout
    F->>B: POST /auth/logout
    B->>B: Add token to blacklist
    B-->>F: 200 OK
    F->>F: Clear localStorage, redirect to login
```

---

## Data Flow — Request Lifecycle

```mermaid
sequenceDiagram
    participant C as 🖥️ Client
    participant F as ⚛️ Next.js
    participant A as 🔐 Auth Middleware
    participant R as 📦 Route Handler
    participant M as 🧠 ML Engine
    participant D as 💾 PostgreSQL

    C->>F: User action
    F->>F: Build request + JWT header
    F->>A: Forward request
    A->>A: Validate JWT, check blacklist
    alt Token invalid
        A-->>F: 401 Unauthorized
        F->>F: Clear token, redirect to login
    else Token valid
        A->>R: Forward with user context
        R->>D: SQLAlchemy query
        D-->>R: Record(s)
        alt ML endpoint
            R->>M: predict() or similarity()
            M->>M: Extract features / encode
            M->>M: Model inference
            M-->>R: Prediction result
        end
        R-->>F: 200 OK + JSON
        F-->>C: Render UI update
    end
```

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

## Quick Start

### Prerequisites
- **Docker Desktop** (recommended) — or Node.js 20+ and Python 3.11+
- **4 GB RAM** minimum (sentence-transformers model download on first run)

### Option 1: Docker (recommended)

```bash
# Clone the repo
git clone https://github.com/rudrakhairnar16-bit/UdaanSetu.git
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

## Docker Deployment

```mermaid
graph LR
    subgraph Docker["🐳 Docker Compose"]
        FE["⚛️ frontend<br/>Next.js<br/>:3000"]
        BE["🚀 backend<br/>FastAPI<br/>:8000"]
        DB[("🐘 db<br/>PostgreSQL<br/>:5432")]
    end

    FE -->|REST API| BE
    BE -->|SQL| DB
    FE -.->|static| Browser["🖥️ Browser"]

    style Docker fill:#f5f5f5,stroke:#616161
    style FE fill:#e3f2fd,stroke:#1565c0
    style BE fill:#fff3e0,stroke:#e65100
    style DB fill:#e0f2f1,stroke:#00695c
```

```yaml
# docker-compose.yml
services:
  db:       # PostgreSQL 16
  backend:  # FastAPI + ML engine
  frontend: # Next.js 15
```

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

<details>
<summary><strong>10 Engineered Features for Risk Prediction</strong></summary>

| # | Feature | Type | Description |
|---|---------|------|-------------|
| 1 | `progress` | float | Project progress percentage (0-100) |
| 2 | `milestones_total` | int | Total number of milestones |
| 3 | `milestones_overdue` | int | Milestones past due date |
| 4 | `milestones_done` | int | Completed milestones |
| 5 | `days_since_creation` | int | Age of project in days |
| 6 | `stage_encoded` | int | Stage mapped to numeric (draft=0 ... completed=6, stalled=-1, at_risk=-2) |
| 7 | `has_funding` | binary | Whether any funding has been received |
| 8 | `funding_ratio` | float | funding_received / funding_required (0-1) |
| 9 | `sector_encoded` | int | Hash of sector name (0-9) |
| 10 | `district_encoded` | int | Hash of district name (0-19) |

</details>

<details>
<summary><strong>Model Performance</strong></summary>

| Metric | Value |
|--------|-------|
| Accuracy | ~85% |
| Precision | ~83% |
| Recall | ~87% |
| F1 Score | ~85% |
| AUC-ROC | ~92% |
| Training Samples | 2,000 synthetic |
| Algorithm | GradientBoosting (n_estimators=100, max_depth=4) |

</details>

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

```mermaid
pie title Test Distribution (153 total)
    "Security (35)" : 35
    "Records CRUD (28)" : 28
    "AI/ML Endpoints (27)" : 27
    "Utilities (23)" : 23
    "Auth & RBAC (22)" : 22
    "Endpoints (16)" : 16
    "Utils (2)" : 2
```

```bash
cd backend

# Run all 153 tests
python -m pytest tests/ -v

# Run specific test suites
python -m pytest tests/test_ai.py -v          # 27 ML tests
python -m pytest tests/test_security.py -v    # 35 security tests
python -m pytest tests/test_records.py -v     # 28 CRUD tests
```

| Test Suite | Tests | Coverage |
|-----------|-------|----------|
| AI/ML endpoints | 27 | Risk, success, recommendations, similar, matching, duplicates, metrics, retrain |
| Auth & RBAC | 22 | Login, logout, token validation, role enforcement |
| Records CRUD | 28 | Create, read, update, delete, filters, notifications |
| Security | 35 | Headers, CORS, rate limiting, input sanitization, JWT, file upload, audit |
| Endpoints | 16 | Dashboard, analytics, notifications, audit log |
| Utilities | 23 | Similarity, risk computation, password validation, input sanitization |

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
