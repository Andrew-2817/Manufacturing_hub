from pydantic import BaseModel

# Схема для создания пользователя (регистрация)
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str

# Схема для возврата полных данных пользователя
class User(UserCreate):
    id: int

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: str
    password: str

# Схема для ответа при успешном логине
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    user_role: str