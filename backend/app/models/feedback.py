from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    # Primary key and customer feedback details
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(150), nullable=False)
    channel = Column(String(100), nullable=False)
    rating = Column(Integer, nullable=True)
    feedback_date = Column(Date, nullable=True)
    feedback_text = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="New")
    assigned_team = Column(String(100), nullable=True)
    is_deleted = Column(Boolean, nullable=False, default=False)

    # Timestamps for audit trail
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    # One-to-one relationship with AI analysis results
    ai_analysis = relationship(
        "FeedbackAIAnalysis",
        back_populates="feedback",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # One-to-many relationship with status change history
    status_logs = relationship(
        "FeedbackStatusLog",
        back_populates="feedback",
        cascade="all, delete-orphan",
    )


class FeedbackAIAnalysis(Base):
    __tablename__ = "feedback_ai_analysis"

    # Primary key and foreign key to feedback
    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedback.id", ondelete="CASCADE"), nullable=False, unique=True)

    # AI-generated analysis results (sentiment, theme, urgency, summary, recommendations)
    sentiment = Column(String(50), nullable=False)
    theme = Column(String(100), nullable=False)
    urgency_score = Column(Integer, nullable=False, default=1)
    summary = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    confidence_score = Column(Float, nullable=False, default=0.0)

    # Timestamps for tracking analysis creation and updates
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    feedback = relationship("Feedback", back_populates="ai_analysis")


class FeedbackImportBatch(Base):
    __tablename__ = "feedback_import_batches"

    # Track CSV import history with success/failure counts
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=True)
    total_records = Column(Integer, nullable=False, default=0)
    success_count = Column(Integer, nullable=False, default=0)
    failed_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)


class FeedbackStatusLog(Base):
    __tablename__ = "feedback_status_logs"

    # Audit trail for feedback status transitions
    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedback.id", ondelete="CASCADE"), nullable=False)
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

    feedback = relationship("Feedback", back_populates="status_logs")