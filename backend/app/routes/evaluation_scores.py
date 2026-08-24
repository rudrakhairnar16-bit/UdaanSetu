from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Evaluation, EvaluationScore
from app.schemas import EvaluationScoreIn, EvaluationScoreOut
from app.utils import audit_entity

router = APIRouter(prefix="/evaluation-scores", tags=["evaluation-scores"])


@router.get("/evaluation/{evaluation_id}", response_model=list[EvaluationScoreOut])
def list_scores(evaluation_id: int, s: Session = Depends(db), u=Depends(current)):
    return s.query(EvaluationScore).filter_by(evaluation_id=evaluation_id).order_by(EvaluationScore.id).all()


@router.post("/evaluation/{evaluation_id}", response_model=EvaluationScoreOut)
def create_score(
    evaluation_id: int, x: EvaluationScoreIn, s: Session = Depends(db),
    u=Depends(authorize("evaluator", "admin")),
):
    e = s.get(Evaluation, evaluation_id)
    if not e:
        raise HTTPException(404, "Evaluation not found")
    score = EvaluationScore(evaluation_id=evaluation_id, **x.model_dump())
    s.add(score)
    s.commit()
    s.refresh(score)
    audit_entity(s, u.id, "evaluation_score", score.id, "created", {"evaluation_id": evaluation_id, "criterion": score.criterion})
    return score


@router.post("/evaluation/{evaluation_id}/aggregate")
def aggregate_scores(evaluation_id: int, s: Session = Depends(db), u=Depends(authorize("evaluator", "admin"))):
    e = s.get(Evaluation, evaluation_id)
    if not e:
        raise HTTPException(404, "Evaluation not found")
    scores = s.query(EvaluationScore).filter_by(evaluation_id=evaluation_id).all()
    if not scores:
        raise HTTPException(400, "No scores found")
    total_weight = sum(sc.weight for sc in scores)
    if total_weight == 0:
        raise HTTPException(400, "Total weight is zero")
    weighted_sum = sum(sc.weight * sc.score for sc in scores)
    final_score = round(weighted_sum / total_weight, 2)
    e.scores = {**e.scores, "weighted_final": final_score, "total_weight": total_weight}
    s.commit()
    return {"weighted_final": final_score, "total_weight": total_weight, "breakdown": [{"criterion": sc.criterion, "weight": sc.weight, "score": sc.score, "weighted": round(sc.weight * sc.score, 2)} for sc in scores]}
