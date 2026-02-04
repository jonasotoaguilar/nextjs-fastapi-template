from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy.orm import relationship
from .base import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    items = relationship("Item", back_populates="user", cascade="all, delete-orphan")
