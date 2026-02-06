## Next.js FastAPI Template

<p align="center">
    <em>Next.js + FastAPI Template: Modern stack with Python and TypeScript, validation with Zod.</em>
</p>
<p align="center">
<a href="https://coveralls.io/github/jonasotoaguilar/nextjs-fastapi-template?branch=main" target="_blank">
    <img src="https://coveralls.io/repos/github/jonasotoaguilar/nextjs-fastapi-template/badge.svg?branch=main" alt="Coverage Status">
</a>
<a href="https://github.com/jonasotoaguilar/nextjs-fastapi-template/blob/main/LICENSE.txt" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
</a>
<a href="https://github.com/jonasotoaguilar/nextjs-fastapi-template" target="_blank">
    <img src="https://img.shields.io/github/stars/jonasotoaguilar/nextjs-fastapi-template?style=social" alt="GitHub stars">
</a>
</p>

---

**Documentation**: <a href="https://jonasotoaguilar.github.io/nextjs-fastapi-template/" target="_blank">https://jonasotoaguilar.github.io/nextjs-fastapi-template/</a>

**Source Code**: <a href="https://github.com/jonasotoaguilar/nextjs-fastapi-template/" target="_blank">https://github.com/jonasotoaguilar/nextjs-fastapi-template/</a>

**Original Template**: <a href="https://github.com/vintasoftware/nextjs-fastapi-template/" target="_blank">Vinta Software - Next.js FastAPI Template</a>

---

This template provides a solid foundation for scalable and high-performance web applications, following clean architecture and best practices. It simplifies development by integrating FastAPI, Pydantic, and Next.js with TypeScript and Zod, ensuring end-to-end type safety and schema validation between frontend and backend.

The FastAPI backend supports fully asynchronous operations, optimizing database queries, API routes, and test execution for better performance. Deployment is simple, with both backend and frontend fully deployable on Vercel, allowing for quick launches with minimal configuration.

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** (recommended)
- Or:
  - **Node.js 18+** and **pnpm 10+**
  - **Python 3.12**
  - **PostgreSQL 15+**

### Quick Installation with Docker

```bash
# 1. Clone the repository
git clone https://github.com/jonasotoaguilar/nextjs-fastapi-template.git
cd nextjs-fastapi-template

# 2. Initialize environment variables
make init-env

# 3. Build and start services
make docker-build
make docker-up

# 4. Apply migrations
make docker-migrate-db

# 5. Open in browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Installation without Docker

```bash
# 1. Clone the repository
git clone https://github.com/jonasotoaguilar/nextjs-fastapi-template.git
cd nextjs-fastapi-template

# 2. Initialize environment variables
make init-env

# 3. Install dependencies
make install

# 4. Configure PostgreSQL database
# Edit api/.env with your DATABASE_URL

# 5. Apply migrations
cd api && uv run alembic upgrade head

# 6. Start services (in separate terminals)
make start-api    # Terminal 1 - Backend on :8000
make start-ui     # Terminal 2 - Frontend on :3000
```

### Key Features

✔ **End-to-end type safety** – Typed clients automatically generated from the OpenAPI schema ensure frictionless API contracts between frontend and backend.

✔ **Hot-reload updates** – The client updates automatically when backend routes change, keeping FastAPI and Next.js synchronized.

✔ **Versatile foundation** – Designed for MVPs and production-ready applications, with a pre-configured authentication system and API layer.

✔ **Quick deployment** – Deploy a full-stack application—including authentication flow—on Vercel in a few steps.

✔ **Production-ready authentication** – Includes a pre-configured authentication system, allowing you to start development immediately with user management features.

## Tech Stack

This template includes a carefully selected set of technologies to ensure efficiency, scalability, and ease of use:

- **Zod + TypeScript** – Type safety and schema validation across the stack.
- **fastapi-users** – Complete authentication system with:
  - Secure password hashing
  - JWT authentication
  - Password recovery via email
- **shadcn/ui** – Pre-built React components with Tailwind CSS.
- **OpenAPI-fetch** – Fully typed client generation from the OpenAPI schema.
- **UV** – Simplified dependency management and packaging.
- **Docker Compose** – Consistent environments for development and production.
- **Pre-commit hooks** – Automatic linting, formatting, and code validation before commits.
- **Vercel Deployment** – Serverless backend and scalable frontend, deployable with minimal configuration.

This is a partial list of technologies included in the template. For a full description, visit our [Technology Selection](https://jonasotoaguilar.github.io/nextjs-fastapi-template/technology-selection/) page.

## Getting Started

To use this template, visit our [Get Started](https://jonasotoaguilar.github.io/nextjs-fastapi-template/get-started/) guide and follow the steps.

## Project Structure

```
nextjs-fastapi-template/
├── api                      # FastAPI Backend
│   ├── app/                 # Application code
│   │   ├── api/             # API Endpoints
│   │   ├── core/            # Configuration and utilities
│   │   ├── db/              # Models and database configuration
│   │   └── schemas/         # Pydantic schemas
│   ├── alembic/             # Database migrations
│   ├── commands/            # Utility scripts
│   └── tests/               # Backend tests
├── ui/         # Next.js Frontend
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                 # Utilities and configuration
│   └── public/              # Static assets
├── docs/                    # MkDocs Documentation
└── docker-compose.yml       # Docker configuration
```

## 📚 Specific Documentation

For detailed information about each part of the project:

- **[Frontend (UI)](./ui/README.md)** - Full Next.js frontend documentation
  - Component structure
  - Typed API client
  - Testing with Vitest
  - Configuration and deployment

- **[Backend (API)](./api/README.md)** - Full FastAPI backend documentation
  - Available endpoints
  - Models and schemas
  - Database migrations
  - Testing with pytest

## Extending the template

### Adding new models

1. **Create the model in the backend** (`api/app/db/models/`):

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

2. **Create Pydantic schemas** (`api/app/schemas/`):

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

    class Config:
        from_attributes = True
```

3. **Create database migration**:

```bash
make docker-db-schema migration_name="add products table"
make docker-migrate-db
```

### Adding new endpoints

1. **Create router** (`api/app/api/routes/`):

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

2. **Register the router** (`api/app/api/routes/__init__.py`):

```python
from app.api.routes import products

# In the function that configures routers
api_router.include_router(products.router)
```

3. **Regenerate frontend client**:

```bash
# Hot-reload does it automatically, or manually:
cd ui && pnpm run generate-client
```

### Using the typed client in the frontend

```typescript
import { client } from "@/lib/api-client";

// The client is fully typed
const { data, error } = await client.POST("/api/products/", {
  body: {
    name: "New Product",
    description: "Description",
    price: 1000,
  },
});

// TypeScript knows the structure of 'data' and 'error'
if (data) {
  console.log(data.id, data.name);
}
```

## Useful Commands

The project includes a `Makefile` with commands to simplify common tasks:

```bash
make help                    # See all available commands
make docker-build           # Build containers
make docker-start-api       # Start api
make docker-start-ui        # Start ui
make docker-migrate-db      # Apply migrations
make test-api               # Run api tests
make test-ui                # Run ui tests
```

## Contributing

Are you using this template? We'd love to hear how you're using it!

- Join the conversation on [GitHub Discussions](https://github.com/jonasotoaguilar/nextjs-fastapi-template/discussions)
- Report bugs or suggest improvements via [issues](https://github.com/jonasotoaguilar/nextjs-fastapi-template/issues)
- Check the [Contributing](https://jonasotoaguilar.github.io/nextjs-fastapi-template/contributing/) guide to get involved

## Credits

This project is a fork of the original template created and maintained by [Vinta Software](https://www.vinta.com.br/). The original template is actively used in production systems they build for their clients.

**Original Template**: [vintasoftware/nextjs-fastapi-template](https://github.com/vintasoftware/nextjs-fastapi-template/)

_Disclaimer: This project is not affiliated with Vercel._
