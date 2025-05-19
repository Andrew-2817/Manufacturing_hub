from sqlalchemy import Integer, String, \
    Column, Numeric, DateTime
from sqlalchemy.orm import relationship

from backend.database import Base
import datetime

class Manufacture(Base):
    __tablename__ = 'manufacture'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    geoip_lat = Column(Numeric, nullable=False)
    geoip_lon = Column(Numeric, nullable=False)
    success_orders = Column(Integer, default=0)
    failed_orders = Column(Integer, default=0)
    start_date = Column(DateTime, default=datetime.datetime.now)



    manufacture_user = relationship("ManufactureUser", back_populates="manufacture")
    manufacture_orders = relationship("ManufactureOrder", back_populates="manufacture")
    resources = relationship("Resource", back_populates="manufacture")
