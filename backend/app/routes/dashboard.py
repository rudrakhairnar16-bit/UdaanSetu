from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.cache import cache_get, cache_set
from app.dependencies import current, db
from app.models import Record

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/role-based")
def role_based_dashboard(s: Session = Depends(db), u=Depends(current)):
    """Role-specific dashboard data based on user role."""
    from app.models import Challenge, Pilot, Application, Evaluation, Procurement, Grievance, Validation, User

    role = u.role
    result = {"role": role, "user": {"id": u.id, "name": u.name, "district": u.district}}

    if role == "admin":
        result["overview"] = {
            "total_challenges": s.query(Challenge).count(),
            "total_pilots": s.query(Pilot).count(),
            "total_applications": s.query(Application).count(),
            "total_evaluations": s.query(Evaluation).count(),
            "total_procurements": s.query(Procurement).count(),
            "total_grievances": s.query(Grievance).count(),
            "total_users": s.query(User).count(),
        }
        result["recent_activity"] = []

    elif role == "govt_officer":
        result["my_challenges"] = s.query(Challenge).filter_by(owner_id=u.id).count()
        result["my_pilots"] = s.query(Pilot).filter_by(owner_id=u.id).count()
        result["pending_evaluations"] = s.query(Evaluation).count()
        result["open_grievances"] = s.query(Grievance).filter(Grievance.status.in_(["open", "in_progress"])).count()

    elif role == "startup":
        from app.models import Record
        startup = s.query(Record).filter_by(kind="startup", owner_id=u.id).first()
        if startup:
            result["my_applications"] = s.query(Application).filter_by(startup_id=startup.id).count()
            result["my_pilots"] = s.query(Pilot).filter_by(startup_id=startup.id).count()
            result["my_grievances"] = s.query(Grievance).filter_by(startup_id=startup.id).count()
        else:
            result["message"] = "No startup profile found"

    elif role == "evaluator":
        result["pending_evaluations"] = s.query(Evaluation).filter_by(evaluator_id=u.id).count()
        result["total_evaluations"] = s.query(Evaluation).filter_by(evaluator_id=u.id).count()

    elif role == "validator":
        result["my_validations"] = s.query(Validation).filter_by(validator_id=u.id).count()
        result["pending_validations"] = s.query(Validation).filter_by(validator_id=u.id, outcome="pending").count()

    elif role == "procurement_officer":
        result["pending_procurements"] = s.query(Procurement).filter_by(approval_status="pending").count()
        result["approved_procurements"] = s.query(Procurement).filter_by(approval_status="approved").count()

    elif role == "auditor":
        from app.models import AuditLog
        result["total_audit_entries"] = s.query(AuditLog).count()
        result["recent_audit_entries"] = s.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(20).all()

    return result


@router.get("/analytics/pipeline-funnel")
def pipeline_funnel_analytics(s: Session = Depends(db), u=Depends(current)):
    """Pipeline funnel: Challenges -> Applications -> Eligible -> Shortlisted -> Pilots -> Procurement -> Scale."""
    from app.models import Challenge, Application, EligibilityCheck, Pilot, Procurement, ScaleUpDecision

    total_challenges = s.query(Challenge).count()
    total_applications = s.query(Application).count()
    eligible_apps = s.query(EligibilityCheck).filter_by(result="eligible").count()
    total_pilots = s.query(Pilot).count()
    in_progress_pilots = s.query(Pilot).filter_by(status="in_progress").count()
    completed_pilots = s.query(Pilot).filter_by(status="completed").count()
    total_procurements = s.query(Procurement).count()
    approved_procurements = s.query(Procurement).filter_by(approval_status="approved").count()
    total_scale = s.query(ScaleUpDecision).filter_by(decision="scale").count()

    return {
        "label": "Procurement Pipeline Funnel",
        "funnel": [
            {"stage": "Challenges Published", "count": total_challenges, "pct": 100},
            {"stage": "Applications Received", "count": total_applications, "pct": round(total_applications / max(1, total_challenges) * 100, 1)},
            {"stage": "Eligible Applications", "count": eligible_apps, "pct": round(eligible_apps / max(1, total_challenges) * 100, 1)},
            {"stage": "Pilots Initiated", "count": total_pilots, "pct": round(total_pilots / max(1, total_challenges) * 100, 1)},
            {"stage": "Pilots In Progress", "count": in_progress_pilots, "pct": round(in_progress_pilots / max(1, total_challenges) * 100, 1)},
            {"stage": "Pilots Completed", "count": completed_pilots, "pct": round(completed_pilots / max(1, total_challenges) * 100, 1)},
            {"stage": "Procurements", "count": total_procurements, "pct": round(total_procurements / max(1, total_challenges) * 100, 1)},
            {"stage": "Approved Procurements", "count": approved_procurements, "pct": round(approved_procurements / max(1, total_challenges) * 100, 1)},
            {"stage": "Scaled Solutions", "count": total_scale, "pct": round(total_scale / max(1, total_challenges) * 100, 1)},
        ],
    }


@router.get("/analytics/tat")
def tat_analytics(s: Session = Depends(db), u=Depends(current)):
    """Turnaround time analytics per stage."""
    from datetime import datetime
    from app.models import Application, Pilot, Validation, Procurement

    apps = s.query(Application).all()
    app_tats = []
    for a in apps:
        if a.created_at and a.updated_at:
            tat_days = (a.updated_at - a.created_at).days
            app_tats.append({"id": a.id, "tat_days": tat_days, "status": a.status})

    pilots = s.query(Pilot).all()
    pilot_tats = []
    for p in pilots:
        if p.start_date and p.end_date:
            tat_days = (p.end_date - p.start_date).days
            pilot_tats.append({"id": p.id, "tat_days": tat_days, "status": p.status})

    return {
        "label": "Turnaround Time Analytics",
        "application_tat": {
            "avg_days": round(sum(t["tat_days"] for t in app_tats) / max(1, len(app_tats)), 1),
            "items": app_tats[:10],
        },
        "pilot_tat": {
            "avg_days": round(sum(t["tat_days"] for t in pilot_tats) / max(1, len(pilot_tats)), 1),
            "items": pilot_tats[:10],
        },
    }


@router.get("/analytics/pilot-success")
def pilot_success_analytics(s: Session = Depends(db), u=Depends(current)):
    """Pilot success rate and conversion analytics."""
    from app.models import Pilot, PilotMetric, Validation

    pilots = s.query(Pilot).all()
    by_status = {}
    for p in pilots:
        by_status[p.status] = by_status.get(p.status, 0) + 1

    metrics = s.query(PilotMetric).all()
    target_met = sum(1 for m in metrics if m.actual_value and m.target_value and float(m.actual_value.replace(",", "")) >= float(m.target_value.replace(",", "")))
    total_metrics = len(metrics)

    validations = s.query(Validation).all()
    outcomes = {}
    for v in validations:
        outcomes[v.outcome] = outcomes.get(v.outcome, 0) + 1

    return {
        "label": "Pilot Success Analytics",
        "pilots_by_status": by_status,
        "total_pilots": len(pilots),
        "metrics": {
            "total": total_metrics,
            "target_met": target_met,
            "target_met_pct": round(target_met / max(1, total_metrics) * 100, 1),
        },
        "validation_outcomes": outcomes,
        "success_rate": round(completed := by_status.get("completed", 0) / max(1, len(pilots)) * 100, 1),
    }


@router.get("/analytics/impact")
def impact_analytics(s: Session = Depends(db), u=Depends(current)):
    """Impact metrics: beneficiaries, cost savings, ROI."""
    from app.models import Pilot, PilotMetric, ScaleUpDecision, Record

    pilots = s.query(Pilot).all()
    total_budget = sum(float(p.budget or 0) for p in pilots)

    startups = s.query(Record).filter_by(kind="startup").all()
    total_farmers = sum(r.meta.get("farmers_served", 0) for r in startups)
    total_patients = sum(r.meta.get("patients_served", 0) for r in startups)
    total_jobs = sum(r.meta.get("jobs_created", 0) for r in startups)

    scale_decisions = s.query(ScaleUpDecision).filter_by(decision="scale").all()
    total_scale_budget = sum(float(sd.budget_allocation or 0) for sd in scale_decisions)

    return {
        "label": "Impact Metrics",
        "beneficiaries": {
            "farmers_reached": total_farmers,
            "patients_served": total_patients,
            "jobs_created": total_jobs,
        },
        "financial": {
            "total_pilot_budget": total_budget,
            "total_scale_budget": total_scale_budget,
            "roi_estimate": round(total_scale_budget / max(1, total_budget) * 100, 1),
        },
        "pilots": {
            "total": len(pilots),
            "scaled": len(scale_decisions),
            "conversion_rate": round(len(scale_decisions) / max(1, len(pilots)) * 100, 1),
        },
    }


@router.get("/dashboard")
def dashboard(district: Optional[str] = None, s: Session = Depends(db), u=Depends(current)):
    cache_key = f"dashboard:{district or 'all'}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    query = s.query(Record)
    if district:
        query = query.filter(Record.district == district)
    allr = query.all()
    research = [r for r in allr if r.kind == "research"]
    milestones = [r for r in allr if r.kind == "milestone"]
    at_risk = []
    from app.ml.engine import get_risk_engine
    risk_engine = get_risk_engine()
    for rp in research:
        rp_milestones = [m for m in milestones if m.parent_id == rp.id]
        prediction = risk_engine.predict(rp, rp_milestones)
        at_risk.append({
            "id": rp.id, "title": rp.title,
            "score": prediction.score, "level": prediction.level,
            "confidence": prediction.confidence,
            "feature_importance": prediction.feature_importance,
            "reasons": prediction.reasons, "method": prediction.method,
        })
    at_risk.sort(key=lambda x: x["score"], reverse=True)

    pipeline = {}
    for kind in ["research", "innovation", "ipr", "startup", "funding_request"]:
        items = [r for r in allr if r.kind == kind]
        stages = {}
        for item in items:
            stages[item.stage] = stages.get(item.stage, 0) + 1
        pipeline[kind] = {"total": len(items), "stages": stages}

    result = {
        "banner": "UdaanSetu — Maharashtra Startup Procurement Platform",
        "counts": {k: sum(1 for r in allr if r.kind == k)
                   for k in ["research", "innovation", "ipr", "startup",
                             "mentor", "scheme", "incubator", "funding_request"]},
        "at_risk": at_risk,
        "recent": allr[:10],
        "pipeline": pipeline,
        "districts": list(set(r.district for r in allr if r.district)),
    }
    cache_set(cache_key, result)
    return result


@router.get("/analytics/overview")
def analytics_overview(s: Session = Depends(db), u=Depends(current)):
    cache_key = "analytics:overview"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    total = s.query(Record).count()
    by_kind = dict(s.query(Record.kind, func.count(Record.id)).group_by(Record.kind).all())
    by_sector = dict(s.query(Record.sector, func.count(Record.id)).filter(Record.sector != "").group_by(Record.sector).all())
    by_district = dict(s.query(Record.district, func.count(Record.id)).filter(Record.district != "").group_by(Record.district).all())
    research = s.query(Record).filter_by(kind="research").all()
    avg_progress = sum(r.meta.get("progress", 0) for r in research) / max(1, len(research))
    total_funding = sum(r.meta.get("funding_required", 0) for r in research)
    startups = s.query(Record).filter_by(kind="startup").all()
    result = {
        "total_records": total, "by_kind": by_kind, "by_sector": by_sector,
        "by_district": by_district, "avg_research_progress": round(avg_progress, 1),
        "total_funding_required": total_funding,
        "total_startup_revenue": sum(r.meta.get("revenue", 0) for r in startups),
        "total_jobs_created": sum(r.meta.get("jobs_created", 0) for r in startups),
        "total_farmers_reached": sum(r.meta.get("farmers_reached", 0) for r in startups),
        "label": "Maharashtra Startup Procurement — Ecosystem Metrics",
    }
    cache_set(cache_key, result)
    return result


@router.get("/analytics/districts")
def district_analytics(s: Session = Depends(db), u=Depends(current)):
    cache_key = "analytics:districts"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    rows = (
        s.query(Record.district, Record.kind, func.count(Record.id))
        .filter(Record.district != "")
        .group_by(Record.district, Record.kind)
        .all()
    )
    data = {}
    for d, k, n in rows:
        data.setdefault(d, {})[k] = n
    result = {
        "label": "Maharashtra District Analytics",
        "districts": [{"district": d, **v} for d, v in data.items()],
    }
    cache_set(cache_key, result)
    return result


@router.get("/analytics/ecosystem")
def ecosystem_analytics(s: Session = Depends(db), u=Depends(current)):
    cache_key = "analytics:ecosystem"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    counts = (
        s.query(Record.kind, func.count(Record.id))
        .group_by(Record.kind)
        .all()
    )
    count_map = {k: n for k, n in counts}

    mentor_rows = (
        s.query(Record.meta, Record.sector)
        .filter(Record.kind == "mentor")
        .all()
    )
    expertise_map = {}
    for meta, sector in mentor_rows:
        if meta and isinstance(meta, dict):
            for exp in meta.get("expertise", [sector]):
                expertise_map[exp] = expertise_map.get(exp, 0) + 1
    mentor_expertise = [{"expertise": k, "count": v} for k, v in sorted(expertise_map.items(), key=lambda x: -x[1])]

    scheme_rows = (
        s.query(Record.meta)
        .filter(Record.kind == "scheme")
        .all()
    )
    scheme_type_map = {}
    for (meta,) in scheme_rows:
        if meta and isinstance(meta, dict):
            t = meta.get("type", "Unknown")
            scheme_type_map[t] = scheme_type_map.get(t, 0) + 1
    schemes_by_type = [{"type": k, "count": v} for k, v in sorted(scheme_type_map.items(), key=lambda x: -x[1])]

    inc_rows = (
        s.query(Record.meta)
        .filter(Record.kind == "incubator")
        .all()
    )
    inc_type_map = {}
    top_incubators = []
    for (meta,) in inc_rows:
        if meta and isinstance(meta, dict):
            t = meta.get("type", "Unknown")
            inc_type_map[t] = inc_type_map.get(t, 0) + 1
            top_incubators.append({
                "name": meta.get("name", ""),
                "type": t,
                "city": meta.get("city", ""),
                "focus_areas": meta.get("focus_areas", []),
                "startups_supported": meta.get("startups_supported", 0),
                "founded_year": meta.get("founded_year", 0),
            })
    top_incubators.sort(key=lambda x: -x.get("startups_supported", 0))
    incubator_types = [{"type": k, "count": v} for k, v in sorted(inc_type_map.items(), key=lambda x: -x[1])]

    result = {
        "total_research": count_map.get("research", 0),
        "total_ipr": count_map.get("ipr", 0),
        "total_innovation": count_map.get("innovation", 0),
        "total_mentors": count_map.get("mentor", 0),
        "total_schemes": count_map.get("scheme", 0),
        "total_incubators": count_map.get("incubator", 0),
        "total_startups": count_map.get("startup", 0),
        "mentor_expertise": mentor_expertise,
        "schemes_by_type": schemes_by_type,
        "incubator_types": incubator_types,
        "top_incubators": top_incubators[:15],
    }
    cache_set(cache_key, result)
    return result


@router.get("/monitoring/health-check")
def detailed_health_check(s: Session = Depends(db)):
    from app.models import User, Challenge, Pilot, Application
    try:
        from sqlalchemy import text
        s.execute(text("SELECT 1"))
        db_ok = True
    except:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "ok" if db_ok else "error",
        "users": s.query(User).count() if db_ok else 0,
        "challenges": s.query(Challenge).count() if db_ok else 0,
        "pilots": s.query(Pilot).count() if db_ok else 0,
        "applications": s.query(Application).count() if db_ok else 0,
    }


# ── SIH26136 — Maharashtra Procurement Dashboard Analytics ──

@router.get("/analytics/maharashtra")
def maharashtra_procurement_analytics(s: Session = Depends(db), u=Depends(current)):
    """Maharashtra-specific procurement pipeline analytics."""
    from app.models import Challenge, Pilot, PilotMilestone, Payment, ScaleUpDecision, Department

    challenges = s.query(Challenge).all()
    pilots = s.query(Pilot).all()
    payments = s.query(Payment).all()
    departments = s.query(Department).all()
    scale_decisions = s.query(ScaleUpDecision).all()

    challenge_by_status = {}
    for c in challenges:
        challenge_by_status[c.status] = challenge_by_status.get(c.status, 0) + 1

    challenge_by_sector = {}
    for c in challenges:
        challenge_by_sector[c.sector or "Unknown"] = challenge_by_sector.get(c.sector or "Unknown", 0) + 1

    pilot_by_status = {}
    for p in pilots:
        pilot_by_status[p.status] = pilot_by_status.get(p.status, 0) + 1

    total_budget = sum(float(p.budget or 0) for p in pilots)
    total_paid = sum(float(p.amount or 0) for p in payments if p.payment_status == "completed")
    total_pending_payments = sum(float(p.amount or 0) for p in payments if p.payment_status == "pending")

    scale_by_decision = {}
    for sd in scale_decisions:
        scale_by_decision[sd.decision] = scale_by_decision.get(sd.decision, 0) + 1

    return {
        "label": "Maharashtra Government Procurement Pipeline",
        "departments_count": len(departments),
        "challenges": {
            "total": len(challenges),
            "by_status": challenge_by_status,
            "by_sector": challenge_by_sector,
        },
        "pilots": {
            "total": len(pilots),
            "by_status": pilot_by_status,
            "total_budget": total_budget,
        },
        "payments": {
            "total_paid": total_paid,
            "total_pending": total_pending_payments,
            "total_invoices": len(payments),
        },
        "scale_decisions": {
            "total": len(scale_decisions),
            "by_decision": scale_by_decision,
        },
    }
