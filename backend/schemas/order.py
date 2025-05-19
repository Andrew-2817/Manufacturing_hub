from pydantic import BaseModel

class OrderCreate(BaseModel):
    user_order_id: int
    status: str
    geoip_lat: float
    geoip_lon: float
    comments: str
    price: float
    ready_to: bool

class Order(OrderCreate):
    id: int

    class Config:
        orm_mode = True
