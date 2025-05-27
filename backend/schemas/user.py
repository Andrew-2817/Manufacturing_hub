from pydantic import BaseModel

# Существующая схема для создания пользователя (регистрация)
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str # Добавим роль, чтобы можно было регистрировать с разными ролями, хотя на фронте для обычного пользователя она будет фиксирована

# Существующая схема для возврата данных пользователя
class User(UserCreate):
    id: int

    class Config:
        orm_mode = True

# Новая схема для запроса логина
class UserLogin(BaseModel):
    email: str
    password: str