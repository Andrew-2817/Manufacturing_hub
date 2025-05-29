from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func  # Для использования SQL-функций, если нужно

from backend.database import engine  # engine здесь не используется, можно удалить
from backend.models.order import Order
from backend.models.manufacture_order import ManufactureOrder  # Импортируем модель связи
from backend.models.manufacture import Manufacture  # Импортируем модель производителя



def _get_orders_with_manufacturer_info(db: Session):
    """
    Создает базовый запрос к Order, включая LEFT OUTER JOIN с ManufactureOrder и Manufacture,
    чтобы получить информацию о назначенном производителе.
    """
    query = db.query(
        Order,
        ManufactureOrder,
        Manufacture
    ).outerjoin(
        ManufactureOrder, Order.id == ManufactureOrder.order_id
    ).outerjoin(
        Manufacture, ManufactureOrder.manufacture_id == Manufacture.id
    )
    return query


def create_order(db: Session, user_order_id: int, order_number: Optional[int], status: str, geoip_lat: float,
                 geoip_lon: float, comments: Optional[str], price: float, ready_to: bool, file_path: Optional[str]):
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
    result = _get_orders_with_manufacturer_info(db).filter(Order.id == order_id).first()
    if result:
        order_obj, m_order, manufacturer = result
        if manufacturer:
            order_obj.assigned_manufacturer_id = manufacturer.id
            order_obj.assigned_manufacturer_name = manufacturer.name
        return order_obj
    return None


# Функция для получения заказов пользователя по user_id
def get_orders_by_user_id(db: Session, user_id: int) -> List[Order]:
    results = _get_orders_with_manufacturer_info(db).filter(Order.user_order_id == user_id).all()
    orders_list = []
    for order_obj, m_order, manufacturer in results:
        if manufacturer:
            order_obj.assigned_manufacturer_id = manufacturer.id
            order_obj.assigned_manufacturer_name = manufacturer.name
        orders_list.append(order_obj)
    return orders_list


# Функция для получения заказов по статусам (для отдела)
def get_orders_by_statuses(db: Session, statuses: Optional[List[str]] = None) -> List[Order]:
    query = _get_orders_with_manufacturer_info(db)
    if statuses:
        if len(statuses) > 0:
            query = query.filter(Order.status.in_(statuses))
    query = query.order_by(Order.order_number)
    results = query.all()

    orders_list = []
    for order_obj, m_order, manufacturer in results:
        if manufacturer:
            order_obj.assigned_manufacturer_id = manufacturer.id
            order_obj.assigned_manufacturer_name = manufacturer.name
        orders_list.append(order_obj)
    return orders_list


# Функция для получения заказов по списку их ID, фильтруя по статусам
def get_orders_by_ids_and_statuses(db: Session, order_ids: List[int], statuses: Optional[List[str]] = None) -> List[
    Order]:
    query = _get_orders_with_manufacturer_info(db).filter(Order.id.in_(order_ids))
    if statuses:
        if len(statuses) > 0:
            query = query.filter(Order.status.in_(statuses))
    query = query.order_by(Order.order_number)
    results = query.all()

    orders_list = []
    for order_obj, m_order, manufacturer in results:
        if manufacturer:
            order_obj.assigned_manufacturer_id = manufacturer.id
            order_obj.assigned_manufacturer_name = manufacturer.name
        orders_list.append(order_obj)
    return orders_list


# Обновление заказа
def update_order(db: Session, order_id: int, updates: Dict[str, Any]):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if db_order:
        for key, value in updates.items():
            if hasattr(db_order, key) and value is not None:
                if key == 'price' and value is not None:
                    db_order.price = float(value)
                else:
                    setattr(db_order, key, value)
        db.commit()
        db.refresh(db_order)
    return db_order

# Получаем geoip_lat и geoip_lon из Order
def get_orders_geoip_by_id(db: Session, order_id: int):
    return db.query(Order.geoip_lat, Order.geoip_lon).filter(Order.id == order_id).first()


def get_all_orders(db: Session):
    results = _get_orders_with_manufacturer_info(db).all()
    orders_list = []
    for order_obj, m_order, manufacturer in results:
        if manufacturer:
            order_obj.assigned_manufacturer_id = manufacturer.id
            order_obj.assigned_manufacturer_name = manufacturer.name
        orders_list.append(order_obj)
    return orders_list


def delete_order(db: Session, order_id: int):
    order_obj = db.query(Order).filter(Order.id == order_id).first()
    if order_obj:
        db.delete(order_obj)
        db.commit()
    return order_obj