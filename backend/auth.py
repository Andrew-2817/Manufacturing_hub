import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
# Используем стандартную схему OAuth2 для извлечения токена из заголовка
from fastapi.security import OAuth2PasswordBearer
# Библиотеки для работы с JWT токенами
from jose import JWTError, jwt
# Библиотека для хеширования паролей
from passlib.context import CryptContext

# Для загрузки SECRET_KEY из .env файла
from dotenv import load_dotenv
load_dotenv() # Загружаем переменные окружения из .env

# --- Конфигурация безопасности ---

# Получаем секретный ключ для подписи JWT токенов из переменных окружения.
# ВАЖНО: В продакшене используйте надёжный и уникальный ключ!
# Если переменная окружения не установлена (для удобства разработки), используем заглушку
# НО ОБЯЗАТЕЛЬНО УСТАНОВИТЕ ПЕРЕМЕННУЮ SECRET_KEY В ВАШЕМ .env ФАЙЛЕ!
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
ALGORITHM = "HS256" # Алгоритм шифрования, рекомендуемый для JWT с секретным ключом
# Время жизни токена доступа. Задаем в минутах. Например, 7 дней * 24 часа/день * 60 минут/час
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# Объект для хеширования паролей. Используем алгоритм bcrypt, который считается надежным.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Схема OAuth2 для извлечения токена.
# tokenUrl указывает эндпоинт, куда клиент должен отправить логин/пароль для получения токена.
# Это только для документации OpenAPI (Swagger UI), сам эндпоинт логина мы реализуем отдельно.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login/")


# --- Функции для работы с паролями ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет соответствие введенного открытого пароля хешированному паролю из БД."""
    # Использует bcrypt для безопасного сравнения
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
    # Создаем копию данных, чтобы не изменять исходный словарь
    to_encode = data.copy()

    # Определяем время истечения срока действия токена
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Время истечения по умолчанию, если не указано
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Добавляем claim 'exp' (expiration time) в полезную нагрузку
    # claim 'sub' (subject) часто используется для идентификатора пользователя
    # Здесь мы используем 'sub' для ID пользователя и добавляем 'role'
    to_encode.update({"exp": expire}) # Время истечения в формате Unix timestamp

    # Кодируем полезную нагрузку в JWT токен с использованием секретного ключа и алгоритма
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Зависимость FastAPI для получения текущего пользователя ---

# Импортируем модель User и функцию get_user_by_id из CRUD
# Эти импорты должны быть здесь, т.к. эта зависимость работает с БД
from backend.crud.user import get_user_by_id
from backend.database import get_db
from sqlalchemy.orm import Session
# Импортируем схему User для аннотации типа возвращаемого значения
from backend.schemas.user import User as UserSchema

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserSchema:
    """
    Зависимость FastAPI для получения текущего авторизованного пользователя.
    Извлекает токен из заголовка 'Authorization: Bearer <token>', декодирует его,
    валидирует срок действия и подпись, извлекает ID пользователя из полезной нагрузки
    и возвращает объект пользователя из базы данных.
    """
    # Определяем исключение, которое будет вызвано, если аутентификация не удалась
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, # 401 статус для неавторизованного доступа
        detail="Could not validate credentials", # Сообщение об ошибке
        headers={"WWW-Authenticate": "Bearer"}, # Заголовок для информирования клиента о типе аутентификации
    )
    try:
        # Декодируем токен. jwt.decode проверит подпись и срок действия.
        # Указываем используемый алгоритм.
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Извлекаем ID пользователя ('sub') из полезной нагрузки
        # payload.get("sub") вернет None, если ключ 'sub' отсутствует
        user_id: Optional[str] = payload.get("sub")

        # Проверяем, что ID пользователя присутствует и является числом (в нашем случае, строкой ID)
        if user_id is None:
            # Если ID пользователя нет в токене, считаем учетные данные недействительными
            raise credentials_exception

        # Если необходимо, можно добавить валидацию типа user_id (например, if not isinstance(user_id, str):)

        # Получаем пользователя из базы данных по ID
        # user_id из JWT payload всегда строка, преобразуем в int для запроса к БД
        user = get_user_by_id(db, user_id=int(user_id))

        if user is None:
            # Если пользователь с таким ID не найден в БД (возможно, был удален после выдачи токена)
            raise credentials_exception

    except JWTError:
        # Если токен некорректен (неверная подпись, некорректный формат, просрочен)
        raise credentials_exception

    # Если все проверки пройдены, возвращаем объект пользователя
    return user

# --- Зависимости для проверки ролей ---

# Создаем вспомогательные зависимости, которые используют get_current_user
# и дополнительно проверяют роль пользователя.
# Это удобно для защиты эндпоинтов, доступных только определенным ролям.

def get_current_user_is_department(current_user: UserSchema = Depends(get_current_user)):
    """Зависимость: текущий пользователь авторизован и имеет роль 'department'."""
    if current_user.role != "department":
        # Если роль не совпадает, вызываем ошибку 403 Forbidden (доступ запрещен)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this resource")
    return current_user # Возвращаем объект пользователя, если роль соответствует

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

# Можно добавить зависимость для админа, если есть такая роль
# def get_current_user_is_admin(current_user: UserSchema = Depends(get_current_user)):
#     if current_user.role != "admin":
#          raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this resource")
#     return current_user

# Можно добавить зависимость, разрешающую несколько ролей
# def get_current_user_has_roles(allowed_roles: list[str]):
#     def _get_current_user_has_roles(current_user: UserSchema = Depends(get_current_user)):
#         if current_user.role not in allowed_roles:
#             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this resource")
#         return current_user
#     return _get_current_user_has_roles