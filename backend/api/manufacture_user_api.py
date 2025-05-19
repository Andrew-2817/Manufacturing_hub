from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas
from backend.crud import manufacture_user
from ..database import engine, get_db, Base

router = APIRouter(prefix="/manufacture-users", tags=["Manufacture-User"])


@router.post("/", response_model=schemas.ManufactureUser)
def create_link(data: schemas.ManufactureUserCreate, db: Session = Depends(get_db)):
    return manufacture_user.create_manufacture_user(db, data.user_id, data.manufacture_id)

@router.get("/", response_model=List[schemas.ManufactureUser])
def get_all(db: Session = Depends(get_db)):
    return manufacture_user.get_manufacture_users(db)

@router.delete("/{link_id}", response_model=schemas.ManufactureUser)
def delete_link(user_id: int, manufacture_id: int ,db: Session = Depends(get_db)):
    return manufacture_user.delete_manufacture_user(db, user_id, manufacture_id)
