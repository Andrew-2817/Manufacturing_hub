from typing import List, Optional # Импортируем Optional
from sqlalchemy.orm import Session

from backend.models.manufacture_order import ManufactureOrder

def create_manufacture_order(db: Session, manufacture_id: int, order_id: int):
    """Создает новую запись о назначении производителя для заказа."""
    db_manufacture_order = ManufactureOrder(manufacture_id=manufacture_id, order_id=order_id)
    db.add(db_manufacture_order)
    db.commit()
    db.refresh(db_manufacture_order)
    return db_manufacture_order

def get_manufacture_orders(db: Session) -> List[ManufactureOrder]:
    """Получает все записи о назначениях производителей для заказов."""
    return db.query(ManufactureOrder).all()

def get_manufacture_orders_by_manufacture_id(db: Session, manufacture_id: int) -> List[ManufactureOrder]:
    """Получает записи о назначениях заказов для указанного производителя."""
    return db.query(ManufactureOrder).filter(ManufactureOrder.manufacture_id == manufacture_id).all()

# НОВАЯ ФУНКЦИЯ: Получить связь заказа с производителем по order_id
def get_manufacture_order_by_order_id(db: Session, order_id: int) -> Optional[ManufactureOrder]:
    """Получает запись о назначении производителя для указанного заказа по его ID."""
    return db.query(ManufactureOrder).filter(ManufactureOrder.order_id == order_id).first()


def delete_manufacture_order(db: Session, manufacture_order_id: int):
    """Удаляет запись о назначении производителя по ее ID."""
    manufacture_order = db.query(ManufactureOrder).filter(ManufactureOrder.id == manufacture_order_id).first()
    if manufacture_order:
        db.delete(manufacture_order)
        db.commit()
    return manufacture_order