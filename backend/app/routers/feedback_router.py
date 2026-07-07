import csv
import io

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import ensure_roles, get_current_user
from app.schemas.feedback_schema import (
    FeedbackAssignRequest,
    FeedbackCreateRequest,
    FeedbackListResponse,
    FeedbackResponse,
    FeedbackStatusUpdateRequest,
)
from app.utils.response import success_response

# Feedback CRUD endpoints for creating, listing, filtering, updating, and deleting feedback
router = APIRouter(prefix="/feedback", tags=["Feedback"])


# Endpoint to create new feedback and generate AI analysis
@router.post("")
def create_feedback(
    payload: FeedbackCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ensure_roles(current_user, ["Admin", "Product Analyst"])

    from app.services.feedback_service import FeedbackService

    result = FeedbackService.create_feedback(
        db=db,
        payload=payload,
        current_user=current_user,
    )

    return success_response(
        message="Feedback created successfully",
        data=result,
    )


# Endpoint to list feedbacks with search, status, sentiment, and theme filtering
@router.get("")
def get_feedbacks(
    search: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    sentiment: str | None = Query(default=None),
    theme: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=100, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.repositories.feedback_repository import FeedbackRepository

    items, total = FeedbackRepository.list_feedbacks_active(
        db=db,
        search=search,
        status=status_filter,
        sentiment=sentiment,
        theme=theme,
        page=page,
        limit=limit,
    )

    response = FeedbackListResponse(
        items=[FeedbackResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit,
    )

    return success_response(
        message="Feedback records fetched successfully",
        data=response,
    )


# Endpoint to retrieve single feedback record by ID
@router.get("/{feedback_id}")
def get_feedback_by_id(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.repositories.feedback_repository import FeedbackRepository

    feedback = FeedbackRepository.get_feedback_by_id_active(db, feedback_id)

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    return success_response(
        message="Feedback fetched successfully",
        data=FeedbackResponse.model_validate(feedback),
    )


# Endpoint to update feedback status (Admin/Product Analyst/Support Lead only)
@router.patch("/{feedback_id}/status")
def update_feedback_status(
    feedback_id: int,
    payload: FeedbackStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ensure_roles(current_user, ["Admin", "Product Analyst", "Support Lead"])

    from app.repositories.feedback_repository import FeedbackRepository

    feedback = FeedbackRepository.get_feedback_by_id_active(db, feedback_id)

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    FeedbackRepository.update_status_simple(db, feedback, payload.status)

    return success_response(
        message="Feedback status updated successfully",
        data=FeedbackResponse.model_validate(feedback),
    )


# Endpoint to assign feedback to a team (Admin/Product Analyst only)
@router.patch("/{feedback_id}/assign")
def assign_feedback_team(
    feedback_id: int,
    payload: FeedbackAssignRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ensure_roles(current_user, ["Admin", "Product Analyst"])

    from app.repositories.feedback_repository import FeedbackRepository

    feedback = FeedbackRepository.get_feedback_by_id_active(db, feedback_id)

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    FeedbackRepository.assign_team(db, feedback, payload.assigned_team)

    return success_response(
        message="Feedback assigned successfully",
        data=FeedbackResponse.model_validate(feedback),
    )


# Endpoint to soft-delete feedback (Admin only)
@router.delete("/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ensure_roles(current_user, ["Admin"])

    from app.repositories.feedback_repository import FeedbackRepository

    feedback = FeedbackRepository.get_feedback_by_id_active(db, feedback_id)

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )

    FeedbackRepository.soft_delete_feedback(db, feedback)

    return success_response(
        message="Feedback deleted successfully",
        data=True,
    )


# Endpoint to bulk import feedbacks from CSV file with AI analysis
@router.post("/import")
async def import_feedback_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ensure_roles(current_user, ["Admin", "Product Analyst"])

    from app.services.feedback_service import FeedbackService

    result = await FeedbackService.import_feedback_from_csv_file(
        db=db,
        file=file,
        current_user=current_user,
    )

    return success_response(
        message="CSV import completed",
        data=result,
    )