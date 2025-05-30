from typing import List, Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from backend import schemas
from backend.crud import resources
from backend.crud import manufacture_user
from backend.auth import get_current_user_is_executor, get_current_user
from ..database import get_db

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.post("/", response_model=schemas.Resource)
def create_resource_for_my_manufacture(
        type_resource: Annotated[str, Form()],
        ready_time: Annotated[int, Form()],
        current_user: Annotated[schemas.User, Depends(get_current_user_is_executor)],
        db: Session = Depends(get_db)
):
    """
    Создает новый ресурс для предприятия, связанного с текущим авторизованным Производителем.
    """
    manufacture_user_link = manufacture_user.get_manufacture_user_by_user_id(db, user_id=current_user.id)
    if not manufacture_user_link:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Executor user is not linked to any manufacture.")

    manufacture_id = manufacture_user_link.manufacture_id

    return resources.create_resource(db, manufacture_id=manufacture_id, type_resource=type_resource,
                                     ready_time=ready_time)


@router.get("/my-manufacture/", response_model=List[schemas.Resource])
def get_my_manufacture_resources(
        current_user: Annotated[schemas.User, Depends(get_current_user_is_executor)],
        db: Session = Depends(get_db)
):
    """
    Получает все ресурсы, принадлежащие предприятию, связанному с текущим авторизованным Производителем.
    """
    manufacture_user_link = manufacture_user.get_manufacture_user_by_user_id(db, user_id=current_user.id)
    if not manufacture_user_link:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Executor user is not linked to any manufacture.")

    manufacture_id = manufacture_user_link.manufacture_id
    return resources.get_resources_by_manufacture_id(db, manufacture_id=manufacture_id)


# Эндпоинт для получения всех ресурсов (доступен, возможно, только админам)
@router.get("/", response_model=List[schemas.Resource])
def get_all_resources(db: Session = Depends(get_db)):
    """Получает все ресурсы в системе (для админов или общего обзора)."""
    # В будущем добавить зависимость get_current_user_is_admin
    return resources.get_all_resources(db)


# Эндпоинт для обновления ресурса (доступен только владельцу ресурса)
@router.patch("/{resource_id}", response_model=schemas.Resource)
def update_resource_endpoint(
        resource_id: int,
        updates: schemas.ResourceUpdate,
        current_user: Annotated[schemas.User, Depends(get_current_user_is_executor)],
        db: Session = Depends(get_db)
):
    """
    Обновляет ресурс по ID. Только Производитель, которому принадлежит ресурс, может его обновить.
    """
    db_resource = resources.get_resource_by_id(db, resource_id)
    if not db_resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

    manufacture_user_link = manufacture_user.get_manufacture_user_by_user_id(db, user_id=current_user.id)
    if not manufacture_user_link or db_resource.manufacture_id != manufacture_user_link.manufacture_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this resource.")

    updated_resource = resources.update_resource(db, resource_id, updates.model_dump(exclude_unset=True))
    if not updated_resource:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update resource.")
    return updated_resource


# Эндпоинт для удаления ресурса (доступен только владельцу ресурса)
@router.delete("/{resource_id}", response_model=schemas.Resource)
def delete_resource_endpoint(
        resource_id: int,
        current_user: Annotated[schemas.User, Depends(get_current_user_is_executor)],
        db: Session = Depends(get_db)
):
    """
    Удаляет ресурс по ID. Только Производитель, которому принадлежит ресурс, может его удалить.
    """
    db_resource = resources.get_resource_by_id(db, resource_id)
    if not db_resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

    manufacture_user_link = manufacture_user.get_manufacture_user_by_user_id(db, user_id=current_user.id)
    if not manufacture_user_link or db_resource.manufacture_id != manufacture_user_link.manufacture_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this resource.")

    deleted_resource = resources.delete_resource(db, resource_id)
    if not deleted_resource:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete resource.")
    return deleted_resource