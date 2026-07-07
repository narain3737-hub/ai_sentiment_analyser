from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# Valid feedback status values
ALLOWED_STATUSES = ["New", "Planned", "Resolved", "Ignored"]

# Valid AI sentiment analysis results
ALLOWED_SENTIMENTS = ["Positive", "Neutral", "Negative"]

# Valid feedback categories detected by AI
ALLOWED_THEMES = [
    "UI",
    "Performance",
    "Bug",
    "Pricing",
    "Support",
    "Feature Request",
    "Other",
]

# Valid teams that can be assigned feedback
ALLOWED_ASSIGNMENT_TEAMS = [
    "UI Team",
    "Product Team",
    "Bug Developer",
    "Frontend Team",
    "Backend Team",
    "DevOps Team",
    "Finance Team",
    "Support Team",
]


# Parse and validate feedback date from multiple formats
def parse_feedback_date_value(value):
    if value is None or value == "":
        return None

    if isinstance(value, date):
        parsed_date = value
    elif isinstance(value, str):
        cleaned_value = value.strip()

        # Support multiple date formats
        supported_formats = [
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%Y-%m-%d",
            "%Y/%m/%d",
        ]

        parsed_date = None

        # Try each supported date format
        for date_format in supported_formats:
            try:
                parsed_date = datetime.strptime(cleaned_value, date_format).date()
                break
            except ValueError:
                continue

        if parsed_date is None:
            raise ValueError("Feedback date must be in DD-MM-YYYY format")
    else:
        raise ValueError("Feedback date must be in DD-MM-YYYY format")

    # Prevent future dates
    if parsed_date > date.today():
        raise ValueError("Feedback date cannot be greater than current date")

    return parsed_date


# Schema for creating feedback with validation
class FeedbackCreateRequest(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=150)
    channel: str = Field(..., min_length=2, max_length=100)
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    feedback_date: date
    feedback_text: str = Field(..., min_length=3)

    @field_validator("feedback_date", mode="before")
    @classmethod
    def validate_feedback_date(cls, value):
        # Parse and validate date from multiple formats
        parsed_date = parse_feedback_date_value(value)

        if parsed_date is None:
            raise ValueError("Feedback date is required")

        return parsed_date


# Schema for updating feedback status
class FeedbackStatusUpdateRequest(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        # Ensure status is valid
        if value not in ALLOWED_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(ALLOWED_STATUSES)}")

        return value


# Schema for assigning feedback to team
class FeedbackAssignRequest(BaseModel):
    assigned_team: Optional[str] = None

    @field_validator("assigned_team")
    @classmethod
    def validate_assigned_team(cls, value):
        # Allow empty assignment
        if value is None or value == "":
            return None

        if value not in ALLOWED_ASSIGNMENT_TEAMS:
            raise ValueError(
                f"Assigned team must be one of: {', '.join(ALLOWED_ASSIGNMENT_TEAMS)}"
            )

        return value


# Schema for requesting AI analysis of feedback
class AnalyzeFeedbackRequest(BaseModel):
    feedback_id: int


# Schema for AI analysis response with sentiment and theme
class FeedbackAIAnalysisResponse(BaseModel):
    id: int
    feedback_id: int
    sentiment: str
    theme: str
    urgency_score: int
    summary: str
    recommended_action: str
    confidence_score: float
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {
        "from_attributes": True,
    }


# Schema for returning feedback details with AI analysis
class FeedbackResponse(BaseModel):
    id: int
    customer_name: str
    channel: str
    rating: Optional[int] = None
    feedback_date: date | None = None
    feedback_text: str
    status: str
    assigned_team: Optional[str] = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    ai_analysis: FeedbackAIAnalysisResponse | None = None

    model_config = {
        # Allow conversion from SQLAlchemy model instances
        "from_attributes": True,
    }


# Schema for paginated feedback list response
class FeedbackListResponse(BaseModel):
    items: list[FeedbackResponse]
    total: int
    page: int
    limit: int


# Schema for CSV import result with success and error counts
class CsvImportResponse(BaseModel):
    success_count: int
    failed_count: int
    errors: list[str]