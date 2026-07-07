from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from app.models.feedback import Feedback, FeedbackAIAnalysis
from app.schemas.feedback_schema import ALLOWED_SENTIMENTS, ALLOWED_THEMES
from app.services.gemini_ai_service import GeminiAIService


class AIService:
    # Initialize VADER sentiment analyzer
    analyzer = SentimentIntensityAnalyzer()

    POSITIVE_PHRASES = [
        "feels complete", "looks complete", "product feels complete",
        "works well", "working well", "easy to use", "very useful",
        "helpful", "clean and simple", "simple and clear", "good experience",
        "great experience", "smooth experience", "looks good", "looks modern",
        "well designed", "saves time", "better than before", "improved",
        "happy with", "satisfied with", "like the", "love the",
        "perfect for", "complete for", "good for",
    ]

    NEGATIVE_PHRASES = [
        "not working", "does not work", "did not work", "not useful",
        "not good", "not clear", "not easy", "not able", "unable to",
        "keeps crashing", "keeps failing", "very slow", "too slow",
        "takes too long", "still not resolved", "issue is still not resolved",
        "bad experience", "poor experience", "hard to use",
        "difficult to use", "waste of time",
    ]

    NEUTRAL_PHRASES = [
        "need option", "need an option", "would like", "can you add",
        "please add", "suggestion", "request", "it would be better",
        "could be improved",
    ]

    THEME_PATTERNS = {
        "Bug": [
            "bug", "error", "issue", "not working", "broken", "failed",
            "failure", "problem", "glitch", "crash", "crashing", "freeze",
            "stuck", "unable to", "does not work", "did not work",
        ],
        "Performance": [
            "slow", "speed", "loading", "lag", "performance", "delay",
            "hang", "timeout", "takes time", "too long", "fast", "smooth",
        ],
        "UI": [
            "ui", "screen", "design", "layout", "button", "color",
            "navigation", "interface", "page", "dashboard", "menu",
            "sidebar", "clean", "modern", "simple", "easy to use",
        ],
        "Pricing": [
            "price", "pricing", "cost", "expensive", "cheap",
            "subscription", "plan", "billing", "payment", "refund",
        ],
        "Support": [
            "support", "help", "customer service", "agent", "team",
            "response", "resolved", "ticket", "call", "reply", "follow up",
        ],
        "Feature Request": [
            "feature", "add", "need", "request", "suggestion", "improve",
            "option", "would like", "export", "import", "filter", "report",
            "monthly", "analysis", "analytics", "feedback analysis",
            "monthly feedback analysis",
        ],
    }

    CRITICAL_PHRASES = [
        "urgent", "immediately", "critical", "blocked", "unable to use",
        "cannot use", "not working", "keeps crashing", "payment failed",
        "refund", "cancel", "worst", "not resolved", "serious",
    ]

    MEDIUM_PHRASES = [
        "slow", "delay", "confusing", "difficult", "issue", "problem",
        "takes too long",
    ]

    # Normalize text by converting to lowercase and removing extra spaces
    @staticmethod
    def normalize(text: str) -> str:
        return " ".join((text or "").lower().strip().split())

    # Count number of matching phrases in text
    @staticmethod
    def score(text: str, phrases: list[str]) -> int:
        return sum(phrase in text for phrase in phrases)

    # Detect sentiment using VADER analyzer and phrase matching with rating consideration
    @staticmethod
    def detect_sentiment(feedback_text: str, rating: int | None = None) -> tuple[str, float]:
        text = AIService.normalize(feedback_text)

        if not text:
            return "Neutral", 0.3

        # Use VADER for compound sentiment score
        compound = AIService.analyzer.polarity_scores(text)["compound"]

        # Score each sentiment based on phrase matches
        scores = {
            "Positive": AIService.score(text, AIService.POSITIVE_PHRASES) * 3,
            "Negative": AIService.score(text, AIService.NEGATIVE_PHRASES) * 3,
            "Neutral": AIService.score(text, AIService.NEUTRAL_PHRASES),
        }

        # Boost scores based on VADER compound score
        # Boost scores based on VADER compound score
        if compound >= 0.25:
            scores["Positive"] += 3
        elif compound >= 0.05:
            scores["Positive"] += 1

        if compound <= -0.25:
            scores["Negative"] += 3
        elif compound <= -0.05:
            scores["Negative"] += 1

        # Factor in customer rating
        if rating is not None:
            if rating >= 4:
                scores["Positive"] += 2
            elif rating <= 2:
                scores["Negative"] += 2
            else:
                scores["Neutral"] += 1

        # Get sentiment with highest score
        # Get sentiment with highest score
        sentiment = max(scores, key=scores.get)

        if scores[sentiment] > 0:
            confidence = min(max(abs(compound) + 0.55, 0.72), 0.98)
            return sentiment, round(confidence, 2)

        if rating is not None:
            if rating >= 4:
                return "Positive", 0.72
            if rating <= 2:
                return "Negative", 0.72

        if compound >= 0.05:
            return "Positive", round(min(abs(compound) + 0.35, 0.9), 2)

        if compound <= -0.05:
            return "Negative", round(min(abs(compound) + 0.35, 0.9), 2)

        return "Neutral", 0.55

    # Detect feedback theme/category using keyword matching
    @staticmethod
    def detect_theme(feedback_text: str) -> str:
        text = AIService.normalize(feedback_text)

        if not text:
            return "Other"

        scores = {
            theme: AIService.score(text, patterns)
            for theme, patterns in AIService.THEME_PATTERNS.items()
        }

        theme = max(scores, key=scores.get)
        return theme if scores[theme] > 0 else "Other"

    # Calculate urgency score (1-5) based on sentiment, theme, rating, and critical phrases
    @staticmethod
    def calculate_urgency(sentiment: str, theme: str, rating: int | None, feedback_text: str) -> int:
        text = AIService.normalize(feedback_text)
        urgency = 1

        # Boost urgency for negative sentiment and critical themes
        if sentiment == "Negative":
            urgency += 2
        elif sentiment == "Neutral":
            urgency += 1

        if theme in {"Bug", "Performance", "Support"}:
            urgency += 1

        if rating is not None:
            if rating <= 2:
                urgency += 1
            elif rating >= 4 and sentiment == "Positive":
                urgency -= 1

        # Check for critical phrases that increase urgency
        if AIService.score(text, AIService.CRITICAL_PHRASES):
            urgency += 2
        elif AIService.score(text, AIService.MEDIUM_PHRASES):
            urgency += 1

        return min(max(urgency, 1), 5)

    # Generate concise summary based on sentiment and theme
    @staticmethod
    def generate_summary(sentiment: str, theme: str, feedback_text: str) -> str:
        short_text = feedback_text.strip()

        if len(short_text) > 140:
            short_text = f"{short_text[:140].strip()}..."

        # Use template based on sentiment to generate summary
        templates = {
            "Positive": (
                "The customer shared positive feedback related to {theme}. "
                "They appear satisfied with the current experience. Feedback: {text}"
            ),
            "Negative": (
                "The customer reported a negative experience related to {theme}. "
                "This feedback should be reviewed for possible action. Feedback: {text}"
            ),
            "Neutral": (
                "The customer shared neutral feedback related to {theme}. "
                "This feedback may need review if similar comments continue. Feedback: {text}"
            ),
        }

        return templates.get(sentiment, templates["Neutral"]).format(
            theme=theme,
            text=short_text,
        )

    # Generate recommended action based on sentiment, theme, and urgency
    @staticmethod
    def recommend_action(sentiment: str, theme: str, urgency_score: int) -> str:
        if sentiment == "Positive":
            return (
                "Acknowledge the positive feedback, mark it as reviewed, "
                "and use it as a customer insight for future improvements."
            )

        if urgency_score >= 4:
            return "Prioritize this feedback and assign it to the responsible team immediately."

        # Return theme-specific action recommendation
        theme_actions = {
            "Bug": "Create a bug ticket and ask the technical team to investigate.",
            "Performance": (
                "Review system performance, loading time, and possible backend "
                "or frontend bottlenecks."
            ),
            "UI": "Review the user interface and improve the affected screen or user flow.",
            "Pricing": "Forward this feedback to the pricing or product strategy team.",
            "Support": "Ask the support team to follow up with the customer.",
            "Feature Request": "Add this request to the product backlog for review.",
        }

        if theme in theme_actions:
            return theme_actions[theme]

        if sentiment == "Neutral":
            return "Review the feedback and monitor whether similar comments appear again."

        return "Review the feedback manually and decide the next action."

    # Build analysis using VADER fallback when Gemini API fails
    @staticmethod
    def build_fallback_analysis(feedback: Feedback) -> dict:
        sentiment, confidence_score = AIService.detect_sentiment(
            feedback_text=feedback.feedback_text,
            rating=feedback.rating,
        )

        theme = AIService.detect_theme(feedback.feedback_text)

        if sentiment not in ALLOWED_SENTIMENTS:
            sentiment = "Neutral"

        if theme not in ALLOWED_THEMES:
            theme = "Other"

        urgency_score = AIService.calculate_urgency(
            sentiment=sentiment,
            theme=theme,
            rating=feedback.rating,
            feedback_text=feedback.feedback_text,
        )

        return {
            "sentiment": sentiment,
            "theme": theme,
            "urgency_score": urgency_score,
            "summary": AIService.generate_summary(
                sentiment=sentiment,
                theme=theme,
                feedback_text=feedback.feedback_text,
            ),
            "recommended_action": AIService.recommend_action(
                sentiment=sentiment,
                theme=theme,
                urgency_score=urgency_score,
            ),
            "confidence_score": confidence_score,
        }

    # Build analysis using Gemini API with VADER fallback on error
    @staticmethod
    def build_analysis(feedback: Feedback) -> dict:
        try:
            # Try Gemini AI analysis first
            analysis = GeminiAIService().analyze_feedback(
                feedback_text=feedback.feedback_text,
                rating=feedback.rating,
                channel=feedback.channel,
            )

            sentiment = analysis.get("sentiment", "Neutral")
            theme = analysis.get("theme", "Other")

            if sentiment not in ALLOWED_SENTIMENTS:
                analysis["sentiment"] = "Neutral"

            if theme not in ALLOWED_THEMES:
                analysis["theme"] = "Other"

            analysis["urgency_score"] = max(1, min(5, int(analysis.get("urgency_score", 3))))
            analysis["confidence_score"] = max(0, min(1, float(analysis.get("confidence_score", 0.75))))

            return analysis

        except Exception as error:
            # Fall back to VADER if Gemini fails
            print("Gemini failed, using VADER fallback:", error)
            return AIService.build_fallback_analysis(feedback)

    # Main entry point: analyze feedback and save AI analysis
    @staticmethod
    def analyze_feedback(db: Session, feedback_id: int):
        feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()

        if not feedback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feedback not found",
            )

        # Get or create AI analysis record
        analysis_data = AIService.build_analysis(feedback)

        ai_analysis = (
            db.query(FeedbackAIAnalysis)
            .filter(FeedbackAIAnalysis.feedback_id == feedback.id)
            .first()
        )

        # Update existing analysis or create new one
        if ai_analysis:
            for key, value in analysis_data.items():
                setattr(ai_analysis, key, value)
        else:
            ai_analysis = FeedbackAIAnalysis(
                feedback_id=feedback.id,
                **analysis_data,
            )
            db.add(ai_analysis)

        db.commit()
        db.refresh(ai_analysis)

        return ai_analysis