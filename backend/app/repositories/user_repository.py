from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.user import Role, User


class UserRepository:
    @staticmethod
    # Retrieve role record by name
    def get_role_by_name(db: Session, role_name: str):
        return (
            db.query(Role)
            .filter(Role.name == role_name.strip())
            .first()
        )

    @staticmethod
    # Retrieve user by ID with role relationship eagerly loaded
    def get_user_by_id(db: Session, user_id: int):
        return (
            db.query(User)
            .options(joinedload(User.role))
            .filter(User.id == user_id)
            .first()
        )

    @staticmethod
    # Retrieve user by email with role data preloaded
    def get_user_by_email(db: Session, email: str):
        return (
            db.query(User)
            .options(joinedload(User.role))
            .filter(User.email == email.lower().strip())
            .first()
        )

    @staticmethod
    # Query users with optional search on name/email and role filtering
    def list_users(
        db: Session,
        search: str | None = None,
        role: str | None = None,
        limit: int | None = None,
    ):
        query = db.query(User).join(Role).options(joinedload(User.role))

        # Apply name and email search filter
        if search:
            search_value = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    User.name.ilike(search_value),
                    User.email.ilike(search_value),
                )
            )

        if role:
            query = query.filter(Role.name == role.strip())

        # Order by creation date and apply limit if specified
        query = query.order_by(User.created_at.desc())

        total = query.count()

        if limit:
            query = query.limit(limit)

        users = query.all()

        return users, total

    @staticmethod
    # Persist new user record to database
    def create_user(db: Session, user: User):
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    # Commit user record changes to database
    def update_user(db: Session, user: User):
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    # Delete user record from database
    def delete_user(db: Session, user: User):
        db.delete(user)
        db.commit()
        return True