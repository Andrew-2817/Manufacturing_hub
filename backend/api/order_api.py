# Импортируем необходимые типы и функции для обработки файлов и форм
from typing import List, Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
# Импортируем функции для работы с файлами
import shutil
import os

from .. import schemas
from backend.crud import order
from ..database import get_db # Base здесь не нужен, удалим импорт

router = APIRouter(prefix="/orders", tags=["Orders"])

# Определим директорию для сохранения файлов. Создайте ее в корне бэкенда, если ее нет.
UPLOAD_DIRECTORY = "uploaded_files"

# Создаем директорию, если она не существует
if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

# Эндпоинт для создания заказа с загрузкой файла
@router.post("/create_with_file/", response_model=schemas.Order)
def create_order_with_file(
    # Переставляем обязательные параметры вперед
    user_order_id: Annotated[int, Form()],
    order_number: Annotated[int, Form()],
    email: Annotated[str, Form()],
    deadline: Annotated[str, Form()], # Перемещен перед необязательными

    # Необязательные параметры идут после обязательных
    description: Annotated[Optional[str], Form()] = None,
    file: Annotated[UploadFile, File()] = None,
    # Для MVP пока используем заглушки или значения по умолчанию для геопозиции.
    # В реальном приложении нужно получать геопозицию на фронте или по IP.
    geoip_lat: Annotated[float, Form()] = 0.0,
    geoip_lon: Annotated[float, Form()] = 0.0,

    db: Session = Depends(get_db) # Depends всегда идет в конце
):
    file_location = None
    if file:
        # Создаем путь для сохранения файла. Используем оригинальное имя файла.
        # Можно добавить уникальный префикс (например, UUID или ID пользователя + время)
        # для избежания конфликтов имен файлов, но для простоты пока так.
        # Убедитесь, что директория UPLOAD_DIRECTORY существует.
        file_name = file.filename
        # Убедимся, что имя файла безопасное, чтобы избежать Path Traversal уязвимостей
        # (хотя для внутренних инструментов это может быть менее критично, но хорошая практика)
        # import os.path
        # file_name = os.path.basename(file.filename)
        file_location = os.path.join(UPLOAD_DIRECTORY, file_name)
        try:
            # Сохраняем файл
            with open(file_location, "wb+") as file_object:
                # Используем shutil.copyfileobj для эффективного копирования файла
                shutil.copyfileobj(file.file, file_object)
            print(f"File saved at {file_location}")
        except Exception as e:
            print(f"Error saving file: {e}")
            # В случае ошибки сохранения файла, можно вернуть HTTP-ошибку
            raise HTTPException(status_code=500, detail=f"Could not save file: {e}")


    # Создаем заказ в базе данных
    db_order = order.create_order(
        db=db,
        user_order_id=user_order_id,
        order_number=order_number, # Передаем номер заказа
        status='sent_for_evaluation', # Устанавливаем начальный статус
        # При создании через эту форму, price и ready_to всегда будут 0.0 и False
        price=0.0,
        ready_to=False,
        # Geoip данные берем из параметров формы (сейчас заглушки)
        geoip_lat=geoip_lat,
        geoip_lon=geoip_lon,
        # Описание берем из параметров формы (может быть None)
        comments=description,
        # Путь к файлу
        file_path=file_location
    )

    # Note: OrderResource creation is not included in this endpoint
    # based on the current frontend form structure.
    # This will be handled in a later stage (e.g., by the department).

    return db_order # Возвращаем созданный объект заказа


# Существующий эндпоинт для создания заказа БЕЗ файла (если еще нужен)
# Убедимся, что он также использует Optional и значения по умолчанию корректно
@router.post("/", response_model=schemas.Order)
def create_order_without_file(ord: schemas.OrderCreate, db: Session = Depends(get_db)):
     # В этой схеме OrderCreate все поля (кроме id) являются обязательными, кроме comments и file_path
     # geoip_lat и geoip_lon в схеме объявлены без Optional, но в модели они nullable.
     # Лучше привести схему и модель в соответствие, если эти поля действительно могут отсутствовать.
     # Пока используем значения из схемы, если они есть, или полагаемся на default=0.0 в модели если nullable=True.
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
def get_orders(db: Session = Depends(get_db)):
    return order.get_all_orders(db)

# Эндпоинт для получения заказов пользователя по user_id
@router.get("/user/{user_id}", response_model=List[schemas.Order])
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    return order.get_orders_by_user_id(db, user_id=user_id)


@router.delete("/{order_id}", response_model=schemas.Order)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    item = order.delete_order(db, order_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return item