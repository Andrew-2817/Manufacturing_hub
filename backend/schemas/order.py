from pydantic import BaseModel
from typing import Optional

class OrderCreate(BaseModel):
    user_order_id: int
    order_number: Optional[int] = None
    status: str
    geoip_lat: float
    geoip_lon: float
    comments: Optional[str] = None
    price: float
    ready_to: bool
    file_path: Optional[str] = None

class Order(OrderCreate):
    id: int
    assigned_manufacturer_id: Optional[int] = None
    assigned_manufacturer_name: Optional[str] = None

    class Config:
        orm_mode = True

class OrderUpdate(BaseModel):
    order_number: Optional[int] = None
    status: Optional[str] = None
    geoip_lat: Optional[float] = None
    geoip_lon: Optional[float] = None
    comments: Optional[str] = None
    price: Optional[float] = None
    ready_to: Optional[bool] = None
    file_path: Optional[str] = None