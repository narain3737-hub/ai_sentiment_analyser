from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.utils.file_logger import get_backend_logger
from app.utils.response import success_response

# Dashboard analytics endpoints for sentiment and feedback metrics
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
logger = get_backend_logger("dashboard")


# Endpoint to retrieve sentiment analytics, status breakdown, themes, and recent feedback
@router.get("/sentiment")
def get_dashboard_sentiment(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.repositories.feedback_repository import FeedbackRepository

    logger.info("Dashboard sentiment requested by user_id=%s", current_user.id)
    feedbacks = FeedbackRepository.get_dashboard_feedbacks(db)

    # Count sentiment, status, theme, and assignment distribution
    total_feedback = len(feedbacks)

    sentiment_counter = Counter()
    status_counter = Counter()
    theme_counter = Counter()
    assigned_counter = Counter()

    # Extract recent 5 feedbacks with AI analysis details
    recent_feedback = []

    for feedback in feedbacks:
        analysis = feedback.ai_analysis

        sentiment = analysis.sentiment if analysis else "Neutral"
        theme = analysis.theme if analysis else "Other"

        sentiment_counter[sentiment] += 1
        status_counter[feedback.status or "New"] += 1
        theme_counter[theme] += 1
        assigned_counter[feedback.assigned_team or "Unassigned"] += 1

    for feedback in feedbacks[:5]:
        analysis = feedback.ai_analysis

        recent_feedback.append(
            {
                "id": feedback.id,
                "customer_name": feedback.customer_name,
                "channel": feedback.channel,
                "rating": feedback.rating,
                "feedback_date": feedback.feedback_date,
                "feedback_text": feedback.feedback_text,
                "status": feedback.status,
                "assigned_team": feedback.assigned_team,
                "sentiment": analysis.sentiment if analysis else "Neutral",
                "theme": analysis.theme if analysis else "Other",
                "urgency_score": analysis.urgency_score if analysis else 1,
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
        monthly_insight = "No feedback data is available yet."
    elif negative_count > positive_count:
        monthly_insight = "Negative feedback is higher than positive feedback. Focus on urgent customer issues and repeated complaints."
    elif positive_count > negative_count:
        monthly_insight = "Positive feedback is leading this period. Continue improving the features customers are responding well to."
    else:
        monthly_insight = "Feedback sentiment is balanced. Review themes and urgency to identify improvement areas."

    data = {
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
        "assigned_summary": dict(assigned_counter),
        "assignedSummary": dict(assigned_counter),
        "recent_feedback": recent_feedback,
        "recentFeedback": recent_feedback,
        "monthly_insight": monthly_insight,
        "monthlyInsight": monthly_insight,
    }

    logger.info(
        "Dashboard sentiment completed by user_id=%s total_feedback=%s",
        current_user.id,
        total_feedback,
    )

    return success_response(
        message="Dashboard analytics fetched successfully",
        data=data,
    )
