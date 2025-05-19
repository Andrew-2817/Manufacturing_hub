from pydantic import BaseModel

class ManufactureOrderCreate(BaseModel):
    manufacture_id: int
    order_id: int

class ManufactureOrder(ManufactureOrderCreate):
    id: int

    class Config:
        orm_mode = True
