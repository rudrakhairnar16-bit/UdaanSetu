# UdaanSetu — Comprehensive Product Architecture & Codebase Audit
**Document ID:** `docs/ANTIGRAVITY_PRODUCT_AUDIT.md`  
**Date:** March 2026  
**Product:** UdaanSetu ("From Research to Impact")  
**Platform Concept:** End-to-End Innovation Journey + AI Innovation Command Center  
**Target:** SIH Innovation Ecosystem Platform  

---

## 1. Executive Summary

UdaanSetu is an enterprise-grade digital public infrastructure designed to bridge the gap between early-stage research/innovations and government procurement, scaling, and citizen impact.

This audit establishes a baseline of existing architectural assets, backend models, API surfaces, ML engines, role-based access control (RBAC), frontend components, routes, and data flows to ensure **zero destructive removal of existing working backend logic** while preparing the platform for its unified vision:

$$\text{Research/Innovation} \longrightarrow \text{Government Challenge} \longrightarrow \text{Discovery} \longrightarrow \text{AI Validation} \longrightarrow \text{Expert Evaluation} \longrightarrow \text{Pilot} \longrightarrow \text{Performance Validation} \longrightarrow \text{Milestone Payment} \longrightarrow \text{Procurement} \longrightarrow \text{Scale} \longrightarrow \text{Real-world Impact}$$

---

## 2. Architecture Overview

```
+----------------------------------------------------------------------------------------------------+
|                                    UDAANSETU PLATFORM ARCHITECTURE                                 |
+----------------------------------------------------------------------------------------------------+
|  FRONTEND (Next.js 15 App Router + React 19 + TypeScript + Custom Design System)                   |
|  - Role-Based Dashboard & Navigation (11 RBAC Roles)                                               |
|  - Innovation Journey Interactive Tracker (11 Stages)                                              |
|  - AI Innovation Command Center (Matching, Risk, Duplicate, Pilot Risk, Scale, Model Drift)        |
|  - Domain Portals (Challenges, Applications, Pilots, Validations, Procurements, Contracts, IPR)     |
+----------------------------------------------------------------------------------------------------+
                                               │ HTTP / REST / JWT
                                               ▼
+----------------------------------------------------------------------------------------------------+
|  BACKEND CORE (FastAPI + Python 3.11+ + SQLAlchemy 2.0 + SQLite / PostgreSQL)                      |
|  - Auth & Security: JWT with HMAC-SHA256, Token Blacklisting, Role Authorizer                      |
|  - Middleware: CORS, Request Tracing, Rate Limiting, Prometheus Metrics                            |
|  - Domain Routers (29 Routers: Auth, Records, Challenges, Pilots, Validations, Payments, etc.)     |
|  - Database Layer: 22 SQLAlchemy ORM Tables covering Full Lifecycle Governance                    |
+----------------------------------------------------------------------------------------------------+
                                               │
                                               ▼
+----------------------------------------------------------------------------------------------------+
|  AI / ML ENGINE (app/ml)                                                                           |
|  - SemanticEngine: Sentence-Transformers (all-MiniLM-L6-v2) + Scikit-Learn TF-IDF Fallback         |
|  - RiskEngine: Trained GradientBoostingClassifier on Multi-Feature Innovation Vectors              |
|  - SuccessPredictor: Success Probability & Bootstrap Confidence Intervals                          |
|  - DuplicateDetector: Agglomerative Clustering on Embedding Cosine Distances                       |
|  - StartupMatcher: Semantic Capability Matching to Challenge Problem Statements                    |
|  - PilotRiskScorer: Gradient Boosting ML Predictor for Pilot Outcome Risk                          |
|  - ScalePredictor: Multi-criteria Scoring for State-wide Rollout Viability                         |
|  - ML Production: Model Version Registry, Drift Detection (Feature & Prediction), Feedback Loop   |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Deep-Dive Subsystem Audit

### 3.1 Database Models (`backend/app/models.py`)

The repository possesses a comprehensive schema of 22 database models:

| Model | Table Name | Purpose & Key Relationships |
|---|---|---|
| `User` | `users` | Core user identity, authentication hash, district, organization, role |
| `Record` | `records` | Universal innovation entity (`kind`: `research`, `innovation`, `ipr`, `startup`, `mentor`, `scheme`, `incubator`, `milestone`) |
| `AuditLog` | `audit_logs` | Immutable audit trail (`actor_id`, `action`, `entity`, `entity_id`, `detail`, `created_at`) |
| `Notification` | `notifications` | Role-targeted notifications with read status and notification kinds |
| `TokenBlacklist` | `token_blacklist` | Revoked JWT tokens for secure logout |
| `Department` | `departments` | Government departments, contact points, district jurisdiction |
| `Challenge` | `challenges` | Department challenges, budget range, timeline, criteria, lifecycle status |
| `ChallengeRequirement`| `challenge_requirements`| Mandatory/optional technical, regulatory, or operational requirements |
| `ChallengeVersion` | `challenge_versions` | Version control snapshot history for challenge iterations |
| `Application` | `applications` | Startup applications submitting proposals against open challenges |
| `EligibilityCheck` | `eligibility_checks` | Automated rules engine checking startup criteria with officer override capability |
| `ConflictOfInterest`| `conflict_of_interests` | Mandatory evaluator declarations to preserve procurement integrity |
| `Evaluation` | `evaluations` | Committee evaluation records, recommendations, and comments |
| `EvaluationScore` | `evaluation_scores` | Weighted criterion-level scores per evaluation |
| `Pilot` | `pilots` | Structured pilot projects linked to challenge and startup with budget and scope |
| `PilotMilestone` | `pilot_milestones` | Milestone deliverables, approval status, and linked milestone payment amounts |
| `PilotMetric` | `pilot_metrics` | KPI baseline, target, and actual tracking for empirical performance validation |
| `PilotEvidence` | `pilot_evidence` | Uploaded test reports, live telemetry, and verification artifacts |
| `PilotIncident` | `pilot_incidents` | Incident management and defect tracking during pilot execution |
| `Validation` | `validations` | Independent 3rd-party validator evaluation, cost efficiency, security score, scalability |
| `Payment` | `payments` | Milestone payments, invoice numbers, transaction IDs, completion statuses |
| `Procurement` | `procurements` | Government procurement pathway (GeM, Single Tender, Open RFP), approval status |
| `Contract` | `contracts` | Formal procurement contracts, validity dates, values, signing metadata |
| `PurchaseOrder` | `purchase_orders` | Purchase orders issued against approved contracts |
| `IPDataAgreement` | `ip_data_agreements` | IP ownership, foreground/background IP, data retention, source code escrow |
| `ComplianceChecklist`| `compliance_checklists`| Regulatory checklists (DPDP Act, CERT-In, GFR Rule 165) |
| `ScaleUpDecision` | `scale_up_decisions` | Scaling decisions, target departments, districts, and scale-up budget allocation |
| `Template` | `templates` | Standard procurement, pilot agreement, and RFP templates |
| `Grievance` | `grievances` | Redressal mechanism with SLA tracking and status workflows |
| `DocumentVersion` | `document_versions` | Version-controlled document storage |
| `DocumentACL` | `document_acls` | Role-based document access control lists |

---

### 3.2 Backend API Routers (`backend/app/routes/`)

The backend exposes 29 dedicated routers:

| Router Module | Prefix / Tag | Key Capabilities |
|---|---|---|
| `auth.py` | `/auth` | Register, login (JWT generation), profile inspection, logout (token blacklist) |
| `records.py` | `/records` | CRUD for research, innovations, startups, milestones, IPR, mentors, schemes |
| `challenges.py` | `/challenges` | Creation, editing, state transitions (draft $\to$ open $\to$ in_progress $\to$ evaluating $\to$ awarded $\to$ closed), publishing, validation |
| `applications.py` | `/applications` | Startup submission, automated eligibility evaluation, officer override, conflict of interest declarations |
| `evaluations.py` | `/evaluations` | Committee review, criterion-based scoring, recommendation summaries |
| `pilots.py` | `/pilots` | Pilot lifecycle (proposed $\to$ approved $\to$ in_progress $\to$ completed), milestones, approvals |
| `validations.py` | `/validations` | Independent validator assessments, KPI achievement metrics, empirical evidence review |
| `payments.py` | `/payments` | Milestone payment processing, invoice generation, transaction verification |
| `procurements.py` | `/procurements`| Procurement recommendations, approval workflows, GeM/RFP integration pathways |
| `purchase_orders.py` | `/purchase-orders` | Contract-linked PO issuance, status tracking |
| `scale_ups.py` | `/scale-up-decisions` | Statewide rollout decisions, district budget distribution, KPI projections |
| `ai.py` | `/ai` | Smart matching, risk scoring, duplicate detection, success prediction, AI challenge drafting, pilot risk, scale prediction |
| `ml_production.py` | `/ml/production` | Model registry, version promotion, drift detection alerts, telemetry |
| `dashboard.py` | `/dashboard` & `/analytics` | Role-based dashboards, pipeline funnel, turnaround time (TAT), pilot success rate, impact analytics |
| `grievances.py` | `/grievances` | Grievance lodging, assignment, resolution tracking, SLA monitoring |
| `ip_data_agreements.py` | `/ip-data-agreements` | IP rights, data ownership, confidentiality terms |
| `compliance.py` | `/compliance` | Compliance checklist verification for procurements |
| `audit.py` | `/audit` | Audit log streaming and administrative inspection |
| `notifications.py` | `/notifications` | Role-targeted notifications, mark-read operations |
| `departments.py` | `/departments` | Department catalog and officer assignment |
| `templates.py` | `/templates` | Standardized procurement & legal templates |
| `documents.py` | `/documents` | File upload handling and metadata persistence |

---

### 3.3 AI / Machine Learning Engine (`backend/app/ml/`)

The platform contains real AI/ML algorithms:

1. **Semantic Embeddings (`SemanticEngine`)**:
   - Model: `sentence-transformers/all-MiniLM-L6-v2` with Scikit-Learn `TfidfVectorizer` fallback.
   - Used for semantic similarity search, challenge matching, and cross-sector similarity.

2. **Project Risk Engine (`RiskEngine`)**:
   - Model: Trained `GradientBoostingClassifier` with `StandardScaler`.
   - Features: progress rate, total milestones, overdue milestones, completed milestones, project age (days), stage encoding, funding ratio, sector encoding, district encoding.
   - Provides explainable AI: feature importance breakdown, confidence scores, and plain-language risk factors.

3. **Success Predictor (`SuccessPredictor`)**:
   - Computes statistical success probability with bootstrap confidence intervals ($95\%$ CI) and matches comparable historical successes.

4. **Duplicate & Overlap Detector (`DuplicateDetector`)**:
   - Agglomerative Hierarchical Clustering on embedding cosine distance matrices ($d = 1 - \text{cosine}$).
   - Clusters overlapping research, patent claims, and duplicate challenge submissions.

5. **Startup & Challenge Matcher (`StartupMatcher`)**:
   - Matches startup capabilities and technical profiles to government problem statements via semantic vector projection.

6. **Pilot Outcome Risk Scorer (`PilotRiskScorer`)**:
   - Predicts pilot failure probability based on budget magnitude, timeline weeks, milestone density, and departmental domain alignment.

7. **Scale-up Predictor (`ScalePredictor`)**:
   - Weighted multi-factor evaluation combining pilot success probability ($40\%$), milestone completion rate ($40\%$), and budget efficiency ($20\%$).

8. **Production MLOps (`ModelRegistry` & `DriftDetector`)**:
   - Model versioning, active model promotion, prediction distribution monitoring, and feature drift detection with automated alerts.

---

### 3.4 Authentication & RBAC System

UdaanSetu supports 11 distinct personas defined in `Role`:

1. `admin`: System-wide governance, AI retraining, audit inspection, model promotion.
2. `govt_officer`: Challenge publishing, application review, pilot approval, department management.
3. `procurement_officer`: Procurement approvals, contract generation, purchase orders, compliance checklists.
4. `evaluator`: Challenge application scoring, conflict-of-interest declarations, recommendations.
5. `validator`: Independent pilot KPI verification, empirical test validation, security reviews.
6. `startup`: Challenge discovery, application submission, pilot milestone execution, grievance lodging.
7. `researcher`: Research project submission, prototype tracking, patent documentation.
8. `mentor`: Advisory input, technical guidance, innovation feedback.
9. `investor`: Co-funding opportunities, commercialization tracking.
10. `incubator`: Incubation cohort tracking, resource allocation.
11. `auditor`: CAG / State audit inspection, immutable audit logs, SLA verification.

---

## 4. Mapping to the New Product Journey

The product direction is locked: **"From Research to Impact"** featuring the **11-Stage Primary Journey** and the **AI Innovation Command Center**.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    11-STAGE PRIMARY JOURNEY                                       │
├──────┬────────────────────────────┬─────────────────────────────┬─────────────────────────────────┤
│ Step │ Stage Name                 │ Existing Backend Asset      │ Frontend Status & Goal          │
├──────┼────────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ 1    │ Research / Innovation      │ `Record` (research/innov)   │ Upgrade view with TR & Readiness│
│ 2    │ Government Challenge       │ `Challenge`, `Dept`         │ Upgrade to AI Challenge Builder │
│ 3    │ Discovery (Smart Match)    │ `StartupMatcher`, `ai.py`   │ Connect to Interactive Matcher  │
│ 4    │ AI Validation & Risk       │ `RiskEngine`, `Eligibility` │ Unify into AI Screening Center  │
│ 5    │ Expert Evaluation          │ `Evaluation`, `EvalScore`   │ Streamlined Scoring Matrix      │
│ 6    │ Pilot Execution            │ `Pilot`, `PilotMilestone`   │ Visual Milestone Tracker        │
│ 7    │ Performance Validation     │ `Validation`, `PilotMetric` │ Empirical KPI & Evidence Review │
│ 8    │ Milestone Payment          │ `Payment`, `PilotMilestone` │ Payment Gateway & Invoice Flow  │
│ 9    │ Procurement                │ `Procurement`, `Contract`   │ GeM / RFP Pathway Integration   │
│ 10   │ Scale                      │ `ScaleUpDecision`, `Scale`  │ Statewide District Rollout Map  │
│ 11   │ Real-world Impact          │ `Record.meta`, `Impact API` │ Citizen & Economic Impact Gauge │
└──────┴────────────────────────────┴─────────────────────────────┴─────────────────────────────────┘
```

---

## 5. Reusable Components & Foundation Assets

### Frontend Reusable Assets:
- `components/ui/`: `Button`, `Card`, `Input`, `Select`, `Table`, `Badge`, `Pagination`, `PageHeader`, `Icon`, `Breadcrumb`.
- Core Overlays: `Modal.tsx`, `ConfirmDialog.tsx`, `Toast.tsx`, `LoadingSpinner.tsx`, `ErrorBoundary.tsx`, `StageBadge.tsx`.
- Library & Context: `lib/api.ts` (extended API client), `lib/auth.tsx` (JWT context and session manager), `lib/types.ts` (TypeScript interfaces).
- Design System: `globals.css` with HSL color tokens, typography scales, glassmorphic cards, responsive grid systems.

### Backend Reusable Assets:
- Entire ORM layer (`models.py`) and schema definitions (`schemas.py`).
- Complete ML engine (`app/ml/engine.py` and `app/ml/production.py`).
- Security, session token validation, and RBAC authorization decorators (`dependencies.py`).
- Database seed routines (`seed.py`) with rich synthetic & realistic state data.

---

## 6. Gaps & Outdated Elements Identified

1. **Disconnected Navigation**:
   - Current sidebar displays 24 disparate menu items in a flat list without highlighting the **11-Stage Innovation Journey** or the **AI Command Center**.

2. **Hardcoded Legacy Labels**:
   - Certain frontend dashboard widgets referenced "Gujarat DPIIT Data" while backend models and routes support standard state governance (Maharashtra / National DPIIT). These labels need clean unification to reflect the state-agnostic yet Maharashtra-optimized architecture.

3. **AI Capabilities Scattered**:
   - High-value AI features (Risk Model explainability, Duplicate Clustering, Smart Matching, Challenge Generation, Pilot Risk, Scale Prediction, Model Drift) are spread across individual backend endpoints without a single, unified, state-of-the-art **AI Innovation Command Center** page.

4. **Journey Pipeline Visualization**:
   - The user currently lacks a real-time, interactive horizontal/vertical stepper that allows clicking any project/challenge to see its exact progression through all 11 stages.

---

## 7. Audit Conclusion

The UdaanSetu backend and architecture are robust, feature-complete, and mathematically sound. **No backend functionality should be deleted or replaced.** The core mission is to unify the frontend experience, highlight the 11-stage Innovation Journey, deliver the AI Innovation Command Center, and ensure all existing features are seamlessly integrated into this unified flow.
