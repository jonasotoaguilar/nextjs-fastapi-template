# Backend - Specific Instructions

Specific rules and conventions for the FastAPI backend.

## Stack and Versions

- **FastAPI**: 0.128.1
- **Python**: 3.12
- **SQLAlchemy**: 2.x (async)
- **Alembic**: 1.18.3
- **PostgreSQL**: 15+ (asyncpg driver)
- **fastapi-users**: 15.0.4
- **Pydantic**: 2.x
- **pytest**: 9.0.2
- **Ruff**: 0.15.0
- **UV**: Latest

## Commands

```bash
# Development
./start.sh                           # Start server (http://localhost:8000)
uv run fastapi dev app/main.py      # Alternative with hot reload

# Database
uv run alembic revision --autogenerate -m "description"  # New migration
uv run alembic upgrade head          # Apply migrations
uv run alembic downgrade -1          # Revert last migration
uv run alembic history               # View history
uv run alembic current               # View current version

# Testing
uv run pytest                        # Run tests
uv run pytest --cov=app             # With coverage
uv run pytest -v                     # Verbose
uv run pytest tests/test_users.py   # Specific test

# Code Quality
uv run ruff check .                  # Linting
uv run ruff check --fix .            # Auto-fix
uv run ruff format .                 # Formatting
uv run mypy app                      # Type checking

# Utilities
uv run python -m commands.create_superuser  # Create superuser
```

## Architecture

### Folder Structure

```
app/
├── api/                    # API Endpoints
│   ├── routes/            # Routers by resource
│   │   ├── __init__.py   # Router registration
│   │   ├── users.py      # User routes
│   │   └── ...
│   └── deps.py           # Shared dependencies
├── core/                  # Configuration and utilities
│   ├── config.py         # Settings (Pydantic)
│   ├── security.py       # Security utilities
│   └── ...
├── db/                    # Database
│   ├── models/           # SQLAlchemy models
│   │   ├── base.py      # Base class
│   │   ├── user.py      # User model
│   │   └── ...
│   ├── session.py        # Session configuration
│   └── base.py           # Model imports
├── schemas/               # Pydantic schemas
│   ├── user.py           # User schemas
│   └── ...
└── main.py                # Entry point
```

### Async/Await

**EVERYTHING must be asynchronous:**

```python
# ✅ GOOD: Async
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

@router.get("/users/")
async def get_users(
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(User))
    return result.scalars().all()

# ❌ BAD: Sync
@router.get("/users/")
def get_users(session: Session = Depends(get_session)):
    return session.query(User).all()
```

### Dependency Injection

**Use Depends for dependencies:**

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
from app.models.user import User

async def get_current_user(
    session: AsyncSession = Depends(get_async_session),
    # ... auth logic
) -> User:
    # Get current user
    return user

@router.get("/me")
async def read_users_me(
    current_user: User = Depends(get_current_user)
):
    return current_user
```

## Code Conventions

### Type Hints

**Mandatory for all functions:**

```python
# ✅ GOOD: Full type hints
async def create_user(
    user_data: UserCreate,
    session: AsyncSession
) -> User:
    user = User(**user_data.model_dump())
    session.add(user)
    await session.commit()
    return user

# ❌ BAD: No type hints
async def create_user(user_data, session):
    user = User(**user_data.dict())
    session.add(user)
    await session.commit()
    return user
```

**Complex types:**

```python
from typing import Sequence, Optional

async def get_users(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_async_session)
) -> Sequence[User]:
    result = await session.execute(
        select(User).offset(skip).limit(limit)
    )
    return result.scalars().all()
```

### SQLAlchemy Models

**Use SQLAlchemy 2.0 style:**

```python
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    # Relationships
    posts = relationship("Post", back_populates="author")
```

**Conventions:**

- `__tablename__` in snake_case
- Primary key: `id` (Integer)
- Indexes on frequently searched columns
- `nullable=False` for required fields
- Defaults for optional values

### Pydantic Schemas

**Schema structure:**

```python
from pydantic import BaseModel, EmailStr, ConfigDict

# Base schema (shared fields)
class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True

# Create schema (for POST)
class UserCreate(UserBase):
    password: str

# Update schema (for PATCH)
class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = None
    is_active: bool | None = None

# Read schema (for responses)
class UserRead(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
```

**Conventions:**

- `Base`: Shared fields
- `Create`: Fields for creation
- `Update`: Optional fields for update
- `Read`: Response fields (includes `id`)
- Use `model_config = ConfigDict(from_attributes=True)` for ORM

### Routers

**Router structure:**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
from app.schemas.user import UserCreate, UserRead
from app.models.user import User

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    session: AsyncSession = Depends(get_async_session)
) -> User:
    """
    Create a new user.

    - **email**: Unique user email
    - **password**: Password (will be hashed)
    """
    # Check if exists
    result = await session.execute(
        select(User).where(User.email == user.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    db_user = User(
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int,
    session: AsyncSession = Depends(get_async_session)
) -> User:
    """Get user by ID."""
    result = await session.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
```

**Conventions:**

- `prefix` and `tags` in the router
- `response_model` on all endpoints
- Explicit `status_code` when not 200
- Docstrings for OpenAPI documentation
- Validate existence before creating
- Use HTTPException for errors

### Alembic Migrations

**Create migration:**

```bash
uv run alembic revision --autogenerate -m "add users table"
```

**Review generated migration:**

```python
# alembic_migrations/versions/xxx_add_users_table.py

def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

def downgrade() -> None:
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
```

**Conventions:**

- ALWAYS review the generated migration
- Ensure `downgrade()` reverses `upgrade()`
- Descriptive names for migrations
- Do not modify migrations already applied in production

## Testing

### Test Structure

```python
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.models.user import User

@pytest.mark.asyncio
async def test_create_user(client: AsyncClient):
    """Test creating a user."""
    response = await client.post(
        "/api/users/",
        json={
            "email": "test@example.com",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

@pytest.mark.asyncio
async def test_get_user(client: AsyncClient, test_user: User):
    """Test getting a user."""
    response = await client.get(f"/api/users/{test_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email

@pytest.mark.asyncio
async def test_user_not_found(client: AsyncClient):
    """Test user not found."""
    response = await client.get("/api/users/99999")
    assert response.status_code == 404
```

### Fixtures

**Define in `conftest.py`:**

```python
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from app.main import app
from app.db.base import Base
from app.models.user import User

@pytest.fixture
async def client():
    """Async HTTP client."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

@pytest.fixture
async def test_user(session: AsyncSession) -> User:
    """Test user."""
    user = User(
        email="test@example.com",
        hashed_password="hashed_password"
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user
```

### Mocking

```python
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_send_email(client: AsyncClient):
    """Test sending an email."""
    with patch('app.core.email.send_email') as mock_send:
        mock_send.return_value = AsyncMock()

        response = await client.post(
            "/api/auth/forgot-password",
            json={"email": "test@example.com"}
        )

        assert response.status_code == 200
        mock_send.assert_called_once()
```

## Configuration

### Settings (Pydantic)

**File**: `app/core/config.py`

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    TEST_DATABASE_URL: str | None = None

    # Security
    ACCESS_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 3600

    # Email
    MAIL_USERNAME: str | None = None
    MAIL_PASSWORD: str | None = None
    MAIL_FROM: str | None = None

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    # CORS
    CORS_ORIGINS: list[str]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
```

**Usage:**

```python
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL
```

### Environment Variables

**File**: `.env`

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db
TEST_DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/test_db

# Security
ACCESS_SECRET_KEY=your-secret-key-here
RESET_PASSWORD_SECRET_KEY=your-reset-secret
VERIFICATION_SECRET_KEY=your-verification-secret

# Email
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-password
MAIL_FROM=noreply@example.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

# Frontend
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

## Authentication

### fastapi-users

**Configuration in `app/core/users.py`:**

```python
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)

bearer_transport = BearerTransport(tokenUrl="auth/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=settings.ACCESS_SECRET_KEY,
        lifetime_seconds=settings.ACCESS_TOKEN_EXPIRE_SECONDS,
    )

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
    )

fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
)

current_active_user = fastapi_users.current_user(active=True)
```

**Endpoint usage:**

```python
from app.core.users import current_active_user
from app.models.user import User

@router.get("/me", response_model=UserRead)
async def read_users_me(
    user: User = Depends(current_active_user)
):
    """Get current user."""
    return user
```

## Security Limits

### DO NOT:

- ❌ Use sync instead of async
- ❌ Omit type hints
- ❌ Modify already applied migrations
- ❌ Commit `.env` with secrets
- ❌ Expose sensitive information in logs
- ❌ Use `SELECT *` in queries
- ❌ Disable Pydantic validation
- ❌ Hardcode secrets in code

### DO:

- ✅ Use async/await for I/O
- ✅ Type hints in all functions
- ✅ Validate input with Pydantic
- ✅ Use dependency injection
- ✅ Create migrations for schema changes
- ✅ Hash passwords (never plain text)
- ✅ Validate permissions in protected endpoints
- ✅ Tests for all endpoints

## Performance

### Efficient Queries

```python
# ✅ GOOD: Specific select with join
result = await session.execute(
    select(User.id, User.email)
    .join(Post)
    .where(User.is_active == True)
    .limit(100)
)

# ❌ BAD: Select * without limit
result = await session.execute(select(User))
users = result.scalars().all()  # Could be thousands of records
```

### Eager Loading

```python
from sqlalchemy.orm import selectinload

# ✅ GOOD: Eager loading
result = await session.execute(
    select(User)
    .options(selectinload(User.posts))
    .where(User.id == user_id)
)
user = result.scalar_one()

# ❌ BAD: N+1 queries
user = await session.get(User, user_id)
posts = user.posts  # Lazy loading - additional query
```

### Indexes

```python
# Add indexes in models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)  # Index
    created_at = Column(DateTime, index=True)  # Index for ordering
```

## Troubleshooting

### Common Errors

**Migration doesn't detect changes:**

```bash
# Verify the model is imported in app/db/base.py
from app.db.models.user import User  # noqa
```

**DB connection error:**

```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Verify PostgreSQL is running
docker compose -f docker-compose-dev.yml ps
```

**Tests fail:**

```bash
# Use test database
export TEST_DATABASE_URL="postgresql+asyncpg://..."
uv run pytest
```

## References

- **README**: `api/README.md`
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **Alembic Docs**: https://alembic.sqlalchemy.org/
- **fastapi-users**: https://fastapi-users.github.io/
- **Pydantic Docs**: https://docs.pydantic.dev/
