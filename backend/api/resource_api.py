from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas
from backend.crud import resources
from ..database import engine, get_db, Base

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.post("/", response_model=schemas.Resource)
def create_resource(data: schemas.ResourceCreate, db: Session = Depends(get_db)):
    return resources.create_resource(db, data.manufacture_id, data.type_resource, data.resource_count)

@router.get("/", response_model=List[schemas.Resource])
def get_resources(db: Session = Depends(get_db)):
    return resources.get_all_resources(db)

@router.delete("/{resource_id}", response_model=schemas.Resource)
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    return resources.delete_resource(db, resource_id)
