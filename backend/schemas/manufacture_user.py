from pydantic import BaseModel

class ManufactureUserCreate(BaseModel):
    user_id: int
    manufacture_id: int

class ManufactureUser(ManufactureUserCreate):
    id: int

    class Config:
        orm_mode = True
