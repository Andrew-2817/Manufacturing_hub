from sqlalchemy.orm import Session
from backend.database import engine
from backend.models.order import Order


def create_order(db: Session, user_order_id: int, status: str, geoip_lat: float, geoip_lon: float, comments: str, price: float, ready_to: bool):
    db_order = Order(user_order_id=user_order_id, status=status, geoip_lat=geoip_lat, geoip_lon=geoip_lon, comments=comments, price=price, ready_to=ready_to)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def get_order_by_id(db: Session, order_id: int):
    return db.query(Order).filter(Order.id == order_id).first()

def get_orders_geoip_by_id(db: Session, order_id: int):
    return db.query(Order.geoip_lat, Order.geoip_lon).filter(Order.id == order_id).first()

def get_all_orders(db: Session):
    return db.query(Order).all()

def delete_order(db: Session, order_id: int):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order:
        db.delete(order)
        db.commit()
    return order

# print(get_orders_geoip_by_id(Session(bind=engine), 1))
