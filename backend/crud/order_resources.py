from sqlalchemy.orm import Session

from backend.models.order_resources import OrderResource


def create_order_resource(db: Session, order_id: int, type_resource: str, resource_count: int):
    db_order_resource = OrderResource(order_id=order_id, type_resource=type_resource, resource_count=resource_count)
    db.add(db_order_resource)
    db.commit()
    db.refresh(db_order_resource)
    return db_order_resource

def get_order_resources(db: Session):
    return db.query(OrderResource).all()

def delete_order_resource(db: Session, order_resource_id: int):
    order_resource = db.query(OrderResource).filter(OrderResource.id == order_resource_id).first()
    if order_resource:
        db.delete(order_resource)
        db.commit()
    return order_resource