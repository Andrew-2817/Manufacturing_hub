from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend import schemas
from backend.crud import order_resources
from backend.auth import get_current_user_is_department # Защита для отдела
from backend.database import get_db

router = APIRouter(prefix="/order-resources", tags=["Order-Resources"])

# Эндпоинт для создания одного ресурса (используется crud.create_order_resource)
# Может быть полезен, но для UI управления ресурсами лучше использовать bulk-эндпоинты
@router.post("/", response_model=schemas.OrderResource)
def create_link(data: schemas.OrderResourceCreate, db: Session = Depends(get_db)):
    # Этот эндпоинт не знает order_id, поэтому он не будет использоваться напрямую
    # для привязки ресурсов к заказу. Он, возможно, устарел.
    # Если он нужен, data должна включать order_id
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Use /order-resources/for-order/{order_id}/bulk for creating resources for an order.")


# НОВЫЙ ЭНДПОИНТ: Получить все ресурсы, необходимые для конкретного заказа
@router.get("/for-order/{order_id}", response_model=List[schemas.OrderResource],
            dependencies=[Depends(get_current_user_is_department)]) # Только отдел может просматривать ресурсы заказа
def get_order_resources_for_order(order_id: int, db: Session = Depends(get_db)):
    """Получает список ресурсов, необходимых для указанного заказа."""
    resources = order_resources.get_order_resources_by_order_id(db, order_id=order_id)
    return resources


# НОВЫЙ ЭНДПОИНТ: Массовое добавление/обновление ресурсов для заказа
# Этот эндпоинт удаляет все старые ресурсы для заказа и создает новые
@router.post("/for-order/{order_id}/bulk", response_model=List[schemas.OrderResource],
            dependencies=[Depends(get_current_user_is_department)]) # Только отдел может управлять ресурсами заказа
def bulk_create_order_resources(order_id: int,
                                data: schemas.OrderResourceListCreate, # Принимает список ресурсов
                                db: Session = Depends(get_db)):
    """
    Обновляет ресурсы для заказа: удаляет все существующие ресурсы для данного заказа
    и создает новые из предоставленного списка.
    """
    # Сначала удаляем все существующие ресурсы для этого заказа
    order_resources.delete_all_order_resources_for_order(db, order_id=order_id)

    created_resources = []
    for resource_data in data.resources:
        # Создаем новый ресурс для заказа
        new_resource = order_resources.create_order_resource(
            db=db,
            order_id=order_id,
            type_resource=resource_data.type_resource,
            resource_count=resource_data.resource_count
        )
        created_resources.append(new_resource)

    return created_resources


# Существующий эндпоинт для получения всех ресурсов (для всех заказов)
@router.get("/", response_model=List[schemas.OrderResource])
def get_all(db: Session = Depends(get_db)):
    return order_resources.get_order_resources(db)


# Эндпоинт для удаления одного ресурса по его ID (может быть защищен)
@router.delete("/{link_id}", response_model=schemas.OrderResource)
def delete_link(link_id: int, db: Session = Depends(get_db)):
    item = order_resources.delete_order_resource(db, link_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Order resource not found")
    return item