from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.models.resources import Resource
from backend.models.manufacture_user import ManufactureUser


def create_resource(db: Session, manufacture_id: int, type_resource: str, ready_time: int):
    """Создает новый ресурс для указанного производителя."""
    db_resource = Resource(manufacture_id=manufacture_id, type_resource=type_resource, ready_time=ready_time)
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

def get_resource_by_id(db: Session, resource_id: int) -> Optional[Resource]:
    """Получает ресурс по его ID."""
    return db.query(Resource).filter(Resource.id == resource_id).first()

def get_resources_by_manufacture_id(db: Session, manufacture_id: int) -> List[Resource]:
    """Получает все ресурсы, принадлежащие конкретному производителю."""
    return db.query(Resource).filter(Resource.manufacture_id == manufacture_id).all()

def get_all_resources(db: Session) -> List[Resource]:
    """Получает все ресурсы в системе (вероятно, только для админов)."""
    return db.query(Resource).all()

def update_resource(db: Session, resource_id: int, updates: Dict[str, Any]) -> Optional[Resource]:
    """Обновляет поля существующего ресурса."""
    db_resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if db_resource:
        for key, value in updates.items():
            if hasattr(db_resource, key) and value is not None:
                setattr(db_resource, key, value)
        db.commit()
        db.refresh(db_resource)
    return db_resource


def get_manufactures_with_ready_time(db: Session, resource_type: List[str]) -> Dict[int, float]:
    """
    Получает производителей, которые имеют все указанные типы ресурсов,
    и их суммарное время готовности (ready_time).
    Возвращает словарь {manufacture_id: total_ready_time}.
    """
    subquery = db.query(
        Resource.manufacture_id,
        Resource.type_resource,
        Resource.ready_time
    ).filter(
        Resource.type_resource.in_(resource_type)
    ).subquery()

    manufacture_counts_and_times = db.query(
        subquery.c.manufacture_id,
        func.count(subquery.c.type_resource).label('resource_count'),
        func.sum(subquery.c.ready_time).label('total_ready_time')
    ).group_by(subquery.c.manufacture_id).all()

    dct = {}
    for row in manufacture_counts_and_times:
        if row.resource_count == len(resource_type):
            dct[row.manufacture_id] = float(row.total_ready_time) # Ensure float
    return dct


def delete_resource(db: Session, resource_id: int) -> Optional[Resource]:
    """Удаляет ресурс по его ID."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if resource:
        db.delete(resource)
        db.commit()
    return resource