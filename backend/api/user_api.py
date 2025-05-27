from typing import List, Annotated

from fastapi import APIRouter, Depends, HTTPException
# Импортируем стандартную форму для логина, ожидающую x-www-form-urlencoded
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette import status
from datetime import timedelta

from backend import schemas
# Импортируем все необходимые функции и зависимости из модуля аутентификации
from backend.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user, # Зависимость для получения текущего пользователя
    ACCESS_TOKEN_EXPIRE_MINUTES # Время жизни токена
)
from backend.crud import user
from ..database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

# Эндпоинт для регистрации пользователя
# Здесь мы хешируем пароль перед передачей в CRUD
@router.post("/", response_model=schemas.User)
def create_user(us: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user_exists = user.get_user_by_email(db=db, email=us.email)
    if db_user_exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email already registered")

    # ХЕШИРУЕМ ПАРОЛЬ перед сохранением
    hashed_password = get_password_hash(us.password)

    # Роль по умолчанию для обычного пользователя, если не указана (например, из формы сотрудничества)
    role_to_assign = us.role or 'user'
    # Создаем пользователя с хешированным паролем
    db_user = user.create_user(db=db, name=us.name, email=us.email, password=hashed_password, role=role_to_assign)
    return db_user

# ИЗМЕНЕНО: Эндпоинт для авторизации теперь принимает OAuth2PasswordRequestForm
# и возвращает схему Token.
# URL-путь "/login/" соответствует tokenUrl в OAuth2PasswordBearer
@router.post("/login/", response_model=schemas.Token) # Указываем схему ответа как Token
def login_for_access_token(
    # Автоматически парсит x-www-form-urlencoded данные формы, ожидая поля 'username' и 'password'
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    """
    Обрабатывает вход пользователя, проверяет учетные данные и выдает JWT токен.
    Ожидает данные в формате x-www-form-urlencoded с полями `username` (для email) и `password`.
    """
    # Ищем пользователя по email (form_data.username)
    user_auth = user.get_user_by_email(db=db, email=form_data.username)

    # Проверяем наличие пользователя и правильность пароля (используем verify_password для сравнения с хешем)
    if not user_auth or not verify_password(form_data.password, user_auth.password):
        # Вызываем ошибку 401 Unauthorized с заголовком WWW-Authenticate для информирования клиента
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Если аутентификация успешна, создаем JWT токен
    # В полезную нагрузку (data) кладем ID пользователя ('sub') и роль
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user_auth.id), "role": user_auth.role}, # ID пользователя в токене делаем строкой
        expires_delta=access_token_expires
    )

    # Возвращаем объект, соответствующий схеме Token
    return {"access_token": access_token, "token_type": "bearer", "user_id": user_auth.id, "user_role": user_auth.role}


# НОВЫЙ Эндпоинт для получения данных текущего авторизованного пользователя
# Этот эндпоинт защищен зависимостью get_current_user
@router.get("/me/", response_model=schemas.User) # Возвращаем полную схему User
def read_users_me(current_user: Annotated[schemas.User, Depends(get_current_user)]):
    """
    Возвращает полные данные текущего авторизованного пользователя.
    Для доступа требуется действительный JWT токен в заголовке 'Authorization: Bearer <token>'.
    """
    # Зависимость get_current_user уже выполнила всю работу по валидации токена
    # и получению объекта пользователя из БД. Просто возвращаем его.
    return current_user


# Существующий эндпоинт для получения пользователя по ID
# В текущей реализации не защищен токеном. Решите, нужна ли ему защита (например, только админам)
@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(user_id: int, db: Session = Depends(get_db)):
    """ Получить данные пользователя по его ID (незащищенный эндпоинт). """
    db_user = user.get_user_by_id(db=db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Эндпоинт для получения пользователя по email
# В текущей реализации не защищен токеном.
@router.get("/by-email/{email}", response_model=schemas.User)
def read_user_by_email(email: str, db: Session = Depends(get_db)):
    """ Получить данные пользователя по его email (незащищенный эндпоинт). """
    db_user = user.get_user_by_email(db=db, email=email)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/", response_model=List[schemas.User])
def read_all_users(db: Session = Depends(get_db)):
    """ Получить список всех пользователей (незащищенный эндпоинт, вероятно, нужно защитить). """
    # В будущем добавить зависимость Depends(get_current_user_is_admin)
    return user.get_users(db=db)


# PUT и DELETE для пользователя - вероятно, должны быть защищены и проверять права
# Добавим зависимость get_current_user для аутентификации
@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, us: schemas.UserCreate,
                current_user: Annotated[schemas.User, Depends(get_current_user)],
                db: Session = Depends(get_db)):
    """ Обновить данные пользователя по ID (защищенный эндпоинт). """
    # Добавить проверку, что current_user.id == user_id или current_user имеет роль 'admin'
    if current_user.id != user_id and current_user.role != 'admin':
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this user")

    # При обновлении, если пароль предоставлен в us, он уже будет хеширован в CRUD функции
    db_user = user.update_user(db=db, user_id=user_id, name=us.name, email=us.email, password=us.password,
                                    role=us.role)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.delete("/{user_id}", response_model=schemas.User)
def delete_user(user_id: int,
                current_user: Annotated[schemas.User, Depends(get_current_user)],
                db: Session = Depends(get_db)):
    """ Удалить пользователя по ID (защищенный эндпоинт). """
    # Добавить проверку, что current_user.id == user_id или current_user имеет роль 'admin'
    if current_user.id != user_id and current_user.role != 'admin':
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this user")

    db_user = user.delete_user(db=db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user