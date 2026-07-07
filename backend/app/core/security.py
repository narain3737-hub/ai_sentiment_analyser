from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

# PBKDF2 password hashing context
password_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Hash plain text password with PBKDF2-SHA256
def hash_password(password: str) -> str:
    if not password:
        raise ValueError("Password cannot be empty")

    return password_context.hash(password)

# Verify plain password against stored hash
def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False

    return password_context.verify(plain_password, hashed_password)

# Generate JWT access token with expiration
def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    payload = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )

    payload.update({"exp": expire})

    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.algorithm,
    )

# Decode and validate JWT token
def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication session",
        )

# Extract and validate current user from auth token cookie
def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
):
    from app.models.user import User

    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    payload = decode_access_token(token)

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication session",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    return user

# Verify current user has admin role
def ensure_admin(current_user):
    role_name = current_user.role.name if current_user.role else None

    if role_name != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

# Verify current user has one of the allowed roles
def ensure_roles(current_user, allowed_roles: list[str]):
    role_name = current_user.role.name if current_user.role else None

    if role_name not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action",
        )