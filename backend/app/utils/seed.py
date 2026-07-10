from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import Role, User


DEFAULT_ROLES = ["Admin", "Product Analyst", "Support Lead"]

LEGACY_ROLE_MAP = {
    "Analyst": "Product Analyst",
    "Product Lead": "Product Analyst",
}


def seed_roles_and_admin(db: Session):
    create_default_roles(db)
    migrate_legacy_user_roles(db)
    fix_users_without_role(db)
    seed_default_users(db)


def create_default_roles(db: Session):
    for role_name in DEFAULT_ROLES:
        existing_role = db.query(Role).filter(Role.name == role_name).first()

        if not existing_role:
            db.add(Role(name=role_name))

    db.commit()


def migrate_legacy_user_roles(db: Session):
    for old_role_name, new_role_name in LEGACY_ROLE_MAP.items():
        old_role = db.query(Role).filter(Role.name == old_role_name).first()
        new_role = db.query(Role).filter(Role.name == new_role_name).first()

        if not old_role or not new_role:
            continue

        users = db.query(User).filter(User.role_id == old_role.id).all()

        for user in users:
            user.role_id = new_role.id

    db.commit()


def fix_users_without_role(db: Session):
    product_analyst_role = (
        db.query(Role)
        .filter(Role.name == "Product Analyst")
        .first()
    )

    if not product_analyst_role:
        return

    users_without_role = db.query(User).filter(User.role_id.is_(None)).all()

    for user in users_without_role:
        user.role_id = product_analyst_role.id

    db.commit()


def seed_default_users(db: Session):
    # Retrieve role records
    admin_role = db.query(Role).filter(Role.name == "Admin").first()
    analyst_role = db.query(Role).filter(Role.name == "Product Analyst").first()
    support_role = db.query(Role).filter(Role.name == "Support Lead").first()

    if not (admin_role and analyst_role and support_role):
        return

    # Keep only the three default users and remove any others
    allowed_emails = ["admin@example.com", "analyst@example.com", "support@example.com"]
    db.query(User).filter(User.email.not_in(allowed_emails)).delete(synchronize_session=False)
    db.commit()

    # Create/update Admin User
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        admin_user = User(
            name="Admin User",
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            role_id=admin_role.id,
            is_active=True,
        )
        db.add(admin_user)
    else:
        admin_user.role_id = admin_role.id
        admin_user.password_hash = hash_password("admin123")

    # Create/update Product Analyst User
    analyst_user = db.query(User).filter(User.email == "analyst@example.com").first()
    if not analyst_user:
        analyst_user = User(
            name="Product Analyst User",
            email="analyst@example.com",
            password_hash=hash_password("analyst123"),
            role_id=analyst_role.id,
            is_active=True,
        )
        db.add(analyst_user)
    else:
        analyst_user.role_id = analyst_role.id
        analyst_user.password_hash = hash_password("analyst123")

    # Create/update Support Lead User
    support_user = db.query(User).filter(User.email == "support@example.com").first()
    if not support_user:
        support_user = User(
            name="Support Lead User",
            email="support@example.com",
            password_hash=hash_password("support123"),
            role_id=support_role.id,
            is_active=True,
        )
        db.add(support_user)
    else:
        support_user.role_id = support_role.id
        support_user.password_hash = hash_password("support123")

    db.commit()


if __name__ == "__main__":
    from app.core.database import SessionLocal
    print("Seeding database...")
    db = SessionLocal()
    try:
        seed_roles_and_admin(db)
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()