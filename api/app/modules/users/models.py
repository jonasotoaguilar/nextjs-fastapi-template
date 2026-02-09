from fastapi_users.db import SQLAlchemyBaseUserTableUUID

from app.core.base import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    pass
