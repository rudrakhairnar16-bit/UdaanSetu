# UDAANSETU (उड़ान सेतु) — Complete Project Report

## Problem Statement

**SIH26136** — "Startup Friendly Public Procurement Mechanism"

**Organization:** Government of Maharashtra, Dept of Skills, Employment, Entrepreneurship & Innovation

**Theme:** Smart Automation

**Problem:** Government procurement currently follows rigid tender-based processes that are hostile to startups. Lengthy evaluation cycles, complex compliance requirements, and lack of pilot-to-procurement pathways discourage innovative startups from participating. Maharashtra needs a platform that enables startups to participate in government procurement through a structured pilot-based approach.

---

## Solution Overview

UdaanSetu is a **full-stack web platform** that manages the complete lifecycle from problem identification to measurable startup deployment:

```
Challenge → Application → Eligibility → Evaluation → Pilot → Validation → Procurement → Scale-up
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 + React 19 + TypeScript |
| **Backend** | FastAPI + Python 3.12 |
| **Database** | PostgreSQL 16 + Redis 7 |
| **ML/AI** | sentence-transformers + scikit-learn |
| **Deployment** | Docker + Docker Compose |
| **Auth** | JWT (PyJWT + Argon2 password hashing) |
| **Docs** | Swagger/OpenAPI v2.0.0 |

---

## Project Statistics

| Metric | Value |
|---|---|
| **Backend Python files** | 85 |
| **Frontend TS/TSX files** | 58 |
| **Total source files** | 143 |
| **Total LOC** | ~30,000+ |
| **Database tables** | 31 |
| **API endpoints** | 150+ |
| **Frontend pages** | 24 |
| **ML model classes** | 12 |
| **Test cases** | 153 (153/153 passing) |
| **Roles** | 11 |
| **Data files** | 23 JSON files |

---

## System Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL   │
│  Next.js 15  │     │  FastAPI     │     │    16         │
│  Port 3000   │     │  Port 8000   │     │  Port 5432   │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────▼───────┐
                    │   ML Engine   │
                    │  sentence-    │
                    │  transformers │
                    │  scikit-learn │
                    └──────────────┘
```

---

## Database Models (31 Tables)

| # | Table | Purpose |
|---|---|---|
| 1 | `users` | All 11 roles — admin, researcher, mentor, investor, incubator, govt_officer, procurement_officer, evaluator, validator, startup, auditor |
| 2 | `records` | Unified entity table — startups, research, innovations, patents, schemes, incubators, districts (9 kinds via `kind` discriminator) |
| 3 | `challenges` | Government procurement challenges with status workflow |
| 4 | `challenge_versions` | Version history snapshots for challenges |
| 5 | `challenge_requirements` | Mandatory eligibility/technical/security requirements |
| 6 | `applications` | Startup applications to challenges |
| 7 | `eligibility_checks` | Automated eligibility verification with override |
| 8 | `evaluations` | Expert evaluation with criterion-level scoring |
| 9 | `evaluation_scores` | Individual criterion scores with weights |
| 10 | `conflict_of_interests` | Evaluator COI declarations |
| 11 | `pilots` | Pilot programs with data/IP/cyber clauses |
| 12 | `pilot_milestones` | Deliverable tracking with payment linkage |
| 13 | `pilot_metrics` | KPI tracking (baseline/target/actual) |
| 14 | `pilot_evidence` | Evidence submissions per milestone |
| 15 | `pilot_incidents` | Incident reporting and resolution |
| 16 | `payments` | Invoice and transaction tracking |
| 17 | `validations` | Independent validation verdicts |
| 18 | `procurements` | GeM/tender procurement workflows |
| 19 | `contracts` | Contract lifecycle management |
| 20 | `purchase_orders` | PO issuance and fulfillment |
| 21 | `compliance_checklists` | Procurement compliance tracking |
| 22 | `scale_up_decisions` | Multi-department scale-up with budget |
| 23 | `grievances` | SLA-based grievance redressal |
| 24 | `ip_data_agreements` | IP ownership and data access clauses |
| 25 | `templates` | Government contract/evaluation/RFP templates |
| 26 | `departments` | Maharashtra government departments |
| 27 | `document_versions` | Document version tracking |
| 28 | `document_acls` | Role-based document access control |
| 29 | `audit_logs` | Complete audit trail (494+ entries) |
| 30 | `notifications` | User notifications with read status |
| 31 | `token_blacklist` | JWT revocation for logout |

---

## API Endpoints (150+ across 25 route files)

### Auth (`/auth`) — 7 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/register` | Create account with role |
| POST | `/auth/logout` | Revoke JWT token |
| GET | `/auth/me` | Get current user profile |
| PATCH | `/auth/me` | Update profile (name, district, org) |
| POST | `/auth/change-password` | Change password |
| GET | `/auth/users` | List all users (admin only) |

### Records — 8 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/records` | List records with filters |
| GET | `/records/search` | Advanced full-text search |
| GET | `/records/filters` | Get available filter values |
| GET | `/records/export` | Export as CSV or JSON |
| GET | `/records/{record_id}` | Get single record |
| POST | `/records/{kind}` | Create record of specified kind |
| PATCH | `/records/{record_id}` | Update record |
| DELETE | `/records/{record_id}` | Delete record (admin only) |

### Dashboard & Analytics — 10 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/role-based` | Role-specific dashboard data |
| GET | `/dashboard` | Main dashboard with pipeline + ML risk |
| GET | `/analytics/pipeline-funnel` | Procurement pipeline funnel |
| GET | `/analytics/tat` | Turnaround time analytics |
| GET | `/analytics/pilot-success` | Pilot success rate analytics |
| GET | `/analytics/impact` | Impact metrics |
| GET | `/analytics/overview` | Overview analytics |
| GET | `/analytics/districts` | District-level analytics |
| GET | `/analytics/ecosystem` | Ecosystem analytics |
| GET | `/analytics/maharashtra` | Maharashtra procurement analytics |

### AI/ML (`/ai`) — 12 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ai/risk/{research_id}` | Risk prediction |
| GET | `/ai/success/{research_id}` | Success probability |
| GET | `/ai/recommendations/{innovation_id}` | Semantic recommendations |
| GET | `/ai/similar/{record_id}` | Find similar records |
| GET | `/ai/match/{innovation_id}` | Smart matching |
| GET | `/ai/duplicates` | Detect duplicate clusters |
| GET | `/ai/metrics` | ML model metrics (admin) |
| POST | `/ai/retrain` | Retrain ML models (admin) |
| GET | `/ai/match-startup/{challenge_id}` | Match startups to challenge |
| GET | `/ai/pilot-risk/{pilot_id}` | Predict pilot risk |
| GET | `/ai/scale-predict/{pilot_id}` | Predict scale-up |
| POST | `/ai/challenge-draft` | AI challenge draft |

### Challenges (`/challenges`) — 17 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/challenges` | List challenges |
| GET | `/challenges/{id}` | Get challenge |
| POST | `/challenges` | Create challenge |
| PATCH | `/challenges/{id}` | Update challenge |
| DELETE | `/challenges/{id}` | Delete challenge |
| POST | `/challenges/{id}/validate` | Validate challenge |
| POST | `/challenges/{id}/publish` | Publish challenge |
| POST | `/challenges/{id}/award` | Award challenge |
| POST | `/challenges/{id}/close` | Close challenge |
| GET | `/challenges/my` | Get user's challenges |
| GET | `/challenges/{id}/versions` | List version history |
| POST | `/challenges/{id}/versions` | Create version snapshot |
| POST | `/challenges/{id}/versions/{vid}/restore` | Restore version |
| GET | `/challenges/{id}/requirements` | List requirements |
| POST | `/challenges/{id}/requirements` | Create requirement |
| PATCH | `/challenges/{id}/requirements/{rid}` | Update requirement |
| DELETE | `/challenges/{id}/requirements/{rid}` | Delete requirement |

### Applications (`/applications`) — 10 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/applications` | List applications |
| GET | `/applications/{id}` | Get application |
| POST | `/applications` | Create application |
| PATCH | `/applications/{id}` | Update application |
| POST | `/applications/{id}/submit` | Submit application |
| DELETE | `/applications/{id}` | Delete application |
| POST | `/applications/{id}/eligibility-check` | Run eligibility check |
| POST | `/applications/{id}/eligibility-override` | Override eligibility |
| GET | `/applications/{id}/eligibility` | Get eligibility results |
| POST | `/applications/{id}/coi` | Declare conflict of interest |

### Evaluations (`/evaluations` + `/evaluation-scores`) — 8 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/evaluations` | List evaluations |
| GET | `/evaluations/{id}` | Get evaluation |
| POST | `/evaluations` | Create evaluation |
| PATCH | `/evaluations/{id}` | Update evaluation |
| DELETE | `/evaluations/{id}` | Delete evaluation |
| GET | `/evaluation-scores/evaluation/{id}` | List criterion scores |
| POST | `/evaluation-scores/evaluation/{id}` | Create score entry |
| POST | `/evaluation-scores/evaluation/{id}/aggregate` | Aggregate weighted score |

### Pilots (`/pilots` + `/pilot-incidents`) — 15 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pilots` | List pilots |
| GET | `/pilots/{id}` | Get pilot |
| POST | `/pilots` | Create pilot |
| PATCH | `/pilots/{id}` | Update pilot |
| DELETE | `/pilots/{id}` | Delete pilot |
| POST | `/pilots/{id}/start` | Start pilot |
| POST | `/pilots/{id}/approve` | Approve pilot |
| POST | `/pilots/{id}/complete` | Complete pilot |
| GET | `/pilots/{id}/milestones` | List milestones |
| POST | `/pilots/{id}/milestones` | Create milestone |
| PATCH | `/pilots/milestones/{mid}` | Update milestone |
| POST | `/pilots/milestones/{mid}/approve` | Approve milestone |
| POST | `/pilots/milestones/{mid}/complete` | Complete milestone |
| GET/POST | `/pilot-incidents/pilot/{id}` | List/Report incidents |
| PATCH | `/pilot-incidents/{id}` | Resolve incident |

### Payments (`/payments`) — 6 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | List payments |
| GET | `/payments/{id}` | Get payment |
| POST | `/payments` | Create payment |
| PATCH | `/payments/{id}` | Update payment |
| POST | `/payments/{id}/process` | Process payment |
| POST | `/payments/{id}/complete` | Complete payment |

### Validations (`/validations`) — 10 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/validations` | List validations |
| GET | `/validations/{id}` | Get validation |
| POST | `/validations` | Create validation |
| PATCH | `/validations/{id}` | Update validation |
| DELETE | `/validations/{id}` | Delete validation |
| GET | `/validations/pilot/{id}/metrics` | List pilot metrics |
| POST | `/validations/pilot/{id}/metrics` | Create pilot metric |
| PATCH | `/validations/metrics/{id}` | Update pilot metric |
| GET | `/validations/pilot/{id}/evidence` | List pilot evidence |
| POST | `/validations/pilot/{id}/evidence` | Submit pilot evidence |

### Procurement & Contracts — 18 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/procurements` | List procurements |
| GET | `/procurements/{id}` | Get procurement |
| POST | `/procurements` | Create procurement |
| PATCH | `/procurements/{id}` | Update procurement |
| POST | `/procurements/{id}/approve` | Approve procurement |
| DELETE | `/procurements/{id}` | Delete procurement |
| GET | `/procurements/contracts` | List contracts |
| GET | `/procurements/contracts/{id}` | Get contract |
| POST | `/procurements/contracts` | Create contract |
| PATCH | `/procurements/contracts/{id}` | Update contract |
| POST | `/procurements/contracts/{id}/sign` | Sign contract |
| GET | `/purchase-orders` | List POs |
| GET | `/purchase-orders/{id}` | Get PO |
| POST | `/purchase-orders` | Create PO |
| PATCH | `/purchase-orders/{id}` | Update PO |
| POST | `/purchase-orders/{id}/issue` | Issue PO |
| POST | `/purchase-orders/{id}/fulfill` | Fulfill PO |
| DELETE | `/purchase-orders/{id}` | Delete PO |

### Compliance (`/compliance`) — 4 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/compliance/procurement/{id}` | List compliance items |
| POST | `/compliance/procurement/{id}` | Create compliance item |
| PATCH | `/compliance/{id}` | Update compliance item |
| POST | `/compliance/procurement/{id}/auto-populate` | Auto-populate 10-item checklist |

### Grievances (`/grievances`) — 7 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/grievances` | List grievances |
| GET | `/grievances/{id}` | Get grievance |
| POST | `/grievances` | Create grievance |
| PATCH | `/grievances/{id}` | Update grievance |
| DELETE | `/grievances/{id}` | Delete grievance |
| GET | `/grievances/sla/check` | Check SLA breaches |
| POST | `/grievances/{id}/escalate` | Escalate grievance |

### IP/Data Agreements (`/ip-data-agreements`) — 5 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ip-data-agreements` | List agreements |
| GET | `/ip-data-agreements/{id}` | Get agreement |
| POST | `/ip-data-agreements` | Create agreement |
| PATCH | `/ip-data-agreements/{id}` | Update agreement |
| DELETE | `/ip-data-agreements/{id}` | Delete agreement |

### Departments, Templates, Documents — 14 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PATCH/DELETE | `/departments` | Department CRUD |
| GET/POST/PATCH/DELETE | `/templates` | Template CRUD |
| POST | `/documents/upload` | Upload document |
| GET/POST | `/{record_id}/acl` | Document ACL |
| GET/POST | `/document-versions/record/{id}` | Document versions |

### Notifications, Audit — 5 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| PATCH | `/notifications/{id}/read` | Mark read |
| POST | `/notifications/read-all` | Mark all read |
| GET | `/audit` | List audit logs |
| GET | `/audit/export` | Export audit CSV |

### Government APIs (`/government`) — 22 endpoints

| Service | Endpoints | Features |
|---|---|---|
| **Aadhaar eKYC** | 3 | Send OTP, Verify OTP, Verify |
| **DigiLocker** | 3 | Verify, List types, Fetch document |
| **Startup India** | 4 | Verify, Register, Benefits, Recent |
| **IP India** | 4 | Verify, Search, Publication, Costs |
| **ONDC** | 4 | Verify, Search, Products, Register seller |
| **Maharashtra** | 3 | Scheme eligibility, DPIIT status, District density |

### ML Production (`/ml`) — 11 endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ml/feedback` | Submit prediction feedback |
| GET | `/ml/feedback/accuracy` | Get accuracy metrics |
| GET | `/ml/feedback/recent` | Recent feedback entries |
| GET | `/ml/drift/status` | Drift detection status |
| GET | `/ml/drift/alerts` | Drift alerts |
| GET | `/ml/registry/versions` | List model versions |
| GET | `/ml/registry/active/{type}` | Get active model |
| POST | `/ml/registry/promote` | Promote model version |
| POST | `/ml/batch/risk` | Batch risk prediction |
| GET | `/ml/batch/{job_id}` | Batch job status |
| POST | `/ml/retrain` | Trigger retraining |

---

## Frontend Pages (24 Pages)

| # | Page Path | Purpose |
|---|---|---|
| 1 | `/dashboard` | Pipeline flow, ML risk predictions, recent records |
| 2 | `/research` | Research CRUD with milestones, progress, funding |
| 3 | `/innovations` | TRL levels, AI recommendations |
| 4 | `/ipr` | Patent lifecycle: Draft → Filed → Granted |
| 5 | `/startups` | Smart matching, impact metrics, revenue |
| 6 | `/ecosystem` | Tabbed: Mentors, Schemes, Incubators, Funding |
| 7 | `/challenges` | Government challenge management |
| 8 | `/applications` | Startup applications + eligibility checks |
| 9 | `/evaluations` | Expert committee scoring |
| 10 | `/pilots` | Pilot management + milestones + status |
| 11 | `/validation` | Independent validation + KPI tracking |
| 12 | `/procurement` | GeM/tender procurement workflow |
| 13 | `/contracts` | Contract management + purchase orders |
| 14 | `/grievances` | SLA tracking + escalation |
| 15 | `/departments` | Government department management |
| 16 | `/templates` | Procurement template management |
| 17 | `/government` | 5-tab: Aadhaar, DigiLocker, Startup India, IP India, ONDC |
| 18 | `/analytics` | Recharts (BarChart + PieChart) + ML metrics |
| 19 | `/impact` | Sector/district breakdowns, beneficiaries |
| 20 | `/profile` | User profile editing |
| 21 | `/register` | Self-registration |
| 22 | `/notifications` | Notification center |
| 23 | `/audit` | Admin audit trail + CSV export |
| 24 | `/settings` | Application settings |

---

## ML/AI Models (12 Classes)

| # | Class | Algorithm | Purpose |
|---|---|---|---|
| 1 | SemanticEngine | sentence-transformers (all-MiniLM-L6-v2) | Semantic similarity search with 3-tier fallback |
| 2 | RiskEngine | GradientBoostingClassifier | Risk prediction (0-100), ~82% accuracy |
| 3 | SuccessPredictor | Inverted risk + bootstrap CIs | Success probability with confidence intervals |
| 4 | DuplicateDetector | AgglomerativeClustering | Find duplicate record clusters |
| 5 | TrainingPipeline | Orchestrator | Train, evaluate, serialize all models |
| 6 | StartupMatcher | Cosine similarity | Match startups to government challenges |
| 7 | PilotRiskScorer | GradientBoostingClassifier | Predict pilot success/failure (6 features) |
| 8 | ScalePredictor | Weighted scoring | Predict scale-up recommendation |
| 9 | ModelRegistry | Version tracking | Register, promote, deprecate models |
| 10 | DriftDetector | KS test + PSI | Monitor prediction/feature drift |
| 11 | FeedbackStore | User corrections | Store feedback, calculate accuracy |
| 12 | BatchPredictor | Background jobs | Batch risk predictions |

**3-Tier ML Fallback:**
```
sentence-transformers → TF-IDF → Keyword matching → Rule-based
```

---

## Roles & Permissions (11 Roles)

| Role | Key Permissions |
|---|---|
| **Admin** | Full access. CRUD all entities. Delete any record. Manage users. Retrain ML. Export audit. |
| **Govt Officer** | Challenges (full lifecycle), Pilots, Departments, Templates, Grievances, Scale-up, Eligibility override, SLA check, Compliance auto-populate |
| **Procurement Officer** | Procurements, Contracts, Purchase Orders, Compliance items |
| **Evaluator** | Evaluations, Criterion scoring, Weighted aggregation, COI declaration |
| **Validator** | Pilot validations, Metrics, Evidence review |
| **Researcher** | Research, Innovations, IPR, Analytics, AI endpoints, Documents |
| **Mentor** | Evaluations, Ecosystem view, Dashboard |
| **Investor** | Startups, Funding requests, Impact, Ecosystem |
| **Incubator** | Startups, Innovations, Mentors, Ecosystem |
| **Startup** | Applications, Evidence submission, Grievances, Document versions |
| **Auditor** | Audit logs, CSV export |

---

## Seed Data (Jan–Aug 2026 Timeline)

| Entity | Count |
|---|---|
| Users | 31 (11 roles + 20 mentors) |
| Startups | 46 (real Maharashtra companies) |
| Research Projects | 22 |
| Innovations | 15 |
| Schemes | 15 (Maharashtra govt schemes) |
| Incubators | 12 (SINE IITB, Venture Center, etc.) |
| Patents/IPR | 12 |
| Districts | 36 (all Maharashtra districts) |
| Challenges | 7 (real Maharashtra govt challenges) |
| Applications | 25 |
| Evaluations | 12 |
| Evaluation Scores | 72 |
| Pilots | 10 |
| Pilot Metrics | 40 |
| Pilot Milestones | 20 |
| Pilot Evidence | 15 |
| Pilot Incidents | 8 |
| Validations | 8 |
| Procurements | 6 |
| Contracts | 4 |
| Purchase Orders | 4 |
| Grievances | 8 |
| IP Agreements | 6 |
| Compliance Items | 18 |
| Document Versions | 10 |
| Challenge Versions | 6 |
| Scale-Up Decisions | 2 |
| Audit Logs | 494 |
| Notifications | 57 |

---

## Testing

| Test File | Tests | Status |
|---|---|---|
| test_utils.py | 34 | ✅ Pass |
| test_security.py | 28 | ✅ Pass |
| test_ai.py | 27 | ✅ Pass |
| test_records.py | 26 | ✅ Pass |
| test_auth.py | 22 | ✅ Pass |
| test_endpoints.py | 16 | ✅ Pass |
| **TOTAL** | **153** | **153/153 ✅** |

---

## Government API Integrations

| API | Status | Features |
|---|---|---|
| **Aadhaar eKYC** | Mock (ready for real) | Send OTP, Verify OTP, Document verification |
| **DigiLocker** | Mock (ready for real) | Document fetch, Verification, Document types |
| **Startup India** | Mock (ready for real) | DPIIT registration verify, Benefits lookup |
| **IP India** | Mock (ready for real) | Patent status check, Search, Cost estimation |
| **ONDC** | Mock (ready for real) | Seller/product verify, Search, Registration |

---

## Deployment

### Option A: Docker Compose (Recommended)
```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec -T backend python -c "from app.seed import seed; seed()"
```

### Option B: Railway/Render (Easiest — 5 min)
- Connect GitHub repo → Auto deploy
- Built-in PostgreSQL

### Option C: AWS EC2
```bash
# On EC2:
curl -fsSL https://get.docker.com | sudo sh
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@udaansetu.gov.in | Admin@123 |
| Researcher | smita.kulkarni@puneuni.ac.in | Research@123 |
| Govt Officer | rajesh.patil@maharashtra.gov.in | Govt@123 |
| Evaluator | vikram.patil@ieee.org | Eval@123 |
| Procurement | meera.sharma@maharashtra.gov.in | Procure@123 |
| Validator | anjali.kulkarni@ncssc.in | Valid@123 |
| Auditor | suresh.jogani@cag.gov.in | Audit@123 |

---

## OVERVIEW (Quick Summary)

**UdaanSetu** is a **government procurement platform for startups** built for Maharashtra under SIH26136. It manages the full lifecycle:

```
1. Government posts a Challenge (e.g., "AI Crop Advisory for Farmers")
2. Startups Apply → automated eligibility check
3. Experts Evaluate → weighted scoring across criteria
4. Selected Startup runs a Pilot → tracked with milestones, metrics, evidence
5. Independent Validation → KPI achievement, cost efficiency review
6. Procurement → GeM/tender, contracts, purchase orders
7. Scale-up → Multi-department rollout with budget allocation
```

### Key Numbers

| What | Count |
|---|---|
| API Endpoints | 150+ |
| Frontend Pages | 24 |
| Database Tables | 31 |
| ML Models | 12 |
| Test Cases | 153 (all passing) |
| User Roles | 11 |
| LOC | ~30,000+ |
| Maharashtra Startups | 46 |
| Maharashtra Districts | 36 |

### Key Differentiators

1. **12 ML/AI models** — Risk prediction (82% accuracy), startup matching, duplicate detection, success probability
2. **150+ API endpoints** covering every procurement stage
3. **24 frontend pages** with role-based access (11 roles)
4. **31 database tables** with complete audit trail (494+ entries)
5. **5 Government API integrations** (Aadhaar, DigiLocker, Startup India, IP India, ONDC)
6. **Real Maharashtra data** — 46 startups, 36 districts, 20 mentors, 15 schemes, 12 incubators
7. **3-tier ML fallback** — sentence-transformers → TF-IDF → keyword → rule-based
8. **Production ML infrastructure** — Model registry, drift detection, feedback loop, batch prediction

### Lifecycle Flow

```
┌──────────┐   ┌──────────────┐   ┌────────────┐   ┌──────────┐
│ Challenge │──▶│ Application  │──▶│ Evaluation │──▶│  Pilot   │
│  (Open)   │   │ (Submitted)  │   │ (Scored)   │   │ (Active) │
└──────────┘   └──────────────┘   └────────────┘   └────┬─────┘
                                                         │
┌──────────┐   ┌──────────────┐   ┌────────────┐        │
│ Scale-up │◀──│  Procurement │◀──│ Validation │◀───────┘
│ (Decided) │   │  (Approved)  │   │ (Success)  │
└──────────┘   └──────────────┘   └────────────┘
```

---

*Report generated from source code analysis of the UdaanSetu project.*
*SIH26136 — Government of Maharashtra*
*Version 2.0.0*
