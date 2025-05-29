from sqlalchemy.orm import Session
# Импортируем функцию для хеширования пароля
from backend.auth import get_password_hash

from backend.models.user import User

def create_user(db: Session, name: str, email: str, password: str, role: str):
    db_user = User(name=name, email=email, password=password, role=role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session):
    return db.query(User).all()


def update_user(db: Session, user_id: int, name: str = None, email: str = None, password: str = None, role: str = None):
    user_obj = db.query(User).filter(User.id == user_id).first()
    if user_obj:
        if name is not None:
             user_obj.name = name
        if email is not None:
             user_obj.email = email
        if password is not None:
             user_obj.password = get_password_hash(password)
        if role is not None:
             user_obj.role = role
        db.commit()
        db.refresh(user_obj)
    return user_obj


def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
    return user