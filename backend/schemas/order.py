from pydantic import BaseModel
from typing import Optional

# Существующая схема для создания заказа
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

# Существующая схема для возврата полного объекта заказа
class Order(OrderCreate):
    id: int
    # НОВЫЕ ПОЛЯ: Добавляем информацию о назначенном производителе
    assigned_manufacturer_id: Optional[int] = None
    assigned_manufacturer_name: Optional[str] = None

    class Config:
        orm_mode = True
        # В Pydantic v2 'orm_mode' переименован в 'from_attributes'.
        # Если используете Pydantic v2, замените orm_mode = True на from_attributes = True
        # orm_mode = True # <- Если Pydantic v1
        # from_attributes = True # <- Раскомментируйте, если Pydantic v2

# НОВАЯ схема для частичного обновления заказа (без изменений)
class OrderUpdate(BaseModel):
    order_number: Optional[int] = None
    status: Optional[str] = None
    geoip_lat: Optional[float] = None
    geoip_lon: Optional[float] = None
    comments: Optional[str] = None
    price: Optional[float] = None
    ready_to: Optional[bool] = None
    file_path: Optional[str] = None