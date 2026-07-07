from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_current_user, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.auth_schema import LoginRequest
from app.utils.response import success_response

# Authentication endpoints for user login, session, and logout
router = APIRouter(prefix="/auth", tags=["Authentication"])


# Convert SQLAlchemy user model to dictionary response
def serialize_user(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.name if user.role else None,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


# Endpoint to authenticate user with email and password, set auth cookie
@router.post("/login")
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = UserRepository.get_user_by_email(db, payload.email)

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )

    return success_response(
        message="Login successful",
        data={
            "user": serialize_user(user),
        },
    )


# Endpoint to get current logged-in user details
@router.get("/me")
def get_logged_in_user(current_user=Depends(get_current_user)):
    return success_response(
        message="Current user fetched successfully",
        data=serialize_user(current_user),
    )


# Endpoint to logout user by clearing authentication cookie
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
    )

    return success_response(
        message="Logout successful",
        data=True,
    )