from pydantic import BaseModel

# Существующая схема для создания пользователя (регистрация)
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    # Роль может приходить из формы регистрации сотрудников,
    # для обычного пользователя фронтенд отправит 'user'
    role: str

# Существующая схема для возврата полных данных пользователя
class User(UserCreate):
    id: int

    class Config:
        # Pydantic v2: используйте from_attributes = True
        # Pydantic v1: используйте orm_mode = True
        orm_mode = True # Если используете Pydantic v1
        # from_attributes = True # Раскомментируйте, если Pydantic v2

# Новая схема для запроса логина (форма x-www-form-urlencoded)
class UserLogin(BaseModel):
    # В стандартной форме OAuth2PasswordRequestForm поле для email называется 'username'
    username: str # Переименовано с 'email' для соответствия OAuth2PasswordRequestForm
    password: str

# НОВАЯ схема для ответа при успешном логине
class Token(BaseModel):
    access_token: str # Сам JWT токен
    token_type: str # Тип токена, обычно "bearer"
    # Опционально можно включить ID и роль пользователя в ответ логина для удобства фронтенда
    user_id: int
    user_role: str