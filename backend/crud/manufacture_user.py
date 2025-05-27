from sqlalchemy.orm import Session
from backend.models.manufacture_user import ManufactureUser

def create_manufacture_user(db: Session, user_id: int, manufacture_id: int):
    db_manufacture_user = ManufactureUser(user_id=user_id, manufacture_id=manufacture_id)
    db.add(db_manufacture_user)
    db.commit()
    db.refresh(db_manufacture_user)
    return db_manufacture_user

def get_manufacture_users(db: Session):
    return db.query(ManufactureUser).all()

# НОВАЯ функция: получить связь пользователя-производителя по user_id
def get_manufacture_user_by_user_id(db: Session, user_id: int) -> ManufactureUser | None:
    return db.query(ManufactureUser).filter(ManufactureUser.user_id == user_id).first()


def delete_manufacture_user(db: Session, user_id: int, manufacture_id: int):
    manufacture_user = db.query(ManufactureUser).filter(ManufactureUser.user_id == user_id, ManufactureUser.manufacture_id == manufacture_id).first()
    if manufacture_user:
        db.delete(manufacture_user)
        db.commit()
    return manufacture_user