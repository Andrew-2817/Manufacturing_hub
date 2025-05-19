from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from backend.database import Base


class ManufactureUser(Base):
    __tablename__ = 'manufacture_user'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    manufacture_id = Column(Integer, ForeignKey('manufacture.id'))

    manufacture = relationship('Manufacture', back_populates='manufacture_user')
    user = relationship('User', back_populates='manufacture_user')