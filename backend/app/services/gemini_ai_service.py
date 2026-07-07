import json
import os
from typing import Any, Dict

from dotenv import load_dotenv
from google import genai

load_dotenv()

ALLOWED_SENTIMENTS = ["Positive", "Neutral", "Negative"]
ALLOWED_THEMES = [
    "UI",
    "Performance",
    "Bug",
    "Pricing",
    "Support",
    "Feature Request",
    "Other",
]


class GeminiAIService:
    # Initialize Gemini API client with API key and model configuration
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is missing in .env")

        # Create Gemini client with API key
        self.client = genai.Client(api_key=api_key)
        self.model = os.getenv("AI_MODEL", "gemini-1.5-flash")

    # Send feedback text to Gemini AI for sentiment, theme, and action analysis
    def analyze_feedback(
        self,
        feedback_text: str,
        rating: int | None = None,
        channel: str | None = None,
    ) -> Dict[str, Any]:
        # Create structured prompt for Gemini to analyze feedback
        prompt = f"""
Analyze this customer feedback.

Feedback text:
{feedback_text}

Rating:
{rating}

Channel:
{channel}

Return only valid JSON in this exact format:

{{
  "sentiment": "Positive | Neutral | Negative",
  "theme": "UI | Performance | Bug | Pricing | Support | Feature Request | Other",
  "urgency_score": 1,
  "summary": "short clear summary",
  "recommended_action": "clear action for the responsible team",
  "confidence_score": 0.85
}}

Rules:
- urgency_score must be between 1 and 5.
- confidence_score must be between 0 and 1.
- Do not add markdown.
- Do not add explanation.
"""

        # Call Gemini API with prompt
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
        )

        # Parse JSON response and remove markdown formatting if present
        raw_text = response.text.strip()
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        data = json.loads(raw_text)

        # Extract sentiment and theme, default to neutral/other if invalid
        sentiment = data.get("sentiment", "Neutral")
        theme = data.get("theme", "Other")

        if sentiment not in ALLOWED_SENTIMENTS:
            sentiment = "Neutral"

        if theme not in ALLOWED_THEMES:
            theme = "Other"

        # Normalize urgency score to valid range (1-5)
        urgency_score = int(data.get("urgency_score", 3))
        urgency_score = max(1, min(5, urgency_score))

        # Normalize confidence score to valid range (0-1)
        confidence_score = float(data.get("confidence_score", 0.75))
        confidence_score = max(0, min(1, confidence_score))

        # Return validated analysis results
        return {
            "sentiment": sentiment,
            "theme": theme,
            "urgency_score": urgency_score,
            "summary": data.get("summary", "Feedback analyzed successfully."),
            "recommended_action": data.get(
                "recommended_action",
                "Review the feedback and assign it to the relevant team.",
            ),
            "confidence_score": confidence_score,
        }