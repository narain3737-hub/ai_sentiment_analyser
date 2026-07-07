from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.user_schema import UserCreateRequest, UserUpdateRequest
from app.services.user_service import UserService
from app.utils.response import success_response

# User management endpoints for CRUD operations (admin only)
router = APIRouter(prefix="/users", tags=["Users"])


# Endpoint to list users with optional search and role filtering (admin only)
@router.get("")
def list_users(
    search: str | None = Query(default=None),
    role: str | None = Query(default=None),
    limit: int | None = Query(default=None, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = UserService.list_users(
        db=db,
        current_user=current_user,
        search=search,
        role=role,
        limit=limit,
    )

    return success_response(
        message="Users fetched successfully",
        data=result,
    )


# Endpoint to create new user with email uniqueness validation (admin only)
@router.post("")
def create_user(
    payload: UserCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = UserService.create_user(
        db=db,
        payload=payload,
        current_user=current_user,
    )

    return success_response(
        message="User created successfully",
        data=result,
    )


# Endpoint to update user details including name, email, role, and password (admin only)
@router.put("/{user_id}")
def update_user(
    user_id: int,
    payload: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = UserService.update_user(
        db=db,
        user_id=user_id,
        payload=payload,
        current_user=current_user,
    )

    return success_response(
        message="User updated successfully",
        data=result,
    )


# Endpoint to soft-delete user by setting is_active to False (admin only)
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = UserService.delete_user(
        db=db,
        user_id=user_id,
        current_user=current_user,
    )

    return success_response(
        message="User deleted successfully",
        data=result,
    )