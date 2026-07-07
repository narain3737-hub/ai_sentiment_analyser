from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# Valid roles that can be assigned to users
ALLOWED_ROLES = ["Admin", "Product Analyst", "Support Lead"]


# Schema for creating a new user with validation
class UserCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    role: str
    is_active: bool = True

    @field_validator("role")
    @classmethod
    def validate_role(cls, value):
        # Ensure role is one of the allowed values
        if value not in ALLOWED_ROLES:
            raise ValueError(f"Role must be one of: {', '.join(ALLOWED_ROLES)}")
        return value


# Schema for updating an existing user with optional password field
class UserUpdateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: Optional[str] = Field(default=None, min_length=6, max_length=100)
    role: str
    is_active: bool = True

    @field_validator("role")
    @classmethod
    def validate_role(cls, value):
        # Ensure role is one of the allowed values
        if value not in ALLOWED_ROLES:
            raise ValueError(f"Role must be one of: {', '.join(ALLOWED_ROLES)}")
        return value


# Schema for returning user details in API responses
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {
        # Allow conversion from SQLAlchemy model instances
        "from_attributes": True
    }


# Schema for paginated user list response
class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int