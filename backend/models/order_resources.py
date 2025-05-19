from sqlalchemy import Integer, String, Column, ForeignKey
from sqlalchemy.orm import relationship

from backend.database import Base


class OrderResource(Base):
    __tablename__ = 'order_resources'
    id = Column(Integer, primary_key=True)
    type_resource = Column(String, nullable=False)
    resource_count = Column(Integer, nullable=False)
    order_id = Column(Integer, ForeignKey('order.id'), nullable=False)

    order = relationship('Order', back_populates="order_resources")

