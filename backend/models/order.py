from sqlalchemy import Integer, String, \
    Column, ForeignKey, Numeric, Boolean
from sqlalchemy.orm import relationship

from backend.database import Base

from .order_resources import OrderResource
from .manufacture_order import ManufactureOrder

class Order(Base):
    __tablename__ = 'order'
    id = Column(Integer, primary_key=True)
    user_order_id = Column(Integer, ForeignKey('user.id'))
    order_number = Column(Integer, nullable=True)
    status = Column(String, nullable=False)
    geoip_lat = Column(Numeric, nullable=False)
    geoip_lon = Column(Numeric, nullable=False)
    comments = Column(String)
    price = Column(Numeric, nullable=False)
    ready_to = Column(Boolean, nullable=False)
    file_path = Column(String, nullable=True) # Сделаем nullable

    user = relationship('User', back_populates='order')
    order_resources = relationship('OrderResource', back_populates='order', cascade='all, delete-orphan')
    manufacture_orders = relationship('ManufactureOrder', back_populates='order', cascade='all, delete-orphan')