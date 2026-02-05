# Backend - Instrucciones Específicas

Reglas y convenciones específicas para el backend FastAPI.

## Stack y Versiones

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

## Comandos

```bash
# Desarrollo
./start.sh                           # Iniciar servidor (http://localhost:8000)
uv run fastapi dev app/main.py      # Alternativa con hot reload

# Base de datos
uv run alembic revision --autogenerate -m "descripción"  # Nueva migración
uv run alembic upgrade head          # Aplicar migraciones
uv run alembic downgrade -1          # Revertir última migración
uv run alembic history               # Ver historial
uv run alembic current               # Ver versión actual

# Testing
uv run pytest                        # Ejecutar tests
uv run pytest --cov=app             # Con coverage
uv run pytest -v                     # Verbose
uv run pytest tests/test_users.py   # Test específico

# Calidad de código
uv run ruff check .                  # Linting
uv run ruff check --fix .            # Auto-fix
uv run ruff format .                 # Formateo
uv run mypy app                      # Type checking

# Utilidades
uv run python -m commands.create_superuser  # Crear superusuario
```

## Arquitectura

### Estructura de Carpetas

```
app/
├── api/                    # Endpoints de la API
│   ├── routes/            # Routers por recurso
│   │   ├── __init__.py   # Registro de routers
│   │   ├── users.py      # Rutas de usuarios
│   │   └── ...
│   └── deps.py           # Dependencias compartidas
├── core/                  # Configuración y utilidades
│   ├── config.py         # Settings (Pydantic)
│   ├── security.py       # Utilidades de seguridad
│   └── ...
├── db/                    # Base de datos
│   ├── models/           # Modelos SQLAlchemy
│   │   ├── base.py      # Clase base
│   │   ├── user.py      # Modelo de usuario
│   │   └── ...
│   ├── session.py        # Configuración de sesión
│   └── base.py           # Importaciones de modelos
├── schemas/               # Schemas Pydantic
│   ├── user.py           # Schemas de usuario
│   └── ...
└── main.py                # Punto de entrada
```

### Async/Await

**TODO debe ser asíncrono:**

```python
# ✅ BIEN: Async
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

@router.get("/users/")
async def get_users(
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(User))
    return result.scalars().all()

# ❌ MAL: Sync
@router.get("/users/")
def get_users(session: Session = Depends(get_session)):
    return session.query(User).all()
```

### Dependency Injection

**Usar Depends para dependencias:**

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
from app.models.user import User

async def get_current_user(
    session: AsyncSession = Depends(get_async_session),
    # ... auth logic
) -> User:
    # Obtener usuario actual
    return user

@router.get("/me")
async def read_users_me(
    current_user: User = Depends(get_current_user)
):
    return current_user
```

## Convenciones de Código

### Type Hints

**Obligatorios en todas las funciones:**

```python
# ✅ BIEN: Type hints completos
async def create_user(
    user_data: UserCreate,
    session: AsyncSession
) -> User:
    user = User(**user_data.model_dump())
    session.add(user)
    await session.commit()
    return user

# ❌ MAL: Sin type hints
async def create_user(user_data, session):
    user = User(**user_data.dict())
    session.add(user)
    await session.commit()
    return user
```

**Tipos complejos:**

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

### Modelos SQLAlchemy

**Usar SQLAlchemy 2.0 style:**

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

**Convenciones:**
- `__tablename__` en snake_case
- Primary key: `id` (Integer)
- Índices en columnas de búsqueda frecuente
- `nullable=False` para campos requeridos
- Defaults para valores opcionales

### Schemas Pydantic

**Estructura de schemas:**

```python
from pydantic import BaseModel, EmailStr, ConfigDict

# Base schema (campos compartidos)
class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True

# Create schema (para POST)
class UserCreate(UserBase):
    password: str

# Update schema (para PATCH)
class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = None
    is_active: bool | None = None

# Read schema (para respuestas)
class UserRead(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
```

**Convenciones:**
- `Base`: Campos compartidos
- `Create`: Campos para crear
- `Update`: Campos opcionales para actualizar
- `Read`: Campos para respuestas (incluye `id`)
- Usar `model_config = ConfigDict(from_attributes=True)` para ORM

### Routers

**Estructura de router:**

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
    Crear nuevo usuario.

    - **email**: Email único del usuario
    - **password**: Contraseña (será hasheada)
    """
    # Verificar si existe
    result = await session.execute(
        select(User).where(User.email == user.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Crear usuario
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
    """Obtener usuario por ID."""
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

**Convenciones:**
- `prefix` y `tags` en el router
- `response_model` en todos los endpoints
- `status_code` explícito cuando no es 200
- Docstrings para documentación OpenAPI
- Validar existencia antes de crear
- Usar HTTPException para errores

### Migraciones Alembic

**Crear migración:**

```bash
uv run alembic revision --autogenerate -m "add users table"
```

**Revisar migración generada:**

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

**Convenciones:**
- Revisar SIEMPRE la migración generada
- Asegurar que `downgrade()` revierte `upgrade()`
- Nombres descriptivos para migraciones
- No modificar migraciones ya aplicadas en producción

## Testing

### Estructura de Tests

```python
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.models.user import User

@pytest.mark.asyncio
async def test_create_user(client: AsyncClient):
    """Test crear usuario."""
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
    """Test obtener usuario."""
    response = await client.get(f"/api/users/{test_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email

@pytest.mark.asyncio
async def test_user_not_found(client: AsyncClient):
    """Test usuario no encontrado."""
    response = await client.get("/api/users/99999")
    assert response.status_code == 404
```

### Fixtures

**Definir en `conftest.py`:**

```python
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from app.main import app
from app.db.base import Base
from app.models.user import User

@pytest.fixture
async def client():
    """Cliente HTTP async."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

@pytest.fixture
async def test_user(session: AsyncSession) -> User:
    """Usuario de prueba."""
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
    """Test envío de email."""
    with patch('app.core.email.send_email') as mock_send:
        mock_send.return_value = AsyncMock()

        response = await client.post(
            "/api/auth/forgot-password",
            json={"email": "test@example.com"}
        )

        assert response.status_code == 200
        mock_send.assert_called_once()
```

## Configuración

### Settings (Pydantic)

**Archivo**: `app/core/config.py`

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

**Uso:**

```python
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL
```

### Environment Variables

**Archivo**: `.env`

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

## Autenticación

### fastapi-users

**Configuración en `app/core/users.py`:**

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

**Uso en endpoints:**

```python
from app.core.users import current_active_user
from app.models.user import User

@router.get("/me", response_model=UserRead)
async def read_users_me(
    user: User = Depends(current_active_user)
):
    """Obtener usuario actual."""
    return user
```

## Límites de Seguridad

### NO hacer:

- ❌ Usar sync en lugar de async
- ❌ Omitir type hints
- ❌ Modificar migraciones ya aplicadas
- ❌ Commitear `.env` con secrets
- ❌ Exponer información sensible en logs
- ❌ Usar `SELECT *` en queries
- ❌ Deshabilitar validación de Pydantic
- ❌ Hardcodear secrets en código

### SÍ hacer:

- ✅ Usar async/await para I/O
- ✅ Type hints en todas las funciones
- ✅ Validar input con Pydantic
- ✅ Usar dependency injection
- ✅ Crear migraciones para cambios de schema
- ✅ Hash de passwords (nunca plain text)
- ✅ Validar permisos en endpoints protegidos
- ✅ Tests para todos los endpoints

## Performance

### Queries Eficientes

```python
# ✅ BIEN: Select específico con join
result = await session.execute(
    select(User.id, User.email)
    .join(Post)
    .where(User.is_active == True)
    .limit(100)
)

# ❌ MAL: Select * sin límite
result = await session.execute(select(User))
users = result.scalars().all()  # Puede ser miles de registros
```

### Eager Loading

```python
from sqlalchemy.orm import selectinload

# ✅ BIEN: Eager loading
result = await session.execute(
    select(User)
    .options(selectinload(User.posts))
    .where(User.id == user_id)
)
user = result.scalar_one()

# ❌ MAL: N+1 queries
user = await session.get(User, user_id)
posts = user.posts  # Lazy loading - query adicional
```

### Índices

```python
# Agregar índices en modelos
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)  # Índice
    created_at = Column(DateTime, index=True)  # Índice para ordenamiento
```

## Troubleshooting

### Errores Comunes

**Migración no detecta cambios:**

```bash
# Verificar que el modelo está importado en app/db/base.py
from app.db.models.user import User  # noqa
```

**Error de conexión a DB:**

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Verificar que PostgreSQL está corriendo
docker compose -f docker-compose-dev.yml ps
```

**Tests fallan:**

```bash
# Usar base de datos de test
export TEST_DATABASE_URL="postgresql+asyncpg://..."
uv run pytest
```

## Referencias

- **README**: `api/README.md`
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **Alembic Docs**: https://alembic.sqlalchemy.org/
- **fastapi-users**: https://fastapi-users.github.io/
- **Pydantic Docs**: https://docs.pydantic.dev/
