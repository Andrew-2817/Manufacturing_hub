from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend import schemas
from backend.crud import manufacture
from ..database import engine, get_db, Base

router = APIRouter(prefix="/manufactures", tags=["Manufactures"])



@router.post("/", response_model=schemas.Manufacture)
def create_manufacture(data: schemas.ManufactureCreate, db: Session = Depends(get_db)):
    return manufacture.create_manufacture(db, data.name, data.geoip_lat, data.geoip_lon)


@router.get("/", response_model=List[schemas.Manufacture])
def get_all(db: Session = Depends(get_db)):
    return manufacture.get_all_manufactures(db)


@router.delete("/{manufacture_id}", response_model=schemas.Manufacture)
def delete_manufacture(manufacture_id: int, db: Session = Depends(get_db)):
    item = manufacture.delete_manufacture(db, manufacture_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Manufacture not found")
    return item
