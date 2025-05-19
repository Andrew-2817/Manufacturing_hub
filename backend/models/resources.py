from sqlalchemy import Integer, String, Column, ForeignKey
from sqlalchemy.orm import relationship

from backend.database import Base


class Resource(Base):
    __tablename__ = 'resource'
    id = Column(Integer, primary_key=True)
    type_resource = Column(String, nullable=False)
    ready_time = Column(Integer, default=0)
    manufacture_id = Column(Integer, ForeignKey('manufacture.id'), nullable=False)

    manufacture = relationship('Manufacture', back_populates="resources")
