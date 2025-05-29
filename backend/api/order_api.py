from typing import List, Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
import shutil
import os

from .. import schemas
from backend.crud import order
from backend.crud import manufacture_order
from backend.crud import manufacture
from backend.database import get_db
from backend.auth import get_current_user_is_department, get_current_user, get_current_user_is_executor
from backend.crud import manufacture_user
from backend.selection import select_best_manufacturer

router = APIRouter(prefix="/orders", tags=["Orders"])

UPLOAD_DIRECTORY = "uploaded_files"

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)


@router.post("/create_with_file/", response_model=schemas.Order)
def create_order_with_file(
        user_order_id: Annotated[int, Form()],
        order_number: Annotated[int, Form()],
        email: Annotated[str, Form()],
        deadline: Annotated[str, Form()],

        description: Annotated[Optional[str], Form()] = None,
        file: Annotated[UploadFile, File()] = None,
        geoip_lat: Annotated[float, Form()] = 0.0,
        geoip_lon: Annotated[float, Form()] = 0.0,

        db: Session = Depends(get_db)
):
    file_location = None
    if file:
        file_name = file.filename
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
    """ Получить все заказы. """
    return order.get_all_orders(db)


@router.get("/user/{user_id}", response_model=List[schemas.Order])
def get_user_orders(user_id: int,
                    current_user: Annotated[schemas.User, Depends(get_current_user)],
                    db: Session = Depends(get_db)):
    """ Получить все заказы конкретного пользователя. """
    if current_user.id != user_id and current_user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access these orders")

    return order.get_orders_by_user_id(db, user_id=user_id)


@router.get("/department/", response_model=List[schemas.Order],
            dependencies=[Depends(get_current_user_is_department)])
def get_department_orders(
        statuses: Optional[List[str]] = Query(None),
        db: Session = Depends(get_db)
):
    """ Получить заказы для технологического отдела, с возможностью фильтрации по статусам. """
    print(f"Fetching orders with statuses: {statuses}")
    return order.get_orders_by_statuses(db=db, statuses=statuses)


@router.get("/executor/me/", response_model=List[schemas.Order],
            dependencies=[Depends(get_current_user_is_executor)])
def get_executor_orders_me(
        current_user: Annotated[schemas.User, Depends(get_current_user)],
        db: Session = Depends(get_db),
        statuses: Optional[List[str]] = Query(None)
):
    """ Получить заказы, назначенные текущему авторизованному производителю. """
    manufacture_user_link = manufacture_user.get_manufacture_user_by_user_id(db, user_id=current_user.id)

    if not manufacture_user_link:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Executor user is not linked to any manufacture")

    manufacture_id = manufacture_user_link.manufacture_id
    manufacture_orders = manufacture_order.get_manufacture_orders_by_manufacture_id(db, manufacture_id=manufacture_id)
    order_ids = [mo.order_id for mo in manufacture_orders]

    if not order_ids:
        return []

    executor_orders = order.get_orders_by_ids_and_statuses(db, order_ids=order_ids, statuses=statuses)

    return executor_orders


@router.post("/{order_id}/assign_manufacturer", response_model=schemas.ManufactureOrder)
def assign_manufacturer_to_order(
        order_id: int,
        manufacturer_id: Annotated[int, Form()],
        current_user: Annotated[schemas.User, Depends(get_current_user_is_department)],
        db: Session = Depends(get_db)
):
    """ Назначает указанного производителя для заказа. """
    existing_order = order.get_order_by_id(db, order_id)
    if not existing_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    existing_manufacturer = manufacture.get_manufacture_by_id(db, manufacturer_id)
    if not existing_manufacturer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manufacturer not found")

    existing_assignment = manufacture_order.get_manufacture_order_by_order_id(db, order_id)
    if existing_assignment:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Order already assigned to a manufacturer.")

    new_assignment = manufacture_order.create_manufacture_order(db, manufacture_id=manufacturer_id, order_id=order_id)

    return new_assignment


@router.patch("/{order_id}", response_model=schemas.Order)
def update_order_endpoint(
        order_id: int,
        updates: schemas.OrderUpdate,
        current_user: Annotated[schemas.User, Depends(get_current_user)],
        db: Session = Depends(get_db)
):
    existing_order = order.get_order_by_id(db, order_id)
    if not existing_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    requested_updates = updates.model_dump(exclude_unset=True)

    is_order_paid_for_by_user = False
    if current_user.role == 'user':
        if (existing_order.user_order_id != current_user.id or
                len(requested_updates) != 1 or
                'status' not in requested_updates or
                requested_updates['status'] != 'paid_for' or
                existing_order.status != 'evaluated' or
                existing_order.price <= 0
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="You can only pay for your own evaluated orders.")

        is_order_paid_for_by_user = True

    elif current_user.role == 'department':
        invalid_fields_for_department = set(requested_updates.keys()) - {'status', 'comments', 'price'}
        if invalid_fields_for_department:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail=f"Department cannot update fields: {', '.join(invalid_fields_for_department)}")

        if 'status' in requested_updates:
            if requested_updates['status'] in ['paid_for', 'produced', 'sent']:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                    detail="Department cannot set status to 'paid_for', 'produced', or 'sent'.")
            if requested_updates['status'] == 'reject':
                if not requested_updates.get('comments'):
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                        detail="Reason for rejection must be provided.")
            if existing_order.status in ['evaluated', 'paid_for', 'produced', 'sent', 'reject']:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                    detail="Department cannot update already evaluated, rejected or completed orders.")

    elif current_user.role == 'executor':
        manufacture_user_link = manufacture_user.get_manufacture_user_by_user_id(db, user_id=current_user.id)
        if not manufacture_user_link:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Executor user is not linked to any manufacture.")

        manufacture_orders_for_executor = manufacture_order.get_manufacture_orders_by_manufacture_id(db,
                                                                                                     manufacture_user_link.manufacture_id)
        assigned_order_ids = [mo.order_id for mo in manufacture_orders_for_executor]

        if order_id not in assigned_order_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not assigned to this order.")

        invalid_fields_for_executor = set(requested_updates.keys()) - {'status', 'comments'}
        if invalid_fields_for_executor:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail=f"Executor cannot update fields: {', '.join(invalid_fields_for_executor)}")

        if 'status' in requested_updates:
            allowed_next_statuses = {
                'paid_for': 'accepted_production',
                'accepted_production': 'produced',
                'produced': 'sent'
            }
            if requested_updates['status'] not in allowed_next_statuses.values() and requested_updates[
                'status'] != 'sent':
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid status change for executor.")

    elif current_user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update orders.")

    db_order = order.update_order(db=db, order_id=order_id, updates=requested_updates)

    if db_order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found after update attempt")

    if is_order_paid_for_by_user:
        print(f"INFO: Order {order_id} paid for by user. Triggering manufacturer selection.")
        best_manufacturer_id_or_error = select_best_manufacturer(db=db, order_id=order_id)

        if isinstance(best_manufacturer_id_or_error, int):
            try:
                existing_assignment = manufacture_order.get_manufacture_order_by_order_id(db, order_id)
                if existing_assignment:
                    print(
                        f"WARNING: Order {order_id} already assigned to manufacturer {existing_assignment.manufacture_id}. Skipping re-assignment.")
                else:
                    manufacture_order.create_manufacture_order(db, manufacture_id=best_manufacturer_id_or_error,
                                                               order_id=order_id)
                    print(
                        f"INFO: Order {order_id} successfully assigned to manufacturer {best_manufacturer_id_or_error}.")
            except Exception as e:
                print(f"ERROR: Failed to assign manufacturer {best_manufacturer_id_or_error} to order {order_id}: {e}")

        else:
            print(f"WARNING: Manufacturer selection failed for order {order_id}: {best_manufacturer_id_or_error}")

    updated_order_with_manufacturer_info = order.get_order_by_id(db, order_id)
    if not updated_order_with_manufacturer_info:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Could not retrieve updated order info.")

    return updated_order_with_manufacturer_info


@router.delete("/{order_id}", response_model=schemas.Order)
def delete_order(order_id: int,
                 current_user: Annotated[schemas.User, Depends(get_current_user)],
                 db: Session = Depends(get_db)):
    existing_order = order.get_order_by_id(db, order_id)
    if not existing_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if current_user.role != 'admin' and current_user.id != existing_order.user_order_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this order.")

    item = order.delete_order(db, order_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return item