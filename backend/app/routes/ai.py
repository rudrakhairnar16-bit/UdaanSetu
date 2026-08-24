from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import current, authorize, db
from app.models import Record, Challenge
from app.ml.engine import (
    get_semantic_engine, get_risk_engine, get_success_predictor,
    get_duplicate_detector, get_training_pipeline, build_records_data,
    get_startup_matcher, get_pilot_risk_scorer, get_scale_predictor,
)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/risk/{research_id}")
def ai_risk(research_id: int, s: Session = Depends(db), u=Depends(current)):
    r = s.get(Record, research_id)
    if not r or r.kind != "research":
        raise HTTPException(404, "Research project not found")
    milestones = s.query(Record).filter_by(kind="milestone", parent_id=r.id).all()
    risk_engine = get_risk_engine()
    prediction = risk_engine.predict(r, milestones)
    return {
        "research_id": r.id, "title": r.title,
        "score": prediction.score, "level": prediction.level,
        "confidence": prediction.confidence,
        "feature_importance": prediction.feature_importance,
        "reasons": prediction.reasons, "method": prediction.method,
    }


@router.get("/success/{research_id}")
def ai_success(research_id: int, s: Session = Depends(db), u=Depends(current)):
    r = s.get(Record, research_id)
    if not r or r.kind != "research":
        raise HTTPException(404, "Research project not found")
    milestones = s.query(Record).filter_by(kind="milestone", parent_id=r.id).all()
    predictor = get_success_predictor()
    sem = get_semantic_engine()
    query_text = f"{r.title} {r.description} {r.sector}"
    similar = sem.similarity(query_text, top_k=5)
    prediction = predictor.predict(r, milestones, all_similar=similar)
    return {
        "research_id": r.id, "title": r.title,
        "probability": prediction.probability,
        "confidence_interval": prediction.confidence_interval,
        "key_factors": prediction.key_factors,
        "comparable_projects": prediction.comparable_projects,
        "method": prediction.method,
    }


@router.get("/recommendations/{innovation_id}")
async def recommend(innovation_id: int, s: Session = Depends(db), u=Depends(current)):
    import httpx
    i = s.get(Record, innovation_id)
    if not i or i.kind != "innovation":
        raise HTTPException(404, "Innovation not found")
    corpus = s.query(Record).filter(Record.kind.in_(["mentor", "scheme", "incubator"])).all()
    query_text = f"{i.title} {i.description} {i.sector} {i.district}"

    sem = get_semantic_engine()
    corpus_texts = [f"{x.title} {x.description} {x.sector} {x.district}" for x in corpus]
    corpus_ids = [x.id for x in corpus]

    if set(corpus_ids) != set(sem.snapshot()[1]):
        sem.initialize(corpus_texts, corpus_ids)

    semantic_results = sem.similarity(query_text, top_k=len(corpus))

    id_to_record = {x.id: x for x in corpus}
    matches = []
    for result in semantic_results:
        rec = id_to_record.get(result.id)
        if rec:
            matches.append({
                "id": rec.id, "type": rec.kind, "title": rec.title,
                "stage": rec.stage, "sector": rec.sector, "district": rec.district,
                "score": result.score,
                "reason": f"Semantic match ({result.method}) — shared context in {rec.sector or 'General'}",
            })

    insight = f"Semantic analysis of '{i.title}' using {semantic_results[0].method if semantic_results else 'fallback'}."
    method = semantic_results[0].method if semantic_results else "fallback"

    if settings.ollama_enabled:
        try:
            p = {"model": settings.ollama_model, "stream": False,
                 "prompt": f"In 2-3 sentences, advise this innovation: {query_text}. Do not invent facts."}
            async with httpx.AsyncClient(timeout=25) as client:
                resp = await client.post(f"{settings.ollama_url}/api/generate", json=p)
                insight = resp.json().get("response", insight)
            method = f"Ollama {settings.ollama_model} + {method}"
        except Exception:
            insight += " Ollama was unavailable."

    return {"innovation_id": i.id, "title": i.title, "matches": matches,
            "insight": insight, "method": method}


@router.get("/similar/{record_id}")
def similar(record_id: int, s: Session = Depends(db), u=Depends(current)):
    r = s.get(Record, record_id)
    if not r:
        raise HTTPException(404, "Record not found")

    sem = get_semantic_engine()
    query_text = f"{r.title} {r.description} {r.sector}"
    results = sem.similarity(query_text, top_k=11)

    out = []
    for result in results:
        if result.id != record_id:
            rec = s.get(Record, result.id)
            if rec:
                out.append({
                    "id": rec.id, "title": rec.title, "type": rec.kind,
                    "similarity": result.score, "method": result.method,
                })
    return out[:10]


@router.get("/match/{innovation_id}")
def smart_match(innovation_id: int, s: Session = Depends(db), u=Depends(current)):
    i = s.get(Record, innovation_id)
    if not i or i.kind not in ("innovation", "startup"):
        raise HTTPException(404, "Innovation or startup not found")

    query_text = f"{i.title} {i.description} {i.sector} {i.district}"
    sem = get_semantic_engine()

    def score_matches(items, limit=3):
        if not items:
            return []
        item_texts = [f"{x.title} {x.description} {x.sector} {x.district}" for x in items]
        item_ids = [x.id for x in items]

        old_texts, old_ids = sem.snapshot()
        sem.initialize(item_texts + [query_text], item_ids + [-1])
        results = sem.similarity(query_text, top_k=min(limit, len(items)))
        sem.initialize(old_texts, old_ids)

        id_to_item = {x.id: x for x in items}
        scored = []
        for result in results:
            item = id_to_item.get(result.id)
            if item:
                scored.append({
                    "id": item.id, "title": item.title, "stage": item.stage,
                    "score": result.score,
                    "match_reason": f"Semantic match ({result.method}) — {item.sector or 'General'}",
                })
        return scored

    mentors = s.query(Record).filter_by(kind="mentor").all()
    schemes = s.query(Record).filter_by(kind="scheme").all()
    incubators = s.query(Record).filter_by(kind="incubator").all()

    return {
        "innovation_id": i.id, "title": i.title,
        "mentors": score_matches(mentors),
        "schemes": score_matches(schemes),
        "incubators": score_matches(incubators),
        "method": "semantic matching (sentence-transformers / TF-IDF)",
    }


@router.get("/duplicates")
def find_duplicates(threshold: float = Query(75.0, ge=50, le=100), s: Session = Depends(db), u=Depends(current)):
    sem = get_semantic_engine()
    all_records = s.query(Record).filter(Record.kind.in_(["research", "innovation", "ipr"])).all()
    if not all_records:
        return {"clusters": [], "method": "no records"}

    texts = [f"{r.title} {r.description} {r.sector}" for r in all_records]
    ids = [r.id for r in all_records]
    sem.initialize(texts, ids)

    detector = get_duplicate_detector()
    clusters = detector.detect(threshold=threshold / 100)

    return {
        "clusters": [
            {"id": c.id, "records": c.records, "similarity": c.similarity, "description": c.description}
            for c in clusters
        ],
        "total_checked": len(all_records),
        "threshold": threshold,
        "method": "Agglomerative clustering on semantic embeddings",
    }


@router.get("/metrics")
def ai_metrics(u=Depends(authorize("admin"))):
    pipeline = get_training_pipeline()
    return pipeline.get_all_metrics()


@router.post("/retrain")
def retrain_models(s: Session = Depends(db), u=Depends(authorize("admin"))):
    records = s.query(Record).all()
    records_data = build_records_data(records)
    pipeline = get_training_pipeline()
    results = pipeline.train_all(records_data)

    return {"message": "Models retrained", "results": results}


# ── SIH26136 — Startup Procurement AI Endpoints ──

@router.get("/match-startup/{challenge_id}")
def match_startups(challenge_id: int, top_k: int = Query(5, ge=1, le=20),
                   s: Session = Depends(db), u=Depends(current)):
    """Match startups to a government challenge based on semantic similarity."""
    challenge = s.get(Challenge, challenge_id)
    if not challenge:
        raise HTTPException(404, "Challenge not found")

    startups = s.query(Record).filter(Record.kind == "startup").all()
    startup_list = []
    for st in startups:
        startup_list.append({
            "id": st.id, "title": st.title, "description": st.description or "",
            "sector": st.sector or "", "district": st.district or "",
            "stage": st.stage or "",
            "capabilities": st.meta.get("impact", "") + " " + st.meta.get("revenue", ""),
        })

    challenge_text = f"{challenge.title} {challenge.description} {challenge.sector} {challenge.category}"
    matcher = get_startup_matcher()
    results = matcher.match_startups_to_challenge(challenge_text, startup_list, top_k=top_k)

    return {
        "challenge_id": challenge.id, "title": challenge.title,
        "matches": results, "total_startups_checked": len(startup_list),
    }


@router.get("/pilot-risk/{pilot_id}")
def pilot_risk(pilot_id: int, s: Session = Depends(db), u=Depends(current)):
    """Predict pilot success/failure risk using ML."""
    from app.models import Pilot, PilotMilestone
    pilot = s.get(Pilot, pilot_id)
    if not pilot:
        raise HTTPException(404, "Pilot not found")

    milestones = s.query(PilotMilestone).filter_by(pilot_id=pilot.id).all()
    completed = sum(1 for m in milestones if m.approval_status == "approved")
    total = len(milestones)

    features = {
        "budget_amount": float(pilot.budget or 0),
        "duration_weeks": pilot.duration_weeks or 12,
        "milestone_count": total,
        "department_match": 1.0,
        "startup_experience": 0.7,
        "risk_management_score": 0.8,
    }

    scorer = get_pilot_risk_scorer()
    result = scorer.predict(features)

    return {
        "pilot_id": pilot.id,
        "status": pilot.status,
        "milestones_completed": completed,
        "milestones_total": total,
        **result,
    }


@router.get("/scale-predict/{pilot_id}")
def scale_predict(pilot_id: int, s: Session = Depends(db), u=Depends(current)):
    """Predict whether a pilot should be scaled up."""
    from app.models import Pilot, PilotMilestone, ScaleUpDecision
    pilot = s.get(Pilot, pilot_id)
    if not pilot:
        raise HTTPException(404, "Pilot not found")

    milestones = s.query(PilotMilestone).filter_by(pilot_id=pilot.id).all()
    completed = sum(1 for m in milestones if m.approval_status == "approved")
    total = len(milestones)
    last_scale = s.query(ScaleUpDecision).filter_by(pilot_id=pilot.id).order_by(ScaleUpDecision.id.desc()).first()

    predictor = get_scale_predictor()
    result = predictor.predict({
        "success_probability": 0.85 if pilot.status == "in_progress" else 0.5,
        "budget_amount": float(pilot.budget or 0),
        "duration_weeks": pilot.duration_weeks or 12,
        "milestones_completed": completed,
        "total_milestones": total or 1,
    })

    return {
        "pilot_id": pilot.id,
        "status": pilot.status,
        "last_decision": last_scale.decision if last_scale else None,
        **result,
    }


@router.post("/challenge-draft")
def generate_challenge_draft(x: dict, u=Depends(authorize("govt_officer", "admin"))):
    """AI Challenge Generator — convert raw problem into structured challenge draft."""
    raw_problem = x.get("problem", "")
    department = x.get("department", "")
    sector = x.get("sector", "")

    if not raw_problem:
        raise HTTPException(400, "Problem description is required")

    MAHARASHTRA_DEPARTMENTS = [
        "Urban Development", "Information Technology", "Health & Family Welfare",
        "Agriculture", "School Education & Sports", "Water Resources & Irrigation",
        "Transport", "Industries & Energy", "Finance & Planning",
        "Public Works", "Housing", "Rural Development",
    ]

    MAHARASHTRA_KPI_MAP = {
        "Urban Development": [
            {"name": "Slum Rehousing Coverage", "target": "1000 households", "unit": "households"},
            {"name": "Infrastructure Delivery Time", "target": "< 6 months", "unit": "months"},
            {"name": "Citizen Satisfaction Score", "target": "4.0+ / 5.0", "unit": "rating"},
        ],
        "IT": [
            {"name": "Digital Service Uptime", "target": "99.5%", "unit": "percentage"},
            {"name": "Citizen Onboarding", "target": "10,000 users", "unit": "count"},
            {"name": "Data Breach Incidents", "target": "0", "unit": "count"},
        ],
        "Health & Family Welfare": [
            {"name": "Rural Clinic Coverage", "target": "80% PHCs connected", "unit": "percentage"},
            {"name": "Avg Response Time (Emergency)", "target": "< 15 min", "unit": "minutes"},
            {"name": "Patient Records Digitized", "target": "50,000", "unit": "count"},
        ],
        "Agriculture": [
            {"name": "Crop Yield Improvement", "target": "15% increase", "unit": "percentage"},
            {"name": "Farmer Adoption Rate", "target": "5000 farmers", "unit": "count"},
            {"name": "Water Usage Reduction", "target": "20% savings", "unit": "percentage"},
        ],
        "default": [
            {"name": "Solution Effectiveness", "target": "80% improvement over baseline", "unit": "percentage"},
            {"name": "User Adoption", "target": "500+ users in pilot phase", "unit": "count"},
            {"name": "Cost Efficiency", "target": "30% cost reduction vs current approach", "unit": "percentage"},
        ],
    }

    dept_display = department or "General Administration"
    dept_kpis = MAHARASHTRA_KPI_MAP.get(department, MAHARASHTRA_KPI_MAP["default"])

    generated = {
        "problem_statement": raw_problem,
        "suggested_title": f"Innovation Challenge — {dept_display}: {raw_problem[:80]}",
        "department": dept_display,
        "sector": sector or "Cross-cutting",
        "suggested_outcomes": [
            "Develop a scalable prototype addressing the stated problem",
            "Demonstrate measurable impact in pilot deployment across Maharashtra districts",
            "Provide documentation and training materials for state-wide rollout",
            "Meet Maharashtra e-Governance Standards (MeeSeva / GRAS integration where applicable)",
        ],
        "suggested_kpis": dept_kpis,
        "suggested_eligibility": [
            "DPIIT-registered startup",
            f"Sector: {sector or dept_display}",
            "Annual revenue < 100 Crore",
            "Not blacklisted by any Central or State government entity",
            "Minimum 1 year of operational history",
        ],
        "suggested_evaluation_criteria": [
            {"name": "Technical Feasibility", "weight": 0.25, "scale": "1-10", "description": "Can the solution be built and deployed within the pilot timeline?"},
            {"name": "Impact Potential", "weight": 0.25, "scale": "1-10", "description": "Expected benefit to Maharashtra citizens"},
            {"name": "Cost Efficiency", "weight": 0.15, "scale": "1-10", "description": "TCO vs current manual/legacy approach"},
            {"name": "Scalability", "weight": 0.15, "scale": "1-10", "description": "Can it scale to 36 districts?"},
            {"name": "Team Capability", "weight": 0.10, "scale": "1-10", "description": "Domain expertise and past delivery track record"},
            {"name": "Data & Privacy Compliance", "weight": 0.10, "scale": "1-10", "description": "DPDP Act 2023 and state data governance compliance"},
        ],
        "suggested_duration_weeks": 16,
        "suggested_budget_range": "5-25 Lakh INR (pilot phase)",
        "suggested_procurement_pathway": [
            {"channel": "GeM (Government e-Marketplace)", "suitability": "High", "notes": "Listed DPIIT startups can be sourced via GeM for direct purchase up to INR 50 Lakh"},
            {"channel": "Single Tender (below threshold)", "suitability": "Medium", "notes": "If only one eligible vendor, justify via single tender per GFR Rule 165"},
            {"channel": "Competitive Tender / RFP", "suitability": "High", "notes": "Standard route for higher-value procurement; publish on GeM and state portal"},
        ],
        "suggested_risks": [
            "Technical complexity may require iterative prototyping",
            "User adoption in government setting requires training and change management",
            "Data privacy compliance with DPDP Act 2023 and Maharashtra state data policy",
            "Interoperability with existing legacy systems (e.g., MeeSeva, GRAS)",
        ],
        "suggested_evidence_requirements": [
            "Working prototype demo (live or video walkthrough)",
            "User feedback from pilot group (min. 50 respondents)",
            "Cost-benefit analysis report with 3-year TCO projection",
            "Security audit certificate (CERT-In empanelled auditor)",
            "DPDP Act compliance self-assessment",
        ],
        "meta": {
            "department": department,
            "sector": sector,
            "generated_by": "ai_challenge_generator",
            "requires_officer_review": True,
            "note": "Officer must review and edit before publishing. KPIs are suggestions based on Maharashtra department context.",
        },
    }
    return generated
