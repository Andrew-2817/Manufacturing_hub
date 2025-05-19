from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas
from backend.crud import manufacture_order
from ..database import engine, get_db, Base

router = APIRouter(prefix="/manufacture-orders", tags=["Manufacture-Orders"])


@router.post("/", response_model=schemas.ManufactureOrder)
def create_link(data: schemas.ManufactureOrderCreate, db: Session = Depends(get_db)):
    return manufacture_order.create_manufacture_order(db, data.manufacture_id, data.order_id)

@router.get("/", response_model=List[schemas.ManufactureOrder])
def get_all(db: Session = Depends(get_db)):
    return manufacture_order.get_manufacture_orders(db)

@router.delete("/{link_id}", response_model=schemas.ManufactureOrder)
def delete_link(link_id: int, db: Session = Depends(get_db)):
    return manufacture_order.delete_manufacture_order(db, link_id)
