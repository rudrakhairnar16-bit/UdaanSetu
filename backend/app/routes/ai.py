from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import current, authorize, db
from app.models import Record
from app.ml.engine import (
    get_semantic_engine, get_risk_engine, get_success_predictor,
    get_duplicate_detector, get_training_pipeline,
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

    if set(corpus_ids) != set(sem._corpus_ids):
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

        old_texts, old_ids = sem._corpus_texts[:], sem._corpus_ids[:]
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
    records_data = [
        {"id": r.id, "title": r.title, "description": r.description,
         "sector": r.sector, "district": r.district}
        for r in records
    ]
    pipeline = get_training_pipeline()
    results = pipeline.train_all(records_data)

    texts = [f"{r.title} {r.description} {r.sector} {r.district}" for r in records]
    ids = [r.id for r in records]
    sem = get_semantic_engine()
    sem.initialize(texts, ids)

    return {"message": "Models retrained", "results": results}
