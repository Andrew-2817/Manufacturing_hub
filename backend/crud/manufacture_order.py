from typing import List
from sqlalchemy.orm import Session

from backend.models.manufacture_order import ManufactureOrder

def create_manufacture_order(db: Session, manufacture_id: int, order_id: int):
    db_manufacture_order = ManufactureOrder(manufacture_id=manufacture_id, order_id=order_id)
    db.add(db_manufacture_order)
    db.commit()
    db.refresh(db_manufacture_order)
    return db_manufacture_order

def get_manufacture_orders(db: Session):
    return db.query(ManufactureOrder).all()

# НОВАЯ функция: получить связи заказ-производство по manufacture_id
def get_manufacture_orders_by_manufacture_id(db: Session, manufacture_id: int) -> List[ManufactureOrder]:
    return db.query(ManufactureOrder).filter(ManufactureOrder.manufacture_id == manufacture_id).all()


def delete_manufacture_order(db: Session, manufacture_order_id: int):
    manufacture_order = db.query(ManufactureOrder).filter(ManufactureOrder.id == manufacture_order_id).first()
    if manufacture_order:
        db.delete(manufacture_order)
        db.commit()
    return manufacture_order