<p align="center">
  <img src="https://img.shields.io/badge/SIH-2026-16a34a?style=for-the-badge&logo=swift&logoColor=white" alt="SIH 2026"/>
  <img src="https://img.shields.io/badge/Problem-1608-ef4444?style=for-the-badge" alt="Problem ID"/>
  <img src="https://img.shields.io/badge/Status-Production_Proto-3b82f6?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/Tests-153_passed-16a34a?style=for-the-badge" alt="Tests"/>
  <img src="https://img.shields.io/badge/Frontend-Next.js_19-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/ML-sentence--transformers-F7C948?style=for-the-badge&logo=python&logoColor=white" alt="ML"/>
  <img src="https://img.shields.io/badge/Terraform-AWS-7B42BC?style=for-the-badge&logo=terraform&logoColor=white" alt="Terraform"/>
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

> **All data is DEMO DATA.** This is a production-grade prototype — government API integrations use mock endpoints ready for real API swap-in.

---

## System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser["Browser"]
    end

    subgraph Frontend["Frontend — Next.js 15 + React 19"]
        Login["Login"]
        Dashboard["Dashboard"]
        Research["Research"]
        Innovations["Innovations"]
        IPR["IPR"]
        Startups["Startups"]
        Ecosystem["Ecosystem"]
        Government["Govt APIs"]
        Analytics["Analytics"]
        Profile["Profile"]
        Notifications["Notifications"]
        Audit["Audit Log"]
    end

    subgraph Backend["Backend — FastAPI + Python 3.12"]
        Auth["Auth — JWT + Argon2 + RBAC"]
        CRUD["Records CRUD — 9 types"]
        GovAPIs["Government APIs — 5 services"]
        MLEndpoints["ML Endpoints"]
        DashboardAPI["Dashboard API"]
    end

    subgraph MLEngine["ML Engine"]
        Semantic["Semantic Engine — sentence-transformers"]
        Risk["Risk Engine — GradientBoosting"]
        Success["Success Predictor"]
        Duplicates["Duplicate Detector"]
        Registry["Model Registry"]
        Drift["Drift Detector"]
        Feedback["Feedback Store"]
    end

    subgraph GovServices["Government Services"]
        Aadhaar["Aadhaar eKYC"]
        DigiLocker["DigiLocker"]
        StartupIndia["Startup India"]
        IPIndia["IP India"]
        ONDC["ONDC"]
    end

    subgraph Data["Data Layer"]
        PostgreSQL[("PostgreSQL 16")]
        Redis[("Redis")]
        FileStore["File Storage"]
    end

    subgraph Infra["Infrastructure"]
        Docker["Docker Compose"]
        GitHubActions["GitHub Actions CI/CD"]
        Terraform["Terraform — AWS ECS"]
    end

    Browser --> Frontend
    Frontend --> Auth
    Auth --> CRUD
    Auth --> GovAPIs
    Auth --> MLEndpoints
    Auth --> DashboardAPI
    GovAPIs --> GovServices
    MLEndpoints --> MLEngine
    CRUD --> PostgreSQL
    DashboardAPI --> PostgreSQL
    MLEngine --> PostgreSQL
    Docker --> Frontend
    Docker --> Backend
    Docker --> PostgreSQL
```

---

## Quick Start

### Prerequisites
- **Docker Desktop** (recommended) — or Node.js 20+ and Python 3.11+
- **4 GB RAM** minimum (sentence-transformers model download on first run)

### Option 1: Docker (recommended)

```bash
git clone https://github.com/rudrakhairnar16-bit/UdaanSetu.git
cd UdaanSetu
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| API Docs | http://localhost:8080/docs |
| Database | localhost:5433 |

### Option 2: Local Development

<details>
<summary><strong>Backend Setup</strong></summary>

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
export DATABASE_URL="postgresql+psycopg://udaansetu:udaansetu@localhost:5432/udaansetu"
export SECRET_KEY="your-dev-secret"
uvicorn app.main:app --reload --port 8000
```
</details>

<details>
<summary><strong>Frontend Setup</strong></summary>

```bash
cd frontend
npm install
export NEXT_PUBLIC_API_URL="http://localhost:8000"
npm run dev
```
</details>

---

## Features

### Core Platform (18 pages)
- **JWT Authentication** — Argon2 hashing, token blacklist, refresh
- **RBAC** — 5 roles (admin, researcher, mentor, investor, incubator)
- **Research Projects** — CRUD, milestones, progress, funding
- **Innovations** — TRL tracking, AI recommendations, linked research
- **IPR/Patents** — Full lifecycle: Idea → Filed → Granted
- **Startups** — Impact metrics, smart matching, jobs/revenue
- **Ecosystem** — Mentors, schemes, incubators, funding requests
- **Government APIs** — Aadhaar eKYC, DigiLocker, Startup India, IP India, ONDC
- **Analytics** — recharts BarChart + PieChart, ML model metrics
- **Impact Dashboard** — Sector/district breakdowns, metrics
- **Profile** — Edit name, district, org, change password
- **Notifications** — Read/unread, auto-notify on stage changes
- **Audit Log** — Admin-only action trail
- **Document Upload** — PDF/DOCX/TXT

### AI/ML Pipeline

| Component | Algorithm | Details |
|-----------|-----------|---------|
| **Risk Prediction** | GradientBoosting | 10 features, 2000 samples, cross-validated |
| **Semantic Search** | sentence-transformers (MiniLM-L6-v2) | 384-dim embeddings, cosine similarity |
| **Success Prediction** | Risk inversion + confidence intervals | Bootstrap CI |
| **Duplicate Detection** | Agglomerative Clustering | Distance threshold |
| **Smart Matching** | Cosine similarity | Mentor/scheme/incubator recs |
| **Model Registry** | Version tracking | Register/promote/deprecate |
| **Drift Detection** | PSI + KS approximation | Prediction + feature drift |
| **Feedback Loop** | User corrections | Accuracy tracking |

### Government Integrations (5 services)

| Service | Endpoints | Status |
|---------|-----------|--------|
| **Aadhaar eKYC** | verify, send-otp, verify-otp | Mock (ready for UIDAI API) |
| **DigiLocker** | verify, list-documents, fetch | Mock (ready for NSDL API) |
| **Startup India** | verify, register, benefits, recent | Mock (ready for DPIIT API) |
| **IP India** | verify, search, publication, costs | Mock (ready for IP India API) |
| **ONDC** | verify, search, products, register-seller | Mock (ready for ONDC API) |

### DevOps

| Component | Details |
|-----------|---------|
| **CI/CD** | GitHub Actions — test, security scan, build, deploy |
| **IaC** | Terraform — VPC, ECR, RDS, Redis, ECS, CloudFront, ALB |
| **Monitoring** | JSON structured logging, Prometheus metrics, request tracing |
| **Security** | Trivy scan, Bandit SAST, CSP/HSTS headers, non-root Docker |

---

## API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | — | Login, returns JWT |
| `POST` | `/auth/register` | — | Create account |
| `POST` | `/auth/logout` | JWT | Revoke token |
| `GET` | `/auth/me` | JWT | Current user |
| `PATCH` | `/auth/me` | JWT | Update profile |
| `POST` | `/auth/change-password` | JWT | Change password |
| `GET` | `/auth/users` | Admin | List all users |

### Records
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/records?kind=&district=&sector=&q=` | JWT | List with filters |
| `GET` | `/records/{id}` | JWT | Get single record |
| `POST` | `/records/{kind}` | JWT | Create record |
| `PATCH` | `/records/{id}` | Owner/Admin | Update record |
| `DELETE` | `/records/{id}` | Admin | Delete record |

### AI/ML
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/ai/risk/{id}` | JWT | Risk score + feature importance |
| `GET` | `/ai/success/{id}` | JWT | Success probability + CI |
| `GET` | `/ai/recommendations/{id}` | JWT | Semantic recommendations |
| `GET` | `/ai/similar/{id}` | JWT | Similar records |
| `GET` | `/ai/match/{id}` | JWT | Smart matching |
| `GET` | `/ai/duplicates` | JWT | Duplicate clusters |
| `GET` | `/ai/metrics` | Admin | Model performance |

### ML Production
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/ml/feedback` | JWT | Submit prediction feedback |
| `GET` | `/ml/feedback/accuracy` | JWT | Feedback accuracy metrics |
| `GET` | `/ml/drift/status` | JWT | Drift detection status |
| `GET` | `/ml/drift/alerts` | JWT | Drift alerts |
| `GET` | `/ml/registry/versions` | JWT | Model versions |
| `POST` | `/ml/registry/promote` | Admin | Promote model version |
| `POST` | `/ml/batch/risk` | JWT | Batch risk prediction |
| `POST` | `/ml/retrain` | Admin | Trigger retraining |

### Government APIs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/government/aadhaar/verify` | JWT | Verify Aadhaar eKYC |
| `POST` | `/government/aadhaar/send-otp` | JWT | Send OTP |
| `POST` | `/government/aadhaar/verify-otp` | JWT | Verify OTP |
| `POST` | `/government/digilocker/verify` | JWT | Verify document |
| `GET` | `/government/digilocker/documents` | JWT | List document types |
| `POST` | `/government/startup-india/verify` | JWT | Verify startup |
| `POST` | `/government/startup-india/register` | JWT | Register startup |
| `GET` | `/government/startup-india/benefits/{num}` | JWT | Get benefits |
| `POST` | `/government/ip-india/verify` | JWT | Check patent status |
| `POST` | `/government/ip-india/search` | JWT | Search patents |
| `POST` | `/government/ondc/verify` | JWT | Verify seller |
| `POST` | `/government/ondc/search` | JWT | Search products |

### Monitoring
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | — | Health check |
| `GET` | `/metrics` | — | App metrics (JSON) |
| `GET` | `/metrics/prometheus` | — | Prometheus format |

---

## Demo Credentials

All passwords are `Demo@123`.

| Role | Email | Access |
|------|-------|--------|
| **Admin** | `admin@udaansetu.demo` | Everything + admin + ML retrain |
| **Researcher** | `researcher@udaansetu.demo` | Research, innovations, IPR, govt APIs |
| **Mentor** | `mentor@udaansetu.demo` | Mentoring, ecosystem |
| **Investor** | `investor@udaansetu.demo` | Startups, funding, ecosystem |
| **Incubator** | `incubator@udaansetu.demo` | Incubation, startups, ecosystem |

---

## Project Structure

```
UdaanSetu/
├── .github/workflows/
│   ├── ci-cd.yml              # GitHub Actions CI/CD
│   └── ecs-task-def.json      # ECS task definition
├── terraform/
│   └── main.tf                # AWS infrastructure (VPC, ECR, RDS, ECS)
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + routers
│   │   ├── config.py          # Settings (env-configurable)
│   │   ├── database.py        # SQLAlchemy engine
│   │   ├── models.py          # ORM models (User, Record, AuditLog, etc.)
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── dependencies.py    # Auth (JWT, RBAC)
│   │   ├── middleware.py      # CORS, rate limit, security headers
│   │   ├── monitoring.py      # JSON logging, metrics, Prometheus
│   │   ├── seed.py            # Demo data seeding
│   │   ├── utils.py           # Similarity, risk, validation
│   │   ├── ml/
│   │   │   ├── engine.py      # ML engine (634 lines, 5 components)
│   │   │   └── production.py  # Model registry, drift, feedback, batch
│   │   ├── government/
│   │   │   ├── base.py        # Base government client
│   │   │   ├── aadhaar.py     # Aadhaar eKYC
│   │   │   ├── digilocker.py  # DigiLocker documents
│   │   │   ├── startup_india.py # Startup India registry
│   │   │   ├── ip_india.py    # IP India patents
│   │   │   └── ondc.py        # ONDC marketplace
│   │   └── routes/
│   │       ├── auth.py        # Auth endpoints
│   │       ├── records.py     # CRUD endpoints
│   │       ├── dashboard.py   # Dashboard + analytics
│   │       ├── ai.py          # ML endpoints
│   │       ├── government.py  # Government API endpoints
│   │       ├── ml_production.py # ML production endpoints
│   │       ├── notifications.py
│   │       ├── audit.py
│   │       └── documents.py
│   ├── tests/                 # 153 tests
│   ├── alembic/               # DB migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── layout.tsx         # Root layout + providers
│   │   ├── page.tsx           # Login
│   │   ├── not-found.tsx      # 404 page
│   │   ├── lib/
│   │   │   ├── api.ts         # API client
│   │   │   ├── auth.tsx       # Auth context
│   │   │   └── types.ts       # TypeScript types
│   │   ├── components/
│   │   │   ├── StageBadge.tsx  # Unified stage badges
│   │   │   ├── Modal.tsx       # Reusable modal
│   │   │   ├── Toast.tsx       # Toast notifications
│   │   │   ├── ConfirmDialog.tsx # Confirmation dialogs
│   │   │   ├── ErrorBoundary.tsx # Error boundary
│   │   │   └── LoadingSpinner.tsx # Loading + skeleton
│   │   ├── hooks/
│   │   │   ├── useApi.ts       # Data fetching
│   │   │   └── useDebounce.ts  # Debounce hook
│   │   └── (app)/             # 18 authenticated pages
│   │       ├── dashboard/     # Pipeline flow + ML risk
│   │       ├── research/      # CRUD + milestones + edit
│   │       ├── innovations/   # AI recommendations + edit
│   │       ├── startups/      # Smart matching + impact
│   │       ├── ecosystem/     # Tabbed: mentors/schemes/incubators
│   │       ├── government/    # 5-tab government integrations
│   │       ├── analytics/     # recharts + ML metrics
│   │       ├── impact/        # Impact dashboard
│   │       ├── profile/       # Edit profile + password
│   │       ├── register/      # Self-registration
│   │       ├── notifications/
│   │       ├── audit/
│   │       └── settings/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

---

## Testing

```bash
cd backend
python -m pytest tests/ -v           # All 153 tests
python -m pytest tests/test_ai.py    # 27 ML tests
python -m pytest tests/test_auth.py  # 22 auth tests
```

| Suite | Tests | Coverage |
|-------|-------|----------|
| Security | 35 | Headers, CORS, rate limit, JWT, upload, audit |
| Records CRUD | 28 | Create, read, update, delete, filters |
| AI/ML | 27 | Risk, success, recommendations, similar, matching, duplicates |
| Utilities | 23 | Similarity, risk, password, sanitize |
| Auth & RBAC | 22 | Login, logout, token validation, role enforcement |
| Endpoints | 16 | Dashboard, analytics, notifications |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+psycopg://udaansetu:udaansetu@db:5432/udaansetu` | PostgreSQL URL |
| `SECRET_KEY` | `dev-only-change-me-in-production` | JWT signing key |
| `OLLAMA_ENABLED` | `false` | Enable Ollama LLM |
| `OLLAMA_URL` | `http://host.docker.internal:11434` | Ollama URL |
| `OLLAMA_MODEL` | `deepseek-r1:8b` | LLM model |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3001` | CORS allowed origins |
| `JWT_EXPIRY_HOURS` | `12` | Token expiry |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Frontend → Backend URL |
| `AADHAAR_API_URL` | — | UIDAI API (production) |
| `DIGILOCKER_API_URL` | — | DigiLocker API (production) |
| `STARTUP_INDIA_API_URL` | — | Startup India API (production) |
| `IP_INDIA_API_URL` | — | IP India API (production) |
| `ONDC_API_URL` | — | ONDC API (production) |

---

## Deployment

### Docker Compose (Development)
```bash
docker compose up --build
```

### AWS ECS (Production)
```bash
cd terraform
terraform init
terraform plan -var="db_password=YOUR_SECRET"
terraform apply -var="db_password=YOUR_SECRET"
```

GitHub Actions automatically builds and deploys on push to `main`.

---

## License

MIT License — built with passion for India's innovation ecosystem.
