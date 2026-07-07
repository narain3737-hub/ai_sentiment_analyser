from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case

from app.models.feedback import Feedback, FeedbackAIAnalysis


class ReportService:
    # Generate monthly report with sentiment, theme, and resolution metrics
    @staticmethod
    def get_monthly_report(db: Session):
        # Query feedback grouped by month with total count and resolved count
        month_rows = (
            db.query(
                extract("year", Feedback.created_at).label("year"),
                extract("month", Feedback.created_at).label("month"),
                func.count(Feedback.id).label("total"),
                func.sum(
                    case(
                        (Feedback.status == "Resolved", 1),
                        else_=0
                    )
                ).label("resolved")
            )
            .group_by(
                extract("year", Feedback.created_at),
                extract("month", Feedback.created_at)
            )
            # Sort by latest months first
            .order_by(
                extract("year", Feedback.created_at).desc(),
                extract("month", Feedback.created_at).desc()
            )
            .all()
        )

        report = []

        for row in month_rows:
            year = int(row.year)
            month = int(row.month)

            total = int(row.total or 0)
            resolved = int(row.resolved or 0)

            # Count negative sentiment feedback for this month
            negative_count = (
                db.query(FeedbackAIAnalysis)
                .join(Feedback, Feedback.id == FeedbackAIAnalysis.feedback_id)
                .filter(extract("year", Feedback.created_at) == year)
                .filter(extract("month", Feedback.created_at) == month)
                .filter(FeedbackAIAnalysis.sentiment == "Negative")
                .count()
            )

            # Calculate percentage of negative feedback
            negative_percentage = 0

            if total > 0:
                negative_percentage = round((negative_count / total) * 100, 2)

            # Find the most common theme/category for this month
            top_theme_row = (
                db.query(
                    FeedbackAIAnalysis.theme,
                    func.count(FeedbackAIAnalysis.id).label("theme_count")
                )
                .join(Feedback, Feedback.id == FeedbackAIAnalysis.feedback_id)
                .filter(extract("year", Feedback.created_at) == year)
                .filter(extract("month", Feedback.created_at) == month)
                .group_by(FeedbackAIAnalysis.theme)
                .order_by(func.count(FeedbackAIAnalysis.id).desc())
                .first()
            )

            top_theme = top_theme_row.theme if top_theme_row else "N/A"

            # Add monthly metrics to report
            report.append(
                {
                    "month": f"{year}-{month:02d}",
                    "total": total,
                    "negative_percentage": negative_percentage,
                    "top_theme": top_theme,
                    "resolved": resolved
                }
            )

        return report