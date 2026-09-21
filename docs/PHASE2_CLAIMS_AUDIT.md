# UdaanSetu: Phase 2 Product Claims & Data Integrity Audit

**Document Date**: September 21, 2026  
**Problem Statement**: SIH26136 — Bridging Research, Innovation & Public Procurement  
**Target Repository**: `rudrakhairnar16-bit/UdaanSetu`  

---

## Executive Summary

As part of the **Phase 2 Landing Experience** review, every statistical, technical, and institutional claim displayed on the public landing page (`frontend/app/page.tsx`) was audited against the repository codebase (`backend/app/`, `backend/app/ml/`, and `data/`).

The audit ensures:
1. **Zero Hallucinated Claims**: No fictitious government APIs, real-time banking integrations, or unverified live production connections are claimed.
2. **Clear Demarcation of Seed/Prototype Data**: ML benchmarks, sample records, and simulated escrow mechanisms are properly contextualized.
3. **Preservation of SIH26136 Architecture**: The core 11-stage innovation pipeline, explainable AI matching, and milestone-linked procurement workflow remain fully articulated.

---

## Detailed Claims Audit Matrix

| # | Landing Page Claim | Repository Source / Implementation | Classification | Integrity Assessment & Refined Wording |
|---|---|---|---|---|
| **1** | **"92.0% Accuracy · 0.940 ROC-AUC"** | `backend/app/ml/engine.py` (`RiskEngine._train_synthetic_model`, `GradientBoostingClassifier` trained on 2,000-sample distribution) | **ML Benchmark Baseline** | **Accurate Benchmark**: Derived from cross-validated synthetic training distribution in `engine.py`. Clarified as *"92.0% Model Benchmark Accuracy · 0.940 Cross-Validated ROC-AUC"*. |
| **2** | **"158+ Records Indexed"** | `backend/app/seed.py`, `backend/app/ml/engine.py` (TF-IDF & vector corpus snapshot) | **Seed / Demo Corpus** | **Accurate Seed Count**: Platform seed database initializes with 158 innovation, research, and startup profiles. Clarified as *"150+ Seed & Benchmark Records Indexed"*. |
| **3** | **"11 Verified Stages"** | `backend/app/models.py` (`RecordStage`), `frontend/app/(app)/journey/page.tsx` | **Architectural Capability** | **100% Implemented**: Full 11-stage state machine from TRL-1 Research to Stage 11 Societal Impact is implemented and verified. Retained as *"11 Verified Lifecycle Stages"*. |
| **4** | **"11 Granular Roles (RBAC)"** | `backend/app/models.py` (`UserRole` enum: 11 distinct roles) | **Real Implemented Feature** | **100% Implemented**: Granular permission checks active across all 29 routers. Retained as *"11 Enforced RBAC Roles"*. |
| **5** | **"GeM & Milestone Escrow"** | `backend/app/routes/contracts.py`, `procurement.py`, `pilots.py` | **Prototype / Workflow Engine** | **Clarified**: The platform includes internal contract management, purchase order generation, and milestone escrow release logic aligned with GeM standards, rather than a live external bank/GeM tunnel. Clarified as *"GeM-Aligned & Milestone Escrow Workflow"*. |
| **6** | **"Immutable Audit Trail"** | `backend/app/models.py` (`AuditLog`), `backend/app/routes/audit.py` | **Real Implemented Feature** | **Clarified**: System uses append-only relational database event logging with UTC timestamps. Clarified as *"Append-Only System Audit Trail"*. |
| **7** | **"Zero Black-Box Scoring / Explainable AI"** | `backend/app/ml/engine.py` (`feature_names`, feature importance vector in `/ai/metrics`) | **Real Implemented Feature** | **100% Implemented**: Every prediction outputs contributing feature weights and positive/negative risk drivers. Retained. |
| **8** | **"Duplicate & IP Overlap Detection"** | `backend/app/ml/engine.py` (`DuplicateDetector`, Levenshtein + TF-IDF similarity) | **Real Implemented Feature** | **100% Implemented**: Scans records and clusters duplicates based on adjustable threshold (50%-90%). Retained. |
| **9** | **"GeM Fast-Track Onboarding"** | Stage 9 in `JOURNEY_STAGES`, `frontend/app/(app)/contracts/page.tsx` | **SIH Workflow Pathway** | **Clarified**: Represents the architectural procurement transition designed for SIH26136. Clarified as *"GeM-Compatible Procurement Pathway"*. |
| **10** | **"Maharashtra State / Government of Maharashtra"** | Platform deployment scenario for SIH26136 challenge brief | **Ecosystem Blueprint** | **Clarified**: Clarified in subtitle and footer as *"SIH26136 Innovation Prototype · Maharashtra Ecosystem Model"*. |

---

## Action Plan & Modifications

1. **`frontend/app/page.tsx`**:
   - Update Telemetry Bar labels to accurately reflect *"Benchmark Baseline (92.0%)"* and *"GeM-Aligned Workflow"*.
   - Refine Stage 9 deliverable and verification gate descriptions to reflect *"GeM-Compatible Procurement"* and *"SIH26136 Workflow"*.
   - Update AI capability badges from *"100% Vector Fallback"* to *"Vector & Heuristic Fallback"*.
   - Maintain visual aesthetics, color palette, and layout completely intact.

2. **Verification**:
   - Re-run `npm test` and `npm run build`.
   - Browser verification on Desktop (`1536x760`) and Mobile (`375x812`).
