from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str

class User(UserCreate):
    id: int

    class Config:
        orm_mode = True
