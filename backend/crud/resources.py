from typing import List

from sqlalchemy import func

from backend.database import engine
from sqlalchemy.orm import Session

from backend.models.resources import Resource


def create_resource(db: Session, manufacture_id: int, type_resource: str, ready_time: int = 0):
    db_resource = Resource(manufacture_id=manufacture_id, type_resource=type_resource, ready_time=ready_time)
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

def get_resource_by_id(db: Session, resource_id: int):
    return db.query(Resource).filter(Resource.id == resource_id).first()

def get_resource_by_manufacture_id(db: Session, manufacture_id: int):
    return db.query(Resource).filter(Resource.manufacture_id == manufacture_id).first()

def get_all_resources(db: Session):
    return db.query(Resource).all()

def get_manufactures_with_ready_time(db: Session, resource_type: List):
    manufacture_count = db.query(
        Resource.manufacture_id,
        func.sum(Resource.ready_time),
        func.count(Resource.manufacture_id)
    ).filter(
        Resource.type_resource.in_(resource_type)
    ).group_by(Resource.manufacture_id).all()

    dct = {}
    for row in manufacture_count:
        if row[2] == len(resource_type):
            dct[row[0]] = row[1]
    return dct

def delete_resource(db: Session, resource_id: int):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if resource:
        db.delete(resource)
        db.commit()
    return resource



# print(get_manufactures_with_resource(Session(bind=engine), resource_type=['токарный', 'фрезерный']))