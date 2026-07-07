from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.models.feedback import Feedback, FeedbackStatusLog


class FeedbackRepository:
    @staticmethod
    # Persist feedback record to database
    def create_feedback(db: Session, feedback: Feedback):
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback

    @staticmethod
    # Retrieve single feedback with AI analysis eagerly loaded
    def get_feedback_by_id(db: Session, feedback_id: int):
        return (
            db.query(Feedback)
            .options(joinedload(Feedback.ai_analysis))
            .filter(Feedback.id == feedback_id)
            .first()
        )

    @staticmethod
    # Query feedbacks with search, status, sentiment, theme filtering and pagination
    def list_feedbacks(
        db: Session,
        search: str | None = None,
        status: str | None = None,
        sentiment: str | None = None,
        theme: str | None = None,
        page: int = 1,
        limit: int = 10,
    ):
        query = db.query(Feedback).options(joinedload(Feedback.ai_analysis))

        # Apply search filter on customer name, channel, or feedback text
        if search:
            query = query.filter(
                or_(
                    Feedback.customer_name.ilike(f"%{search}%"),
                    Feedback.channel.ilike(f"%{search}%"),
                    Feedback.feedback_text.ilike(f"%{search}%"),
                )
            )

        if status:
            query = query.filter(Feedback.status == status)

        # Filter by AI-analyzed sentiment or theme if provided — join once for both
        if sentiment or theme:
            from app.models.feedback import FeedbackAIAnalysis

            query = query.join(Feedback.ai_analysis)

            if sentiment:
                query = query.filter(FeedbackAIAnalysis.sentiment == sentiment)

            if theme:
                query = query.filter(FeedbackAIAnalysis.theme == theme)

        total = query.count()

        # Apply ordering and pagination
        items = (
            query.order_by(Feedback.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        return items, total

    @staticmethod
    # Update feedback status and create audit log entry
    def update_status(
        db: Session,
        feedback: Feedback,
        new_status: str,
        changed_by: int | None,
    ):
        old_status = feedback.status

        # Change status and log the transition
        feedback.status = new_status

        status_log = FeedbackStatusLog(
            feedback_id=feedback.id,
            old_status=old_status,
            new_status=new_status,
            changed_by=changed_by,
        )

        db.add(status_log)
        db.commit()
        db.refresh(feedback)

        return feedback

    @staticmethod
    # Assign feedback to a user
    def assign_owner(db: Session, feedback: Feedback, assigned_to: int | None):
        feedback.assigned_to = assigned_to

        db.commit()
        db.refresh(feedback)

        return feedback

    @staticmethod
    # Retrieve single feedback by ID that is not deleted
    def get_feedback_by_id_active(db: Session, feedback_id: int):
        return (
            db.query(Feedback)
            .filter(Feedback.id == feedback_id, Feedback.is_deleted == False)
            .first()
        )

    @staticmethod
    # List feedbacks that are not deleted, with search and filters matching the router logic
    def list_feedbacks_active(
        db: Session,
        search: str | None = None,
        status: str | None = None,
        sentiment: str | None = None,
        theme: str | None = None,
        page: int = 1,
        limit: int = 100,
    ):
        query = db.query(Feedback).filter(Feedback.is_deleted == False)

        if search:
            search_value = f"%{search}%"
            query = query.filter(
                Feedback.customer_name.ilike(search_value)
                | Feedback.feedback_text.ilike(search_value)
                | Feedback.channel.ilike(search_value)
                | Feedback.assigned_team.ilike(search_value)
            )

        if status:
            query = query.filter(Feedback.status == status)

        if theme or sentiment:
            from app.models.feedback import FeedbackAIAnalysis

            query = query.join(Feedback.ai_analysis)

            if theme:
                query = query.filter(FeedbackAIAnalysis.theme == theme)

            if sentiment:
                query = query.filter(FeedbackAIAnalysis.sentiment == sentiment)

        total = query.count()

        items = (
            query.order_by(Feedback.feedback_date.desc(), Feedback.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        return items, total

    @staticmethod
    # Update feedback status
    def update_status_simple(db: Session, feedback: Feedback, new_status: str):
        feedback.status = new_status
        db.commit()
        db.refresh(feedback)
        return feedback

    @staticmethod
    # Assign feedback to a team
    def assign_team(db: Session, feedback: Feedback, assigned_team: str | None):
        feedback.assigned_team = assigned_team
        db.commit()
        db.refresh(feedback)
        return feedback

    @staticmethod
    # Soft delete a feedback record
    def soft_delete_feedback(db: Session, feedback: Feedback):
        feedback.is_deleted = True
        db.commit()
        return feedback

    @staticmethod
    # Retrieve active feedbacks for the dashboard analytics
    def get_dashboard_feedbacks(db: Session):
        from app.models.feedback import FeedbackAIAnalysis

        return (
            db.query(Feedback)
            .outerjoin(FeedbackAIAnalysis, Feedback.id == FeedbackAIAnalysis.feedback_id)
            .filter(Feedback.is_deleted == False)
            .order_by(Feedback.feedback_date.desc(), Feedback.created_at.desc())
            .all()
        )

    @staticmethod
    # Retrieve feedbacks for monthly reports
    def get_monthly_report_feedbacks(db: Session, month: int, year: int):
        from app.models.feedback import FeedbackAIAnalysis
        from sqlalchemy import extract

        return (
            db.query(Feedback)
            .outerjoin(FeedbackAIAnalysis, Feedback.id == FeedbackAIAnalysis.feedback_id)
            .filter(Feedback.is_deleted == False)
            .filter(Feedback.feedback_date.isnot(None))
            .filter(extract("month", Feedback.feedback_date) == month)
            .filter(extract("year", Feedback.feedback_date) == year)
            .order_by(Feedback.feedback_date.asc(), Feedback.id.asc())
            .all()
        )