from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status

from backend import schemas
from backend.crud import user # Убедимся, что user CRUD импортирован
# order импорт не нужен здесь, удалим его
# from backend.crud import order
from ..database import engine, get_db, Base

router = APIRouter(prefix="/users", tags=["Users"])

# Эндпоинт для регистрации пользователя
@router.post("/", response_model=schemas.User)
def create_user(us: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user_exists = user.get_user_by_email(db=db, email=us.email)
    if db_user_exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email already registered")

    # Роль по умолчанию для обычного пользователя
    role_to_assign = us.role or 'user'
    db_user = user.create_user(db=db, name=us.name, email=us.email, password=us.password, role=role_to_assign)
    return db_user

# Эндпоинт для авторизации
@router.post("/login/", response_model=schemas.User)
def login_user(us: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = user.get_user_by_email(db=db, email=us.email)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    # Проверка пароля (в будущем нужно использовать хеширование)
    if db_user.password != us.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    # Если email и пароль верны, возвращаем объект пользователя
    return db_user

# Эндпоинт для получения пользователя по ID (НОВЫЙ/ИЗМЕНЕННЫЙ)
@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(user_id: int, db: Session = Depends(get_db)):
    db_user = user.get_user_by_id(db=db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Эндпоинт для получения пользователя по email (оставлен, но теперь есть по ID)
@router.get("/by-email/{email}", response_model=schemas.User) # Изменил путь, чтобы избежать конфликта с /{user_id}
def read_user_by_email(email: str, db: Session = Depends(get_db)):
    db_user = user.get_user_by_email(db=db, email=email)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/", response_model=List[schemas.User])
def read_users(db: Session = Depends(get_db)):
    return user.get_users(db=db)


@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, us: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = user.update_user(db=db, user_id=user_id, name=us.name, email=us.email, password=us.password,
                                    role=us.role)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.delete("/{user_id}", response_model=schemas.User)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = user.delete_user(db=db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user