# Backend - FastAPI

Next.js + FastAPI template backend built with FastAPI, SQLAlchemy, and PostgreSQL.

## Tech Stack

- **FastAPI 0.128** - Modern and fast web framework
- **Python 3.12** - Programming language
- **SQLAlchemy 2** - ORM with async support
- **Alembic** - Database migrations
- **PostgreSQL** - Relational database
- **asyncpg** - Asynchronous PostgreSQL driver
- **fastapi-users** - Complete authentication system
- **Pydantic 2** - Data validation and settings
- **pytest** - Testing framework
- **UV** - Modern dependency manager
- **Ruff** - Ultra-fast linter and formatter

## Project Structure

```
api/
├── app/                        # Application code
│   ├── api/                    # API Endpoints
│   │   ├── routes/            # Routers by resource
│   │   │   ├── users.py       # User routes
│   │   │   └── ...
│   │   └── deps.py            # Shared dependencies
│   ├── core/                  # Configuration and utilities
│   │   ├── config.py          # Application settings
│   │   ├── security.py        # Security utilities
│   │   └── ...
│   ├── db/                    # Database
│   │   ├── models/            # SQLAlchemy models
│   │   │   ├── base.py        # Base class
│   │   │   ├── user.py        # User model
│   │   │   └── ...
│   │   ├── session.py         # Session configuration
│   │   └── base.py            # Model imports
│   ├── schemas/               # Pydantic schemas
│   │   ├── user.py            # User schemas
│   │   └── ...
│   └── main.py                # Application entry point
├── alembic_migrations/        # Database migrations
│   └── versions/              # Migration files
├── commands/                  # Utility scripts
│   ├── create_superuser.py    # Create superuser
│   └── ...
├── tests/                     # Tests
│   ├── conftest.py           # Pytest configuration
│   ├── test_users.py         # User tests
│   └── ...
├── Dockerfile                 # Docker configuration
├── pyproject.toml            # Dependencies and configuration
├── alembic.ini               # Alembic configuration
├── pytest.ini                # Pytest configuration
└── start.sh                  # Start script
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

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

# Email (optional for development)
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

### Dependency Installation

```bash
# Install dependencies with UV
uv sync

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate     # Windows
```

## Development

### Start the Backend

**With Docker:**

```bash
# From project root
make docker-start-api
```

**Without Docker:**

```bash
# From api/ folder
./start.sh
```

The server will be available at:

- API: `http://localhost:8000`
- Interactive Documentation: `http://localhost:8000/docs`
- OpenAPI Schema: `http://localhost:8000/openapi.json`

### Database

#### Migrations

**Create a new migration:**

```bash
# With Docker
make docker-db-schema migration_name="add products table"

# Without Docker
cd api
uv run alembic revision --autogenerate -m "add products table"
```

**Apply migrations:**

```bash
# With Docker
make docker-migrate-db

# Without Docker
cd api
uv run alembic upgrade head
```

**Revert migration:**

```bash
cd api
uv run alembic downgrade -1
```

#### Create Superuser

```bash
# With Docker
docker compose -f docker-compose-dev.yml run --rm api python -m commands.create_superuser

# Without Docker
cd api
uv run python -m commands.create_superuser
```

## API Endpoints

### Authentication

```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login (get JWT)
POST   /api/auth/logout            # Logout
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
```

### Users

```
GET    /api/users/me               # Get current user
PATCH  /api/users/me               # Update current user
GET    /api/users/{id}             # Get user by ID
```

## Development Guide

### Adding New Models

1. **Create the model** in `app/db/models/`:

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

2. **Import in** `app/db/base.py`:

```python
from app.db.models.product import Product  # noqa
```

3. **Create schemas** in `app/schemas/`:

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

4. **Create migration**:

```bash
make docker-db-schema migration_name="add products table"
make docker-migrate-db
```

### Adding New Endpoints

1. **Create router** in `app/api/routes/`:

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
    # Implementation
    pass
```

2. **Register the router** in `app/main.py`:

```python
from app.api.routes import products

app.include_router(products.router, prefix="/api")
```

## Testing

### Run Tests

```bash
# With Docker
make docker-test-api

# Without Docker
cd api
uv run pytest

# With coverage
uv run pytest --cov=app --cov-report=html
```

### Writing Tests

Tests are written with pytest and pytest-asyncio:

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

## Code Quality

### Linting and Formatting

```bash
# Run Ruff (linter)
uv run ruff check .

# Auto-fix with Ruff
uv run ruff check --fix .

# Format code
uv run ruff format .
```

### Type Checking

```bash
# Run mypy
uv run mypy app
```

## Deployment

### Docker

The project includes an optimized multi-stage Dockerfile:

```bash
# Build image
docker build -t fastapi-backend .

# Run container
docker run -p 8000:8000 fastapi-backend
```

### Vercel

The project is optimized for serverless deployment on Vercel:

1. Configure environment variables in Vercel.
2. Vercel will automatically detect FastAPI using `vercel.json`.

**Vercel Environment Variables:**

- `DATABASE_URL`: PostgreSQL URL
- `ACCESS_SECRET_KEY`: JWT secret key
- `RESET_PASSWORD_SECRET_KEY`: Reset secret key
- `VERIFICATION_SECRET_KEY`: Verification secret key
- `CORS_ORIGINS`: Allowed origins (JSON array)
- `FRONTEND_URL`: Frontend URL

## Code Conventions

### Python

- Use type hints in all functions.
- Follow PEP 8 (enforced by Ruff).
- Use async/await for I/O operations.
- Document complex functions with docstrings.

### FastAPI

- Use dependency injection for DB sessions.
- Define `response_model` in endpoints.
- Use Pydantic for validation.
- Group related endpoints in routers.

### Database

- Use asynchronous operations.
- Define appropriate indexes.
- Use constraints for integrity.
- Create migrations for all changes.

### Testing

- Write tests for all endpoints.
- Use fixtures for test data.
- Mock external services.
- Maintain coverage > 80%.

## Troubleshooting

### Migration Issues

```bash
# See migration status
uv run alembic current

# See history
uv run alembic history

# Regenerate migration
uv run alembic revision --autogenerate -m "description"
```

### Database Connection Errors

```bash
# Verify PostgreSQL is running
docker compose -f docker-compose-dev.yml ps

# View database logs
docker compose -f docker-compose-dev.yml logs db
```

### Dependency Issues

```bash
# Clean and install
rm -rf .venv uv.lock
uv sync
```

## Resources

- [Project Documentation](https://jonasotoaguilar.github.io/nextjs-fastapi-template/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [fastapi-users Documentation](https://fastapi-users.github.io/fastapi-users/)
