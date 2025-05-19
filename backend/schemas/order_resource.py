from pydantic import BaseModel

class OrderResourceCreate(BaseModel):
    order_id: int
    type_resource: str
    resource_count: int

class OrderResource(OrderResourceCreate):
    id: int

    class Config:
        orm_mode = True
