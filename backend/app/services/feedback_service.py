import csv
import io
from datetime import date, datetime

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.feedback import Feedback, FeedbackAIAnalysis, FeedbackImportBatch
from app.schemas.feedback_schema import FeedbackCreateRequest
from app.utils.file_logger import get_backend_logger


logger = get_backend_logger("service.feedback")


class FeedbackService:
    # Parse feedback date from various formats and validate it
    @staticmethod
    def parse_feedback_date(value):
        if value is None or str(value).strip() == "":
            raise ValueError("feedback_date is required")

        cleaned_value = str(value).strip()

        supported_formats = [
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%Y-%m-%d",
            "%Y/%m/%d",
        ]

        parsed_date = None

        for date_format in supported_formats:
            try:
                parsed_date = datetime.strptime(cleaned_value, date_format).date()
                break
            except ValueError:
                continue

        if parsed_date is None:
            raise ValueError("feedback_date must be in DD-MM-YYYY format")

        if parsed_date > date.today():
            raise ValueError("feedback_date cannot be greater than current date")

        return parsed_date

    # Clean and normalize CSV row keys and values
    @staticmethod
    def normalize_csv_row(row: dict) -> dict:
        normalized_row = {}

        for key, value in row.items():
            if key is None:
                continue

            clean_key = (
                str(key)
                .replace("\ufeff", "")
                .strip()
                .lower()
                .replace(" ", "_")
            )

            clean_value = "" if value is None else str(value).strip()

            normalized_row[clean_key] = clean_value

        return normalized_row

    # Validate that CSV has all required columns
    @staticmethod
    def validate_csv_columns(row: dict):
        required_columns = {
            "customer_name",
            "channel",
            "rating",
            "feedback_date",
            "feedback_text",
        }

        missing_columns = required_columns - set(row.keys())

        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing CSV columns: {', '.join(sorted(missing_columns))}",
            )

    # Parse and validate rating is between 1-5
    @staticmethod
    def parse_rating(value):
        if value is None or str(value).strip() == "":
            return None

        try:
            rating = int(str(value).strip())
        except ValueError:
            raise ValueError("rating must be a number")

        if rating < 1 or rating > 5:
            raise ValueError("rating must be between 1 and 5")

        return rating

    # Create new feedback record and generate AI analysis
    @staticmethod
    def create_feedback(
        db: Session,
        payload: FeedbackCreateRequest,
        current_user,
    ):
        try:
            logger.info(
                "Service create_feedback started by user_id=%s customer_name=%s",
                getattr(current_user, "id", None),
                payload.customer_name,
            )
            feedback_date = FeedbackService.parse_feedback_date(payload.feedback_date)
        except ValueError as error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(error),
            )

        feedback = Feedback(
            customer_name=payload.customer_name.strip(),
            channel=payload.channel.strip(),
            rating=payload.rating,
            feedback_date=feedback_date,
            feedback_text=payload.feedback_text.strip(),
            status="New",
            assigned_team=None,
            is_deleted=False,
        )

        db.add(feedback)
        db.flush()

        # Generate basic AI analysis for the feedback
        FeedbackService.create_basic_ai_analysis(db, feedback)

        db.commit()
        db.refresh(feedback)

        logger.info(
            "Service create_feedback completed by user_id=%s feedback_id=%s",
            getattr(current_user, "id", None),
            feedback.id,
        )

        return FeedbackService.serialize_feedback(feedback)

    # Parse CSV text from pasted content
    @staticmethod
    def import_feedback_from_csv_text(
        db: Session,
        csv_text: str,
        current_user,
    ):
        if not csv_text or not csv_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV text cannot be empty.",
            )

        reader = csv.DictReader(io.StringIO(csv_text.strip()))

        logger.info(
            "Service import_feedback_from_csv_text started by user_id=%s",
            getattr(current_user, "id", None),
        )

        return FeedbackService.process_csv_rows(
            db=db,
            rows=list(reader),
            source="Pasted CSV",
            current_user=current_user,
        )

    # Parse CSV file upload and import feedback
    @staticmethod
    async def import_feedback_from_csv_file(
        db: Session,
        file: UploadFile,
        current_user,
    ):
        if not file.filename.lower().endswith(".csv"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only CSV files are allowed.",
            )

        # Decode file content with UTF-8 encoding
        file_content = await file.read()

        try:
            decoded_content = file_content.decode("utf-8-sig")
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to read CSV file. Please upload a UTF-8 CSV file.",
            )

        reader = csv.DictReader(io.StringIO(decoded_content))

        logger.info(
            "Service import_feedback_from_csv_file started by user_id=%s filename=%s",
            getattr(current_user, "id", None),
            file.filename,
        )

        return FeedbackService.process_csv_rows(
            db=db,
            rows=list(reader),
            source=file.filename,
            current_user=current_user,
        )

    # Process CSV rows and create feedback records with error handling
    @staticmethod
    def process_csv_rows(
        db: Session,
        rows: list[dict],
        source: str,
        current_user,
    ):
        if not rows:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV file does not contain any feedback rows.",
            )

        normalized_rows = [
            FeedbackService.normalize_csv_row(row)
            for row in rows
        ]

        # Validate first row has all required columns
        FeedbackService.validate_csv_columns(normalized_rows[0])

        # Create import batch record to track this import
        import_batch = FeedbackImportBatch(
            file_name=source,
            total_records=len(normalized_rows),
            success_count=0,
            failed_count=0,
        )

        if hasattr(FeedbackImportBatch, "imported_by"):
            import_batch.imported_by = current_user.id if current_user else None

        db.add(import_batch)
        db.flush()

        logger.info(
            "Service process_csv_rows started by user_id=%s source=%s total_rows=%s",
            getattr(current_user, "id", None),
            source,
            len(normalized_rows),
        )

        success_count = 0
        failed_count = 0
        failed_rows = []

        for index, row in enumerate(normalized_rows, start=2):
            try:
                # Extract and validate CSV row data
                customer_name = row.get("customer_name", "")
                channel = row.get("channel", "")
                rating_value = row.get("rating", "")
                feedback_date_value = row.get("feedback_date", "")
                feedback_text = row.get("feedback_text", "")

                if not customer_name:
                    raise ValueError("customer_name is required")

                if not channel:
                    raise ValueError("channel is required")

                if not feedback_date_value:
                    raise ValueError("feedback_date is required")

                if not feedback_text:
                    raise ValueError("feedback_text is required")

                rating = FeedbackService.parse_rating(rating_value)

                parsed_feedback_date = FeedbackService.parse_feedback_date(
                    feedback_date_value
                )

                # Create feedback record and store in database
                feedback = Feedback(
                    customer_name=customer_name,
                    channel=channel,
                    rating=rating,
                    feedback_date=parsed_feedback_date,
                    feedback_text=feedback_text,
                    status="New",
                    assigned_team=None,
                    is_deleted=False,
                    import_batch_id=import_batch.id,
                )

                db.add(feedback)
                db.flush()

                FeedbackService.create_basic_ai_analysis(db, feedback)

                success_count += 1

            except Exception as error:
                failed_count += 1
                failed_rows.append(
                    {
                        "row": index,
                        "error": str(error),
                    }
                )

        import_batch.success_count = success_count
        import_batch.failed_count = failed_count

        db.commit()

        logger.info(
            "Service process_csv_rows completed by user_id=%s source=%s success=%s failed=%s",
            getattr(current_user, "id", None),
            source,
            success_count,
            failed_count,
        )

        return {
            "total_records": len(normalized_rows),
            "success_count": success_count,
            "failed_count": failed_count,
            "failed_rows": failed_rows,
        }

    # Generate basic AI analysis using keyword matching
    @staticmethod
    def create_basic_ai_analysis(db: Session, feedback: Feedback):
        text = feedback.feedback_text.lower()
        logger.info("Service create_basic_ai_analysis started for feedback_id=%s", feedback.id)

        # Determine sentiment by checking for positive/negative keywords
        positive_words = [
            "good",
            "great",
            "excellent",
            "clean",
            "easy",
            "fast",
            "love",
            "smooth",
            "simple",
            "modern",
            "helpful",
            "complete",
            "useful",
            "satisfied",
            "happy",
        ]

        negative_words = [
            "bad",
            "slow",
            "crash",
            "issue",
            "delay",
            "problem",
            "poor",
            "bug",
            "error",
            "broken",
            "difficult",
            "confusing",
            "failed",
            "not working",
            "not resolved",
        ]

        if any(word in text for word in positive_words):
            sentiment = "Positive"
        elif any(word in text for word in negative_words):
            sentiment = "Negative"
        else:
            sentiment = "Neutral"

        # Detect theme/category based on keywords in feedback
        if any(
            word in text
            for word in ["ui", "design", "screen", "layout", "dashboard", "interface"]
        ):
            theme = "UI"
        elif any(
            word in text
            for word in ["slow", "speed", "load", "performance", "lag"]
        ):
            theme = "Performance"
        elif any(
            word in text
            for word in ["bug", "crash", "error", "broken", "not working"]
        ):
            theme = "Bug"
        elif any(
            word in text
            for word in ["price", "pricing", "cost", "expensive", "plan"]
        ):
            theme = "Pricing"
        elif any(
            word in text
            for word in ["support", "response", "help", "ticket", "agent"]
        ):
            theme = "Support"
        elif any(
            word in text
            for word in [
                "feature",
                "export",
                "option",
                "request",
                "need",
                "monthly",
                "analysis",
                "report",
            ]
        ):
            theme = "Feature Request"
        else:
            theme = "Other"

        # Set urgency score based on sentiment
        if sentiment == "Negative":
            urgency_score = 4
        elif sentiment == "Neutral":
            urgency_score = 2
        else:
            urgency_score = 1

        # Create and save AI analysis record
        analysis = FeedbackAIAnalysis(
            feedback_id=feedback.id,
            sentiment=sentiment,
            theme=theme,
            urgency_score=urgency_score,
            summary=feedback.feedback_text[:160],
            recommended_action="Review this feedback and assign it to the relevant team.",
            confidence_score=0.85,
        )

        db.add(analysis)
        db.flush()

        logger.info(
            "Service create_basic_ai_analysis completed for feedback_id=%s sentiment=%s theme=%s",
            feedback.id,
            sentiment,
            theme,
        )

    @staticmethod
    def serialize_feedback(feedback: Feedback):
        analysis = feedback.ai_analysis

        urgency_score = analysis.urgency_score if analysis else 1

        if urgency_score >= 4:
            urgency = "High"
        elif urgency_score >= 2:
            urgency = "Medium"
        else:
            urgency = "Low"

        return {
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
            "urgency": urgency,
            "urgency_score": urgency_score,
            "summary": analysis.summary if analysis else "",
            "recommended_action": analysis.recommended_action if analysis else "",
            "created_at": feedback.created_at,
            "updated_at": feedback.updated_at,
        }
