# Backend - FastAPI

Backend del template Next.js + FastAPI construido con FastAPI, SQLAlchemy y PostgreSQL.

## Stack Tecnológico

- **FastAPI 0.128** - Framework web moderno y rápido
- **Python 3.12** - Lenguaje de programación
- **SQLAlchemy 2** - ORM con soporte async
- **Alembic** - Migraciones de base de datos
- **PostgreSQL** - Base de datos relacional
- **asyncpg** - Driver PostgreSQL asíncrono
- **fastapi-users** - Sistema de autenticación completo
- **Pydantic 2** - Validación de datos y settings
- **pytest** - Framework de testing
- **UV** - Gestor de dependencias moderno
- **Ruff** - Linter y formateador ultra-rápido

## Estructura del Proyecto

```
api/
├── app/                        # Código de la aplicación
│   ├── api/                    # Endpoints de la API
│   │   ├── routes/            # Routers por recurso
│   │   │   ├── users.py       # Rutas de usuarios
│   │   │   └── ...
│   │   └── deps.py            # Dependencias compartidas
│   ├── core/                  # Configuración y utilidades
│   │   ├── config.py          # Settings de la aplicación
│   │   ├── security.py        # Utilidades de seguridad
│   │   └── ...
│   ├── db/                    # Base de datos
│   │   ├── models/            # Modelos SQLAlchemy
│   │   │   ├── base.py        # Clase base
│   │   │   ├── user.py        # Modelo de usuario
│   │   │   └── ...
│   │   ├── session.py         # Configuración de sesión
│   │   └── base.py            # Importaciones de modelos
│   ├── schemas/               # Schemas Pydantic
│   │   ├── user.py            # Schemas de usuario
│   │   └── ...
│   └── main.py                # Punto de entrada de la aplicación
├── alembic_migrations/        # Migraciones de base de datos
│   └── versions/              # Archivos de migración
├── commands/                  # Scripts de utilidad
│   ├── create_superuser.py    # Crear superusuario
│   └── ...
├── tests/                     # Tests
│   ├── conftest.py           # Configuración de pytest
│   ├── test_users.py         # Tests de usuarios
│   └── ...
├── Dockerfile                 # Configuración Docker
├── pyproject.toml            # Dependencias y configuración
├── alembic.ini               # Configuración Alembic
├── pytest.ini                # Configuración pytest
└── start.sh                  # Script de inicio
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname
TEST_DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/test_dbname

# Security
ACCESS_SECRET_KEY=your-secret-key-here
RESET_PASSWORD_SECRET_KEY=your-reset-password-secret
VERIFICATION_SECRET_KEY=your-verification-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_SECONDS=3600

# Email (opcional para desarrollo)
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_FROM=noreply@example.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

# Frontend
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

### Instalación de Dependencias

```bash
# Instalar dependencias con UV
uv sync

# Activar entorno virtual
source .venv/bin/activate  # Linux/Mac
# o
.venv\Scripts\activate     # Windows
```

## Desarrollo

### Iniciar el Backend

**Con Docker:**

```bash
# Desde la raíz del proyecto
make docker-start-api
```

**Sin Docker:**

```bash
# Desde la carpeta api/
./start.sh
```

El servidor estará disponible en:
- API: `http://localhost:8000`
- Documentación interactiva: `http://localhost:8000/docs`
- OpenAPI Schema: `http://localhost:8000/openapi.json`

### Base de Datos

#### Migraciones

**Crear una nueva migración:**

```bash
# Con Docker
make docker-db-schema migration_name="add products table"

# Sin Docker
cd api
uv run alembic revision --autogenerate -m "add products table"
```

**Aplicar migraciones:**

```bash
# Con Docker
make docker-migrate-db

# Sin Docker
cd api
uv run alembic upgrade head
```

**Revertir migración:**

```bash
cd api
uv run alembic downgrade -1
```

#### Crear Superusuario

```bash
# Con Docker
docker compose -f docker-compose-dev.yml run --rm api python -m commands.create_superuser

# Sin Docker
cd api
uv run python -m commands.create_superuser
```

## API Endpoints

### Autenticación

```
POST   /api/auth/register          # Registrar nuevo usuario
POST   /api/auth/login             # Login (obtener JWT)
POST   /api/auth/logout            # Logout
POST   /api/auth/forgot-password   # Solicitar reset de contraseña
POST   /api/auth/reset-password    # Resetear contraseña
```

### Usuarios

```
GET    /api/users/me               # Obtener usuario actual
PATCH  /api/users/me               # Actualizar usuario actual
GET    /api/users/{id}             # Obtener usuario por ID
```

## Desarrollo

### Agregar Nuevos Modelos

1. **Crear el modelo** en `app/db/models/`:

```python
from sqlalchemy import Column, String, Integer
from app.db.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Integer, nullable=False)
```

2. **Importar en** `app/db/base.py`:

```python
from app.db.models.product import Product  # noqa
```

3. **Crear schemas** en `app/schemas/`:

```python
from pydantic import BaseModel

class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: int

class ProductCreate(ProductBase):
    pass

class ProductRead(ProductBase):
    id: int

    model_config = {"from_attributes": True}
```

4. **Crear migración**:

```bash
make docker-db-schema migration_name="add products table"
make docker-migrate-db
```

### Agregar Nuevos Endpoints

1. **Crear router** en `app/api/routes/`:

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
from app.schemas.product import ProductCreate, ProductRead

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/", response_model=ProductRead)
async def create_product(
    product: ProductCreate,
    session: AsyncSession = Depends(get_async_session)
):
    # Implementación
    pass
```

2. **Registrar el router** en `app/main.py`:

```python
from app.api.routes import products

app.include_router(products.router, prefix="/api")
```

## Testing

### Ejecutar Tests

```bash
# Con Docker
make docker-test-api

# Sin Docker
cd api
uv run pytest

# Con coverage
uv run pytest --cov=app --cov-report=html
```

### Escribir Tests

Los tests se escriben con pytest y pytest-asyncio:

```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_product(client: AsyncClient):
    response = await client.post(
        "/api/products/",
        json={
            "name": "Test Product",
            "description": "Test Description",
            "price": 1000
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Product"
```

## Calidad de Código

### Linting y Formateo

```bash
# Ejecutar Ruff (linter)
uv run ruff check .

# Auto-corregir con Ruff
uv run ruff check --fix .

# Formatear código
uv run ruff format .
```

### Type Checking

```bash
# Ejecutar mypy
uv run mypy app
```

## Despliegue

### Docker

El proyecto incluye un Dockerfile multi-stage optimizado:

```bash
# Construir imagen
docker build -t fastapi-backend .

# Ejecutar contenedor
docker run -p 8000:8000 fastapi-backend
```

### Vercel

El proyecto está optimizado para despliegue serverless en Vercel:

1. Configura las variables de entorno en Vercel
2. Vercel detectará automáticamente FastAPI usando `vercel.json`

**Variables de entorno en Vercel:**

- `DATABASE_URL`: URL de PostgreSQL
- `ACCESS_SECRET_KEY`: Secret key para JWT
- `RESET_PASSWORD_SECRET_KEY`: Secret key para reset
- `VERIFICATION_SECRET_KEY`: Secret key para verificación
- `CORS_ORIGINS`: Orígenes permitidos (JSON array)
- `FRONTEND_URL`: URL del frontend

## Convenciones de Código

### Python

- Usar type hints en todas las funciones
- Seguir PEP 8 (enforced por Ruff)
- Usar async/await para operaciones I/O
- Documentar funciones complejas con docstrings

### FastAPI

- Usar dependency injection para sesiones de DB
- Definir response_model en endpoints
- Usar Pydantic para validación
- Agrupar endpoints relacionados en routers

### Base de Datos

- Usar operaciones asíncronas
- Definir índices apropiados
- Usar constraints para integridad
- Crear migraciones para todos los cambios

### Testing

- Escribir tests para todos los endpoints
- Usar fixtures para datos de prueba
- Mockear servicios externos
- Mantener coverage > 80%

## Troubleshooting

### Problemas con migraciones

```bash
# Ver estado de migraciones
uv run alembic current

# Ver historial
uv run alembic history

# Regenerar migración
uv run alembic revision --autogenerate -m "description"
```

### Errores de conexión a base de datos

```bash
# Verificar que PostgreSQL está corriendo
docker compose -f docker-compose-dev.yml ps

# Ver logs de la base de datos
docker compose -f docker-compose-dev.yml logs db
```

### Problemas con dependencias

```bash
# Limpiar e instalar
rm -rf .venv uv.lock
uv sync
```

## Recursos

- [Documentación del Proyecto](https://jonasotoaguilar.github.io/nextjs-fastapi-template/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [fastapi-users Documentation](https://fastapi-users.github.io/fastapi-users/)
