from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.database import engine
from backend.models.order import Order

# Обновляем функцию create_order
def create_order(db: Session, user_order_id: int, order_number: Optional[int], status: str, geoip_lat: float, geoip_lon: float, comments: Optional[str], price: float, ready_to: bool, file_path: Optional[str]):
    db_order = Order(
        user_order_id=user_order_id,
        order_number=order_number,
        status=status,
        geoip_lat=geoip_lat,
        geoip_lon=geoip_lon,
        comments=comments,
        price=price,
        ready_to=ready_to,
        file_path=file_path
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def get_order_by_id(db: Session, order_id: int):
    return db.query(Order).filter(Order.id == order_id).first()

# Функция для получения заказов пользователя по user_id
def get_orders_by_user_id(db: Session, user_id: int):
    return db.query(Order).filter(Order.user_order_id == user_id).all()

# Функция для получения заказов по статусам (для отдела)
def get_orders_by_statuses(db: Session, statuses: Optional[List[str]] = None):
    query = db.query(Order)
    if statuses:
        query = query.filter(Order.status.in_(statuses))
    query = query.order_by(Order.order_number) # Или по Order.id
    return query.all()

# НОВАЯ функция: получить заказы по списку их ID, опционально фильтруя по статусам
def get_orders_by_ids_and_statuses(db: Session, order_ids: List[int], statuses: Optional[List[str]] = None) -> List[Order]:
    query = db.query(Order).filter(Order.id.in_(order_ids))
    if statuses:
        query = query.filter(Order.status.in_(statuses))
    query = query.order_by(Order.order_number) # Или по Order.id
    return query.all()


# НОВАЯ функция для обновления заказа
# Принимает order_id и словарь с обновляемыми данными (используется в PATCH эндпоинте)
def update_order(db: Session, order_id: int, updates: Dict[str, Any]):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if db_order:
        for key, value in updates.items():
            # Обновляем только те поля, которые есть в словаре updates
            # Проверяем наличие атрибута и что значение не None (если хотим пропустить None)
            if hasattr(db_order, key) and value is not None:
                 # Специальная обработка для price, если оно Numeric в модели
                 if key == 'price' and value is not None:
                      db_order.price = float(value) # Приводим к float
                 else:
                    setattr(db_order, key, value)
        db.commit()
        db.refresh(db_order)
    return db_order


def get_orders_geoip_by_id(db: Session, order_id: int):
    return db.query(Order.geoip_lat, Order.geoip_lon).filter(Order.id == order_id).first()

def get_all_orders(db: Session):
    return db.query(Order).all()

def delete_order(db: Session, order_id: int):
    order_obj = db.query(Order).filter(Order.id == order_id).first()
    if order_obj:
        db.delete(order_obj)
        db.commit()
    return order_obj

# print(get_orders_geoip_by_id(Session(bind=engine), 1))