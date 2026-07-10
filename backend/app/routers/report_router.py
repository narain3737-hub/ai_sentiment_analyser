from collections import Counter, defaultdict
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.utils.file_logger import get_backend_logger
from app.utils.response import success_response

# Monthly report endpoints for aggregating feedback metrics and insights
router = APIRouter(prefix="/reports", tags=["Reports"])
logger = get_backend_logger("reports")


# Endpoint to retrieve monthly report with feedback aggregation and sentiment analysis
@router.get("/monthly")
def get_monthly_report(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2000),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    today = date.today()
    urgency_counter = Counter()

    # Use provided month/year or default to current date
    selected_month = month or today.month
    selected_year = year or today.year

    from app.repositories.feedback_repository import FeedbackRepository

    logger.info(
        "Monthly report requested by user_id=%s month=%s year=%s",
        current_user.id,
        selected_month,
        selected_year,
    )
    # Query feedbacks for selected month with AI analysis data via repository
    feedbacks = FeedbackRepository.get_monthly_report_feedbacks(
        db=db,
        month=selected_month,
        year=selected_year,
    )

    total_feedback = len(feedbacks)

    # Aggregate sentiment, status, theme, urgency, and assignment metrics
    sentiment_counter = Counter()
    status_counter = Counter()
    theme_counter = Counter()
    assigned_counter = Counter()
    daily_counter = defaultdict(int)

    # Build detailed feedback items with extracted sentiment and urgency classification
    feedback_items = []

    for feedback in feedbacks:
        analysis = feedback.ai_analysis

        sentiment = analysis.sentiment if analysis else "Neutral"
        theme = analysis.theme if analysis else "Other"
        urgency_score = analysis.urgency_score if analysis else 1

        if urgency_score >= 4:
            urgency = "High"
        elif urgency_score >= 2:
            urgency = "Medium"
        else:
            urgency = "Low"

        sentiment_counter[sentiment] += 1
        status_counter[feedback.status or "New"] += 1
        theme_counter[theme] += 1
        urgency_counter[urgency] += 1
        assigned_counter[feedback.assigned_team or "Unassigned"] += 1

        daily_key = feedback.feedback_date.strftime("%d-%m-%Y")
        daily_counter[daily_key] += 1

        feedback_items.append(
            {
                "id": feedback.id,
                "customer_name": feedback.customer_name,
                "channel": feedback.channel,
                "rating": feedback.rating,
                "feedback_date": feedback.feedback_date,
                "created_at": feedback.created_at,
                "updated_at": feedback.updated_at,
                "feedback_text": feedback.feedback_text,
                "status": feedback.status,
                "assigned_team": feedback.assigned_team,
                "sentiment": sentiment,
                "theme": theme,
                "urgency": urgency,
                "urgency_score": urgency_score,
                "summary": analysis.summary if analysis else "",
                "recommended_action": analysis.recommended_action if analysis else "",
            }
        )

    positive_count = sentiment_counter.get("Positive", 0)
    neutral_count = sentiment_counter.get("Neutral", 0)
    negative_count = sentiment_counter.get("Negative", 0)

    new_count = status_counter.get("New", 0)
    reviewed_count = status_counter.get("Reviewed", 0)
    planned_count = status_counter.get("Planned", 0)
    resolved_count = status_counter.get("Resolved", 0)
    ignored_count = status_counter.get("Ignored", 0)

    # Generate insight based on sentiment distribution
    if total_feedback == 0:
        monthly_insight = "No feedback records are available for the selected month."
    elif negative_count > positive_count:
        monthly_insight = "Negative feedback is higher this month. Prioritize urgent issues and recurring customer pain points."
    elif positive_count > negative_count:
        monthly_insight = "Positive feedback is strong this month. Continue improving the areas customers appreciate most."
    else:
        monthly_insight = "Customer sentiment is balanced this month. Review theme and urgency patterns for better prioritization."

    data = {
        "month": selected_month,
        "year": selected_year,

        "total_feedback": total_feedback,
        "totalFeedback": total_feedback,

        "positive": positive_count,
        "neutral": neutral_count,
        "negative": negative_count,

        "sentiment_summary": {
            "Positive": positive_count,
            "Neutral": neutral_count,
            "Negative": negative_count,
        },
        "sentimentSummary": {
            "Positive": positive_count,
            "Neutral": neutral_count,
            "Negative": negative_count,
        },

        "progress": {
            "New": new_count,
            "Reviewed": reviewed_count,
            "Planned": planned_count,
            "Resolved": resolved_count,
            "Ignored": ignored_count,
        },

        "status_summary": {
            "New": new_count,
            "Reviewed": reviewed_count,
            "Planned": planned_count,
            "Resolved": resolved_count,
            "Ignored": ignored_count,
        },
        "statusSummary": {
            "New": new_count,
            "Reviewed": reviewed_count,
            "Planned": planned_count,
            "Resolved": resolved_count,
            "Ignored": ignored_count,
        },

        "theme_summary": dict(theme_counter),
        "themeSummary": dict(theme_counter),

        "urgency_summary": dict(urgency_counter),
        "urgencySummary": dict(urgency_counter),

        "assigned_summary": dict(assigned_counter),
        "assignedSummary": dict(assigned_counter),

        "daily_summary": dict(daily_counter),
        "dailySummary": dict(daily_counter),

        "feedback_items": feedback_items,
        "feedbackItems": feedback_items,

        "monthly_insight": monthly_insight,
        "monthlyInsight": monthly_insight,
    }

    logger.info(
        "Monthly report completed by user_id=%s month=%s year=%s total_feedback=%s",
        current_user.id,
        selected_month,
        selected_year,
        total_feedback,
    )

    return success_response(
        message="Monthly report fetched successfully",
        data=data,
    )
