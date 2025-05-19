from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend import schemas
from backend.crud import order
from backend.crud import user
from ..database import engine, get_db, Base

router = APIRouter(prefix="/users", tags=["Users"])



@router.post("/users/", response_model=schemas.User)
def create_user(us: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = user.create_user(db=db, name=us.name, email=us.email, password=us.password, role=us.role)
    return db_user


@router.get("/{email}", response_model=schemas.User)
def read_user(email: str, db: Session = Depends(get_db)):
    db_user = user.get_user_by_email(db=db, email=email)
    return db_user


@router.get("/", response_model=List[schemas.User])
def read_users(db: Session = Depends(get_db)):
    return user.get_users(db=db)


@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, us: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = user.update_user(db=db, user_id=user_id, name=us.name, email=us.email, password=us.password,
                                    role=us.role)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.delete("/{user_id}", response_model=schemas.User)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = user.delete_user(db=db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    # print('User deleted')
    return db_user
