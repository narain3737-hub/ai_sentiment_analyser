from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.user_schema import UserCreateRequest, UserUpdateRequest
from app.services.user_service import UserService
from app.utils.file_logger import get_backend_logger
from app.utils.response import success_response

# User management endpoints for CRUD operations (admin only)
router = APIRouter(prefix="/users", tags=["Users"])
logger = get_backend_logger("users")


# Endpoint to list users with optional search and role filtering (admin only)
@router.get("")
def list_users(
    search: str | None = Query(default=None),
    role: str | None = Query(default=None),
    limit: int | None = Query(default=None, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    logger.info(
        "List users requested by user_id=%s search=%s role=%s limit=%s",
        current_user.id,
        search,
        role,
        limit,
    )
    result = UserService.list_users(
        db=db,
        current_user=current_user,
        search=search,
        role=role,
        limit=limit,
    )

    logger.info(
        "List users completed by user_id=%s total=%s",
        current_user.id,
        result.get("total") if isinstance(result, dict) else None,
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
    logger.info("Create user requested by user_id=%s email=%s", current_user.id, payload.email)
    result = UserService.create_user(
        db=db,
        payload=payload,
        current_user=current_user,
    )

    logger.info("User created by user_id=%s new_email=%s", current_user.id, payload.email)

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
    logger.info("Update user requested by user_id=%s target_user_id=%s", current_user.id, user_id)
    result = UserService.update_user(
        db=db,
        user_id=user_id,
        payload=payload,
        current_user=current_user,
    )

    logger.info("User updated by user_id=%s target_user_id=%s", current_user.id, user_id)

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
    logger.info("Delete user requested by user_id=%s target_user_id=%s", current_user.id, user_id)
    # TODO: FOR dedug puposes, we just hard coded the value in if condition below, later we remove it
    if user_id > 3:
        raise RuntimeError("User Id greater than 3")

    result = UserService.delete_user(
        db=db,
        user_id=user_id,
        current_user=current_user,
    )

    logger.info("User deleted by user_id=%s target_user_id=%s", current_user.id, user_id)

    return success_response(
        message="User deleted successfully",
        data=result,
    )
