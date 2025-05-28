from pydantic import BaseModel
from typing import List # Импортируем List

# Схема для создания одного ресурса для заказа
class OrderResourceCreate(BaseModel):
    # order_id не включаем сюда, так как он будет в URL пути
    type_resource: str
    resource_count: int

# Схема для возврата одного ресурса заказа (включая его ID)
class OrderResource(OrderResourceCreate):
    id: int
    order_id: int # order_id включаем, когда возвращаем объект

    class Config:
        orm_mode = True

# НОВАЯ СХЕМА: Для массового добавления/обновления ресурсов заказа
class OrderResourceListCreate(BaseModel):
    resources: List[OrderResourceCreate]