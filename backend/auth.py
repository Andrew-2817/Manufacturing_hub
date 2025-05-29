import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from backend.crud.user import get_user_by_id
from backend.database import get_db
from sqlalchemy.orm import Session
from backend.schemas.user import User as UserSchema

from dotenv import load_dotenv
load_dotenv()

# --- Конфигурация безопасности ---

SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login/")


# --- Функции для работы с паролями ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет соответствие введенного открытого пароля хешированному паролю из БД."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Хеширует открытый пароль с использованием bcrypt."""
    return pwd_context.hash(password)


# --- Функции для работы с JWT токенами ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Создает JWT токен доступа.
    :param data: Полезная нагрузка для включения в токен (например, ID пользователя, роль).
    :param expires_delta: Время, через которое токен истечет. Если None, используется значение по умолчанию.
    :return: JWT токен в виде строки.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserSchema:
    """
    Зависимость FastAPI для получения текущего авторизованного пользователя.
    Извлекает токен из заголовка 'Authorization: Bearer <token>', декодирует его,
    валидирует срок действия и подпись, извлекает ID пользователя из полезной нагрузки
    и возвращает объект пользователя из базы данных.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


        user_id: Optional[str] = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        user = get_user_by_id(db, user_id=int(user_id))

        if user is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    return user

# --- Зависимости для проверки ролей ---

def get_current_user_is_department(current_user: UserSchema = Depends(get_current_user)):
    """Зависимость: текущий пользователь авторизован и имеет роль 'department'."""
    if current_user.role != "department":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this resource")
    return current_user

def get_current_user_is_executor(current_user: UserSchema = Depends(get_current_user)):
    """Зависимость: текущий пользователь авторизован и имеет роль 'executor'."""
    if current_user.role != "executor":
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this resource")
    return current_user

def get_current_user_is_user(current_user: UserSchema = Depends(get_current_user)):
    """Зависимость: текущий пользователь авторизован и имеет роль 'user'."""
    if current_user.role != "user":
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this resource")
    return current_user
