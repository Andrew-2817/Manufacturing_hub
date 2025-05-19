from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend import schemas
from backend.crud import order_resources
from ..database import engine, get_db, Base

router = APIRouter(prefix="/order-resources", tags=["Order-Resources"])


@router.post("/", response_model=schemas.OrderResource)
def create_link(data: schemas.OrderResourceCreate, db: Session = Depends(get_db)):
    return order_resources.create_order_resource(db, data.order_id, data.type_resource, data.resource_count)

@router.get("/", response_model=List[schemas.OrderResource])
def get_all(db: Session = Depends(get_db)):
    return order_resources.get_order_resources(db)

@router.delete("/{link_id}", response_model=schemas.OrderResource)
def delete_link(link_id: int, db: Session = Depends(get_db)):
    return order_resources.delete_order_resource(db, link_id)
