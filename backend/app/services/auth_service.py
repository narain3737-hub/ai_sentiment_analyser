from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import verify_password, create_access_token


class AuthService:
    # Authenticate user with email and password, return JWT token
    @staticmethod
    def login(db: Session, email: str, password: str):
        # Query user by email from database
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # Return generic error message to prevent email enumeration
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify entered password against stored hashed password
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Check if user account is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

        # Generate JWT token with user claims
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "role": user.role.name if user.role else None
            }
        )

        # Return JWT token and user information
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role.name if user.role else None
            }
        }