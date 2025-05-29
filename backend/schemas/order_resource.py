from pydantic import BaseModel
from typing import List # Импортируем List

# Схема для создания одного ресурса для заказа
class OrderResourceCreate(BaseModel):
    type_resource: str
    resource_count: int

# Схема для возврата одного ресурса заказа (включая его ID)
class OrderResource(OrderResourceCreate):
    id: int
    order_id: int

    class Config:
        orm_mode = True

# Для массового добавления/обновления ресурсов заказа
class OrderResourceListCreate(BaseModel):
    resources: List[OrderResourceCreate]