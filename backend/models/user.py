from sqlalchemy import Integer, String, Column
from sqlalchemy.orm import relationship

from backend.database import Base


class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)

    order = relationship('Order', back_populates='user', cascade='all, delete-orphan')
    manufacture_user = relationship('ManufactureUser', back_populates='user')
