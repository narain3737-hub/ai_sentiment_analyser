from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.models.feedback import Feedback, FeedbackAIAnalysis
from app.utils.file_logger import get_backend_logger


logger = get_backend_logger("service.dashboard")


class DashboardService:
    # Generate dashboard with sentiment counts and theme breakdown
    @staticmethod
    def get_sentiment_dashboard(db: Session):
        logger.info("Service get_sentiment_dashboard started")
        # Count total feedback records
        total_feedback = db.query(Feedback).count()

        # Count positive sentiment feedback
        positive = (
            db.query(FeedbackAIAnalysis)
            .filter(FeedbackAIAnalysis.sentiment == "Positive")
            .count()
        )

        neutral = (
            db.query(FeedbackAIAnalysis)
            .filter(FeedbackAIAnalysis.sentiment == "Neutral")
            .count()
        )

        negative = (
            db.query(FeedbackAIAnalysis)
            .filter(FeedbackAIAnalysis.sentiment == "Negative")
            .count()
        )

        # Count urgent feedback (urgency score >= 4)
        urgent = (
            db.query(FeedbackAIAnalysis)
            .filter(FeedbackAIAnalysis.urgency_score >= 4)
            .count()
        )

        # Query feedback grouped by theme with sentiment breakdown
        theme_rows = (
            db.query(
                FeedbackAIAnalysis.theme.label("theme"),
                func.sum(
                    case(
                        (FeedbackAIAnalysis.sentiment == "Positive", 1),
                        else_=0
                    )
                ).label("positive"),
                func.sum(
                    case(
                        (FeedbackAIAnalysis.sentiment == "Neutral", 1),
                        else_=0
                    )
                ).label("neutral"),
                func.sum(
                    case(
                        (FeedbackAIAnalysis.sentiment == "Negative", 1),
                        else_=0
                    )
                ).label("negative"),
                func.count(FeedbackAIAnalysis.id).label("total")
            )
            .group_by(FeedbackAIAnalysis.theme)
            # Sort themes by total feedback count descending
            .order_by(func.count(FeedbackAIAnalysis.id).desc())
            .all()
        )

        theme_breakdown = []

        # Convert theme rows to dictionary format
        for row in theme_rows:
            theme_breakdown.append(
                {
                    "theme": row.theme,
                    "positive": int(row.positive or 0),
                    "neutral": int(row.neutral or 0),
                    "negative": int(row.negative or 0),
                    "total": int(row.total or 0)
                }
            )

        # Return dashboard data with sentiment counts and theme breakdown
        return {
            "total_feedback": total_feedback,
            "positive": positive,
            "neutral": neutral,
            "negative": negative,
            "urgent": urgent,
            "theme_breakdown": theme_breakdown
        }
