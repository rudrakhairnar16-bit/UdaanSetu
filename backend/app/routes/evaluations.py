from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Evaluation
from app.schemas import EvaluationIn, EvaluationOut
from app.utils import audit_entity

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.get("", response_model=list[EvaluationOut])
def list_evaluations(
    challenge_id: int = 0,
    startup_id: int = 0,
    s: Session = Depends(db),
    u=Depends(current),
):
    q = s.query(Evaluation)
    if challenge_id:
        q = q.filter(Evaluation.challenge_id == challenge_id)
    if startup_id:
        q = q.filter(Evaluation.startup_id == startup_id)
    return q.order_by(Evaluation.created_at.desc()).all()


@router.get("/{eval_id}", response_model=EvaluationOut)
def get_evaluation(eval_id: int, s: Session = Depends(db), u=Depends(current)):
    e = s.get(Evaluation, eval_id)
    if not e:
        raise HTTPException(404, "Evaluation not found")
    return e


@router.post("", response_model=EvaluationOut)
def create_evaluation(x: EvaluationIn, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer", "mentor"))):
    e = Evaluation(**x.model_dump(), evaluator_id=u.id, evaluated_at=datetime.now(timezone.utc))
    s.add(e)
    s.commit()
    s.refresh(e)
    audit_entity(s, u.id, "evaluation", e.id, "created", {"challenge_id": e.challenge_id, "startup_id": e.startup_id})
    return e


@router.patch("/{eval_id}", response_model=EvaluationOut)
def update_evaluation(
    eval_id: int, x: EvaluationIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer", "mentor")),
):
    e = s.get(Evaluation, eval_id)
    if not e:
        raise HTTPException(404, "Evaluation not found")
    if e.evaluator_id != u.id and u.role != "admin":
        raise HTTPException(403, "Not authorized")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(e, k, v)
    s.commit()
    s.refresh(e)
    audit_entity(s, u.id, "evaluation", e.id, "updated", {"challenge_id": e.challenge_id})
    return e


@router.delete("/{eval_id}")
def delete_evaluation(eval_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    e = s.get(Evaluation, eval_id)
    if not e:
        raise HTTPException(404, "Evaluation not found")
    s.delete(e)
    s.commit()
    audit_entity(s, u.id, "evaluation", eval_id, "deleted", {"challenge_id": e.challenge_id})
    return {"message": "Evaluation deleted"}
