from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import ensure_admin, get_current_user
from app.schemas.feedback_schema import (
    AnalyzeFeedbackRequest,
    FeedbackAIAnalysisResponse,
    FeedbackResponse,
)
from app.services.ai_service import AIService
from app.utils.file_logger import get_backend_logger
from app.utils.response import success_response

# AI analysis routes for feedback processing
router = APIRouter(prefix="/ai", tags=["AI Analysis"])
logger = get_backend_logger("ai")


# Helper to retrieve feedback with AI analysis data loaded via repository
def get_feedback_with_ai_analysis(db: Session, feedback_id: int):
    from app.repositories.feedback_repository import FeedbackRepository

    feedback = FeedbackRepository.get_feedback_by_id(db, feedback_id)

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    return feedback


# Endpoint to analyze feedback with AI and generate insights
@router.post("/analyze-feedback")
def analyze_feedback(
    payload: AnalyzeFeedbackRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ensure_admin(current_user)
    logger.info(
        "AI analyze-feedback requested by user_id=%s feedback_id=%s",
        current_user.id,
        payload.feedback_id,
    )

    analysis = AIService.analyze_feedback(
        db=db,
        feedback_id=payload.feedback_id,
    )

    logger.info(
        "AI analyze-feedback completed by user_id=%s feedback_id=%s",
        current_user.id,
        payload.feedback_id,
    )

    return success_response(
        message="Feedback analyzed successfully",
        data=FeedbackAIAnalysisResponse.model_validate(analysis),
    )


# Endpoint to re-analyze existing feedback with updated AI model
@router.post("/feedback/{feedback_id}/reanalyze")
def reanalyze_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ensure_admin(current_user)
    logger.info(
        "AI reanalyze requested by user_id=%s feedback_id=%s",
        current_user.id,
        feedback_id,
    )

    AIService.analyze_feedback(
        db=db,
        feedback_id=feedback_id,
    )

    db.expire_all()

    feedback = get_feedback_with_ai_analysis(
        db=db,
        feedback_id=feedback_id,
    )

    logger.info(
        "AI reanalyze completed by user_id=%s feedback_id=%s",
        current_user.id,
        feedback_id,
    )

    return success_response(
        message="Feedback re-analyzed successfully",
        data=FeedbackResponse.model_validate(feedback),
    )
