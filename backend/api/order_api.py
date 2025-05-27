from typing import List, Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
import shutil
import os

from .. import schemas
from backend.crud import order
from ..database import get_db
# Импортируем зависимости аутентификации
from backend.auth import get_current_user_is_department, get_current_user, get_current_user_is_executor
# Импортируем обновленные CRUD manufacture_user и manufacture_order
from backend.crud import manufacture_user
from backend.crud import manufacture_order


router = APIRouter(prefix="/orders", tags=["Orders"])

UPLOAD_DIRECTORY = "uploaded_files"

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

# Эндпоинт для создания заказа с загрузкой файла (доступен без аутентификации)
@router.post("/create_with_file/", response_model=schemas.Order)
def create_order_with_file(
    user_order_id: Annotated[int, Form()],
    order_number: Annotated[int, Form()],
    email: Annotated[str, Form()],
    deadline: Annotated[str, Form()],

    description: Annotated[Optional[str], Form()] = None,
    file: Annotated[UploadFile, File()] = None,
    geoip_lat: Annotated[float, Form()] = 0.0, # Заглушка (нужно получать на фронте)
    geoip_lon: Annotated[float, Form()] = 0.0, # Заглушка (нужно получать на фронте)

    db: Session = Depends(get_db)
):
    file_location = None
    if file:
        file_name = file.filename
        # Рекомендуется сделать имя файла более уникальным, чтобы избежать перезаписи
        # Например: f"{uuid.uuid4()}_{file_name}" или f"{user_order_id}_{order_number}_{file_name}"
        # import uuid
        # unique_file_name = f"{uuid.uuid4()}_{file_name}"
        # file_location = os.path.join(UPLOAD_DIRECTORY, unique_file_name)
        # Пока оставим как есть для простоты
        file_location = os.path.join(UPLOAD_DIRECTORY, file_name)

        try:
            with open(file_location, "wb+") as file_object:
                shutil.copyfileobj(file.file, file_object)
            print(f"File saved at {file_location}")
        except Exception as e:
            print(f"Error saving file: {e}")
            raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    db_order = order.create_order(
        db=db,
        user_order_id=user_order_id,
        order_number=order_number,
        status='sent_for_evaluation',
        price=0.0,
        ready_to=False,
        geoip_lat=geoip_lat,
        geoip_lon=geoip_lon,
        comments=description,
        file_path=file_location
    )

    return db_order

# Эндпоинт для создания заказа БЕЗ файла (если еще нужен)
@router.post("/", response_model=schemas.Order)
def create_order_without_file(ord: schemas.OrderCreate, db: Session = Depends(get_db)):
    return order.create_order(db,
                              user_order_id=ord.user_order_id,
                              order_number=ord.order_number,
                              status=ord.status,
                              geoip_lat=ord.geoip_lat,
                              geoip_lon=ord.geoip_lon,
                              comments=ord.comments,
                              price=ord.price,
                              ready_to=ord.ready_to,
                              file_path=ord.file_path)


@router.get("/", response_model=List[schemas.Order])
def get_all_orders(db: Session = Depends(get_db)):
    """ Получить все заказы. Может быть доступен только админам в будущем. """
    # Добавить зависимость get_current_user_is_admin здесь в будущем
    return order.get_all_orders(db)

# Эндпоинт для получения заказов пользователя по user_id (защищен!)
@router.get("/user/{user_id}", response_model=List[schemas.Order])
def get_user_orders(user_id: int,
                    current_user: Annotated[schemas.User, Depends(get_current_user)], # Зависимость аутентификации
                    db: Session = Depends(get_db)):
    """ Получить все заказы конкретного пользователя. """
    # Проверка, что запрашиваются заказы текущего пользователя или пользователь - админ
    if current_user.id != user_id and current_user.role != 'admin':
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access these orders")

    return order.get_orders_by_user_id(db, user_id=user_id)

# Эндпоинт для получения заказов для отдела/роли с фильтрацией по статусам (защищен!)
@router.get("/department/", response_model=List[schemas.Order],
            dependencies=[Depends(get_current_user_is_department)]) # Зависимость проверяет роль
def get_department_orders(
    statuses: Optional[List[str]] = Query(None), # Обычный параметр с дефолтом
    db: Session = Depends(get_db) # Зависимость (перемещена в конец)
):
    """ Получить заказы для технологического отдела, с возможностью фильтрации по статусам. """
    # Зависимость get_current_user_is_department уже проверила роль. current_user доступен через Depends в dependencies.
    print(f"Fetching orders with statuses: {statuses}")
    return order.get_orders_by_statuses(db=db, statuses=statuses)


# НОВЫЙ ЭНДПОИНТ для получения заказов для производителя (защищен!)
@router.get("/executor/me/", response_model=List[schemas.Order],
            dependencies=[Depends(get_current_user_is_executor)]) # Зависимость проверяет роль
def get_executor_orders_me(
     # ПЕРЕСТАВЛЕНО: Параметр current_user без явного дефолта идет первым синтаксически
     current_user: Annotated[schemas.User, Depends(get_current_user)],

     # Затем параметры с дефолтами
     db: Session = Depends(get_db), # Зависимость с дефолтом
     statuses: Optional[List[str]] = Query(None) # Обычный параметр с дефолтом Query

):
    """ Получить заказы, назначенные текущему авторизованному производителю. """
    # Используем новую CRUD функцию для поиска связи пользователя-производителя
    manufacture_user_link = manufacture_user.get_manufacture_user_by_user_id(db, user_id=current_user.id)

    if not manufacture_user_link:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Executor user is not linked to any manufacture")

    manufacture_id = manufacture_user_link.manufacture_id

    # Используем новую CRUD функцию для получения manufacture_order записей
    manufacture_orders = manufacture_order.get_manufacture_orders_by_manufacture_id(db, manufacture_id=manufacture_id)

    order_ids = [mo.order_id for mo in manufacture_orders]

    if not order_ids:
         return [] # Return empty list if no orders assigned

    # Получаем объекты заказов по их ID, опционально фильтруя по статусам
    executor_orders = order.get_orders_by_ids_and_statuses(db, order_ids=order_ids, statuses=statuses)

    return executor_orders


# Эндпоинт для частичного обновления заказа по ID (защищен!)
@router.patch("/{order_id}", response_model=schemas.Order)
def update_order_endpoint(
    order_id: int,
    updates: schemas.OrderUpdate, # Принимает схему OrderUpdate для частичного обновления
    current_user: Annotated[schemas.User, Depends(get_current_user)], # Зависимость аутентификации
    db: Session = Depends(get_db)
):
    """ Частично обновить заказ по ID. """
    # Добавить более детальную проверку прав доступа:
    # - Отдел может менять статус до 'evaluated', comments, price.
    # - Производитель может менять статус с 'paid_for' до 'sent', price (редко?), comments.
    # - Обычный пользователь не может обновлять через этот эндпоинт (кроме, возможно, отмены?)
    # - Админ может менять все.

    # Простая проверка: разрешаем обновление, если пользователь - отдел, производитель или админ
    if current_user.role not in ['department', 'executor', 'admin']:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update orders")

    # Получаем текущий заказ, чтобы проверить его статус и роль пользователя
    existing_order = order.get_order_by_id(db, order_id)
    if not existing_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Добавить более гранулярную проверку прав на основе роли current_user и статуса existing_order.status
    # Например:
    # if current_user.role == 'department' and existing_order.status not in ['sent_for_evaluation', 'accepted_evaluation']:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Department can only update orders in evaluation stages")
    # if current_user.role == 'executor' and existing_order.status not in ['paid_for', 'accepted_production', 'produced']:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Executor can only update orders in production stages")
    # и т.д.

    # Обновляем заказ, используя model_dump для получения только заданных полей из схемы обновления
    # exclude_unset=True гарантирует, что будут обновлены только те поля, которые были явно переданы в запросе
    # (те, что пользователь реально изменил в форме или через логику фронтенда)
    # Предполагаем Pydantic v2 (model_dump). Если Pydantic v1, использовать updates.dict(exclude_unset=True)
    db_order = order.update_order(db=db, order_id=order_id, updates=updates.model_dump(exclude_unset=True))

    if db_order is None:
        # Это маловероятно, если get_order_by_id прошел успешно, но на всякий случай
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found after update attempt")

    return db_order


@router.delete("/{order_id}", response_model=schemas.Order)
def delete_order(order_id: int,
                 current_user: Annotated[schemas.User, Depends(get_current_user)], # Защищен!
                 db: Session = Depends(get_db)):
    """ Удалить заказ по ID. Может быть доступен только админам или пользователю своего заказа? """
    # Добавить проверку прав: например, только админ или пользователь, который создал заказ
    # Чтобы проверить, кто создал заказ, нужно получить сам объект заказа:
    # existing_order = order.get_order_by_id(db, order_id)
    # if not existing_order:
    #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    # if current_user.role != 'admin' and current_user.id != existing_order.user_order_id:
    #      raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this order")

    if current_user.role != 'admin': # Пока разрешаем удаление только админам
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete orders")


    item = order.delete_order(db, order_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return item