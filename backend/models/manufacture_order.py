from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from backend.database import Base


class ManufactureOrder(Base):
    __tablename__ = 'manufacture_order'
    id = Column(Integer, primary_key=True)
    manufacture_id = Column(Integer, ForeignKey('manufacture.id'))
    order_id = Column(Integer, ForeignKey('order.id'))

    manufacture = relationship('Manufacture', back_populates='manufacture_orders')
    order = relationship('Order', back_populates='manufacture_orders')