from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import false
from sqlalchemy.orm import Session
from .. import schemas
from backend.crud import order
from ..database import engine, get_db, Base

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=schemas.Order)
def create_order(ord: schemas.OrderCreate, db: Session = Depends(get_db)):
    return order.create_order(db,
                              user_order_id=ord.user_order_id,
                              status=ord.status,
                              geoip_lat=ord.geoip_lat,
                              geoip_lon=ord.geoip_lon,
                              comments=ord.comments,
                              price=ord.price,
                              ready_to=False)

@router.get("/", response_model=List[schemas.Order])
def get_orders(db: Session = Depends(get_db)):
    return order.get_all_orders(db)

@router.delete("/{order_id}", response_model=schemas.Order)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    return order.delete_order(db, order_id)
