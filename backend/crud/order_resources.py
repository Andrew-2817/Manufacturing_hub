from typing import List
from sqlalchemy.orm import Session
# Импортируем модель OrderResource
from backend.models.order_resources import OrderResource


def create_order_resource(db: Session, order_id: int, type_resource: str, resource_count: int):
    """Создает новую запись о ресурсе, необходимом для заказа."""
    db_order_resource = OrderResource(order_id=order_id, type_resource=type_resource, resource_count=resource_count)
    db.add(db_order_resource)
    db.commit()
    db.refresh(db_order_resource)
    return db_order_resource

def get_order_resources(db: Session) -> List[OrderResource]:
    """Получает все записи о необходимых ресурсах для всех заказов."""
    return db.query(OrderResource).all()

# НОВАЯ ФУНКЦИЯ: Получает ресурсы, необходимые для конкретного заказа
def get_order_resources_by_order_id(db: Session, order_id: int) -> List[OrderResource]:
    """Получает все записи о необходимых ресурсах для указанного заказа."""
    return db.query(OrderResource).filter(OrderResource.order_id == order_id).all()

# НОВАЯ ФУНКЦИЯ: Удаляет все ресурсы, необходимые для конкретного заказа
def delete_all_order_resources_for_order(db: Session, order_id: int) -> int:
    """Удаляет все записи о необходимых ресурсах для указанного заказа и возвращает количество удаленных."""
    deleted_count = db.query(OrderResource).filter(OrderResource.order_id == order_id).delete()
    db.commit()
    return deleted_count


def delete_order_resource(db: Session, order_resource_id: int):
    """Удаляет запись о необходимом ресурсе по ее ID."""
    order_resource = db.query(OrderResource).filter(OrderResource.id == order_resource_id).first()
    if order_resource:
        db.delete(order_resource)
        db.commit()
    return order_resource