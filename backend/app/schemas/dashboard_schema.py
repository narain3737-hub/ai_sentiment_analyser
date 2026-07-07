from pydantic import BaseModel


# Schema for sentiment count breakdown by theme
class ThemeBreakdownItem(BaseModel):
    theme: str
    positive: int
    neutral: int
    negative: int
    total: int


# Schema for dashboard sentiment analytics response with theme breakdown
class DashboardSentimentResponse(BaseModel):
    total_feedback: int
    positive: int
    neutral: int
    negative: int
    urgent: int
    theme_breakdown: list[ThemeBreakdownItem]


# Schema for monthly report item with sentiment and resolution metrics
class MonthlyReportItem(BaseModel):
    month: str
    total: int
    negative_percentage: float
    top_theme: str
    resolved: int