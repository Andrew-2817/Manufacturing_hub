from typing import List

from sqlalchemy import func

from backend.database import engine
from sqlalchemy.orm import Session

from backend.models.manufacture import Manufacture
from datetime import datetime

def create_manufacture(db: Session, name: str, geoip_lat: float, geoip_lon: float):
    db_manufacture = Manufacture(name=name, geoip_lat=geoip_lat, geoip_lon=geoip_lon)
    db.add(db_manufacture)
    db.commit()
    db.refresh(db_manufacture)
    return db_manufacture


def get_manufacture_by_id(db: Session, manufacture_id: int):
    return db.query(Manufacture).filter(Manufacture.id == manufacture_id).first()


def get_all_manufactures(db: Session):
    return db.query(Manufacture).all()


def get_manufactures_locations_by_id(db: Session, manufacturers_id: List[int]):
    return db.query(Manufacture.id, Manufacture.geoip_lat, Manufacture.geoip_lon).filter(Manufacture.id.in_(manufacturers_id)).all()

def get_manufacture_work_time(db: Session, manufacture_id: int):
    start_date = db.query(Manufacture.start_date).filter(Manufacture.id == manufacture_id).first()
    work_time = datetime.now() - start_date
    return work_time

def get_rating_criteria(db: Session, manufacturers_id: List[int]):
    return db.query(Manufacture.id, Manufacture.success_orders, Manufacture.failed_orders, Manufacture.start_date).filter(Manufacture.id.in_(manufacturers_id)).all()

def get_max_start_date(db: Session):
    return db.query(func.min(Manufacture.start_date)).first()[0]

def update_manufacture(db: Session, manufacture_id: int, name: str, geoip_lat: float, geoip_lon: float):
    manufacture = db.query(Manufacture).filter(Manufacture.id == manufacture_id).first()
    if manufacture:
        manufacture.name = name
        manufacture.geoip_lat = geoip_lat
        manufacture.geoip_long = geoip_lon
        db.commit()
        db.refresh(manufacture)
    return manufacture


def delete_manufacture(db: Session, manufacture_id: int):
    manufacture = db.query(Manufacture).filter(Manufacture.id == manufacture_id).first()
    if manufacture:
        db.delete(manufacture)
        db.commit()
    return manufacture

