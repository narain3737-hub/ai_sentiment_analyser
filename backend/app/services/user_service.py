from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import ensure_admin, hash_password
from app.models.user import Role, User
from app.schemas.user_schema import UserCreateRequest, UserUpdateRequest
from app.utils.file_logger import get_backend_logger


logger = get_backend_logger("service.users")


class UserService:
    # List all active users with optional search and role filtering
    @staticmethod
    def list_users(
        db: Session,
        current_user,
        search: str | None = None,
        role: str | None = None,
        limit: int | None = None,
    ):
        ensure_admin(current_user)
        logger.info(
            "Service list_users started by user_id=%s search=%s role=%s limit=%s",
            current_user.id,
            search,
            role,
            limit,
        )

        # Query active users joined with their role information
        query = (
            db.query(User)
            .join(Role, User.role_id == Role.id)
            .filter(User.is_active == True)
        )

        if search:
            search_value = f"%{search.strip()}%"
            query = query.filter(
                User.name.ilike(search_value) | User.email.ilike(search_value)
            )

        if role:
            query = query.filter(Role.name == role)

        query = query.order_by(User.id.desc())

        total = query.count()

        if limit:
            query = query.limit(limit)

        users = query.all()

        logger.info(
            "Service list_users completed by user_id=%s total=%s",
            current_user.id,
            total,
        )

        return {
            "items": [UserService._serialize_user(user) for user in users],
            "total": total,
        }

    # Create new user or reactivate existing inactive user
    @staticmethod
    def create_user(
        db: Session,
        payload: UserCreateRequest,
        current_user,
    ):
        ensure_admin(current_user)
        logger.info(
            "Service create_user started by user_id=%s email=%s role=%s",
            current_user.id,
            payload.email,
            payload.role,
        )

        email = payload.email.strip().lower()

        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user and existing_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        role = db.query(Role).filter(Role.name == payload.role).first()

        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role selected",
            )

        # Reactivate inactive user instead of creating duplicate
        if existing_user and not existing_user.is_active:
            existing_user.name = payload.name.strip()
            existing_user.email = email
            existing_user.password_hash = hash_password(payload.password)
            existing_user.role_id = role.id
            existing_user.is_active = True

            db.commit()
            db.refresh(existing_user)

            logger.info(
                "Service create_user reactivated user_id=%s email=%s",
                existing_user.id,
                existing_user.email,
            )

            return UserService._serialize_user(existing_user)

        user = User(
            name=payload.name.strip(),
            email=email,
            password_hash=hash_password(payload.password),
            role_id=role.id,
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        logger.info(
            "Service create_user completed by user_id=%s new_user_id=%s email=%s",
            current_user.id,
            user.id,
            user.email,
        )

        return UserService._serialize_user(user)

    # Update user details, email, password and role
    @staticmethod
    def update_user(
        db: Session,
        user_id: int,
        payload: UserUpdateRequest,
        current_user,
    ):
        ensure_admin(current_user)
        logger.info(
            "Service update_user started by user_id=%s target_user_id=%s",
            current_user.id,
            user_id,
        )

        user = (
            db.query(User)
            .filter(User.id == user_id, User.is_active == True)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        email = payload.email.strip().lower()

        # Check if email is already used by another active user
        existing_email_user = (
            db.query(User)
            .filter(
                User.email == email,
                User.id != user_id,
                User.is_active == True,
            )
            .first()
        )

        if existing_email_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another active user with this email already exists",
            )

        role = db.query(Role).filter(Role.name == payload.role).first()

        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role selected",
            )

        user.name = payload.name.strip()
        user.email = email
        user.role_id = role.id

        # Update password only if new password is provided
        if payload.password and payload.password.strip():
            user.password_hash = hash_password(payload.password.strip())

        db.commit()
        db.refresh(user)

        logger.info(
            "Service update_user completed by user_id=%s target_user_id=%s",
            current_user.id,
            user_id,
        )

        return UserService._serialize_user(user)

    # Soft delete user by marking is_active as False
    @staticmethod
    def delete_user(
        db: Session,
        user_id: int,
        current_user,
    ):
        ensure_admin(current_user)
        logger.info(
            "Service delete_user started by user_id=%s target_user_id=%s",
            current_user.id,
            user_id,
        )

        # Prevent user from deleting their own account
        if current_user.id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot delete your own account",
            )

        user = (
            db.query(User)
            .filter(User.id == user_id, User.is_active == True)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        user.is_active = False

        db.commit()
        db.refresh(user)

        logger.info(
            "Service delete_user completed by user_id=%s target_user_id=%s",
            current_user.id,
            user_id,
        )

        return {
            "deleted": True,
            "user_id": user_id,
        }

        # Convert User model to dictionary for API response
    @staticmethod
    def _serialize_user(user: User):
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.name if user.role else None,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
        }
