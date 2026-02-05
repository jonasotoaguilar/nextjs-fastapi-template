## Next.js FastAPI Template

<p align="center">
    <em>Template Next.js + FastAPI: Stack moderno con Python y TypeScript, validación con Zod.</em>
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

**Documentación**: <a href="https://jonasotoaguilar.github.io/nextjs-fastapi-template/" target="_blank">https://jonasotoaguilar.github.io/nextjs-fastapi-template/</a>

**Código Fuente**: <a href="https://github.com/jonasotoaguilar/nextjs-fastapi-template/" target="_blank">https://github.com/jonasotoaguilar/nextjs-fastapi-template/</a>

**Template Original**: <a href="https://github.com/vintasoftware/nextjs-fastapi-template/" target="_blank">Vinta Software - Next.js FastAPI Template</a>

---

Este template proporciona una base sólida para aplicaciones web escalables y de alto rendimiento, siguiendo arquitectura limpia y mejores prácticas. Simplifica el desarrollo integrando FastAPI, Pydantic y Next.js con TypeScript y Zod, asegurando type safety de extremo a extremo y validación de schemas entre frontend y backend.

El backend FastAPI soporta operaciones completamente asíncronas, optimizando consultas a base de datos, rutas de API y ejecución de tests para mejor rendimiento. El despliegue es simple, con backend y frontend completamente desplegables en Vercel, permitiendo lanzamientos rápidos con configuración mínima.

## 🚀 Inicio Rápido

### Prerrequisitos

- **Docker** y **Docker Compose** (recomendado)
- O bien:
  - **Node.js 18+** y **pnpm 10+**
  - **Python 3.12**
  - **PostgreSQL 15+**

### Instalación Rápida con Docker

```bash
# 1. Clonar el repositorio
git clone https://github.com/jonasotoaguilar/nextjs-fastapi-template.git
cd nextjs-fastapi-template

# 2. Inicializar variables de entorno
make init-env

# 3. Construir e iniciar servicios
make docker-build
make docker-up

# 4. Aplicar migraciones
make docker-migrate-db

# 5. Abrir en el navegador
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Instalación sin Docker

```bash
# 1. Clonar el repositorio
git clone https://github.com/jonasotoaguilar/nextjs-fastapi-template.git
cd nextjs-fastapi-template

# 2. Inicializar variables de entorno
make init-env

# 3. Instalar dependencias
make install

# 4. Configurar base de datos PostgreSQL
# Editar api/.env con tu DATABASE_URL

# 5. Aplicar migraciones
cd api && uv run alembic upgrade head

# 6. Iniciar servicios (en terminales separadas)
make start-api    # Terminal 1 - Backend en :8000
make start-ui     # Terminal 2 - Frontend en :3000
```

### Características principales

✔ **Type safety de extremo a extremo** – Clientes tipados generados automáticamente desde el schema OpenAPI aseguran contratos de API sin fricción entre frontend y backend.

✔ **Actualizaciones con hot-reload** – El cliente se actualiza automáticamente cuando cambian las rutas del backend, manteniendo FastAPI y Next.js sincronizados.

✔ **Base versátil** – Diseñado para MVPs y aplicaciones production-ready, con sistema de autenticación preconfigurado y capa de API.

✔ **Despliegue rápido** – Despliega una aplicación full-stack—incluyendo flujo de autenticación—en Vercel en pocos pasos.

✔ **Autenticación lista para producción** – Incluye sistema de autenticación preconfigurado, permitiendo comenzar el desarrollo inmediatamente con funcionalidades de gestión de usuarios.

## Stack tecnológico

Este template incluye un conjunto cuidadosamente seleccionado de tecnologías para asegurar eficiencia, escalabilidad y facilidad de uso:

- **Zod + TypeScript** – Type safety y validación de schemas en todo el stack.
- **fastapi-users** – Sistema completo de autenticación con:
  - Hash seguro de contraseñas
  - Autenticación JWT
  - Recuperación de contraseña por email
- **shadcn/ui** – Componentes React preconstruidos con Tailwind CSS.
- **OpenAPI-fetch** – Generación de cliente completamente tipado desde el schema OpenAPI.
- **UV** – Gestión simplificada de dependencias y empaquetado.
- **Docker Compose** – Entornos consistentes para desarrollo y producción.
- **Pre-commit hooks** – Linting, formateo y validación automática de código antes de commits.
- **Vercel Deployment** – Backend serverless y frontend escalable, desplegable con configuración mínima.

Esta es una lista parcial de las tecnologías incluidas en el template. Para una descripción completa, visita nuestra página de [Selección de tecnologías](https://jonasotoaguilar.github.io/nextjs-fastapi-template/technology-selection/).

## Comenzar

Para usar este template, visita nuestra guía [Get Started](https://jonasotoaguilar.github.io/nextjs-fastapi-template/get-started/) y sigue los pasos.

## Estructura del proyecto

```
nextjs-fastapi-template/
├── api                      # Backend FastAPI
│   ├── app/                 # Código de la aplicación
│   │   ├── api/             # Endpoints de la API
│   │   ├── core/            # Configuración y utilidades
│   │   ├── db/              # Modelos y configuración de base de datos
│   │   └── schemas/         # Schemas Pydantic
│   ├── alembic/             # Migraciones de base de datos
│   ├── commands/            # Scripts de utilidad
│   └── tests/               # Tests del backend
├── ui/         # Frontend Next.js
│   ├── app/                 # App Router de Next.js
│   ├── components/          # Componentes React
│   ├── lib/                 # Utilidades y configuración
│   └── public/              # Assets estáticos
├── docs/                    # Documentación MkDocs
└── docker-compose.yml       # Configuración Docker
```

## 📚 Documentación Específica

Para información detallada sobre cada parte del proyecto:

- **[Frontend (UI)](./ui/README.md)** - Documentación completa del frontend Next.js
  - Estructura de componentes
  - Cliente API tipado
  - Testing con Vitest
  - Configuración y despliegue

- **[Backend (API)](./api/README.md)** - Documentación completa del backend FastAPI
  - Endpoints disponibles
  - Modelos y schemas
  - Migraciones de base de datos
  - Testing con pytest


## Extender el template

### Agregar nuevos modelos

1. **Crear el modelo en el backend** (`api/app/db/models/`):

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

2. **Crear schemas Pydantic** (`api/app/schemas/`):

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

3. **Crear migración de base de datos**:

```bash
make docker-db-schema migration_name="add products table"
make docker-migrate-db
```

### Agregar nuevos endpoints

1. **Crear router** (`api/app/api/routes/`):

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

2. **Registrar el router** (`api/app/api/routes/__init__.py`):

```python
from app.api.routes import products

# En la función que configura los routers
api_router.include_router(products.router)
```

3. **Regenerar el cliente del frontend**:

```bash
# El hot-reload lo hace automáticamente, o manualmente:
cd ui && pnpm run generate-client
```

### Usar el cliente tipado en el frontend

```typescript
import { client } from "@/lib/api-client";

// El cliente está completamente tipado
const { data, error } = await client.POST("/api/products/", {
  body: {
    name: "Producto nuevo",
    description: "Descripción",
    price: 1000,
  },
});

// TypeScript conoce la estructura de 'data' y 'error'
if (data) {
  console.log(data.id, data.name);
}
```

## Comandos útiles

El proyecto incluye un `Makefile` con comandos para simplificar tareas comunes:

```bash
make help                    # Ver todos los comandos disponibles
make docker-build           # Construir contenedores
make docker-start-api       # Iniciar api
make docker-start-ui        # Iniciar ui
make docker-migrate-db      # Aplicar migraciones
make test-api               # Ejecutar tests de la api
make test-ui                # Ejecutar tests del ui
```

## Contribuir

¿Usas este template? ¡Nos encantaría saber cómo lo estás usando!

- Únete a la conversación en [GitHub Discussions](https://github.com/jonasotoaguilar/nextjs-fastapi-template/discussions)
- Reporta bugs o sugiere mejoras vía [issues](https://github.com/jonasotoaguilar/nextjs-fastapi-template/issues)
- Consulta la guía de [Contributing](https://jonasotoaguilar.github.io/nextjs-fastapi-template/contributing/) para involucrarte

## Créditos

Este proyecto es un fork del template original creado y mantenido por [Vinta Software](https://www.vinta.com.br/). El template original es usado activamente en sistemas de producción que construyen para sus clientes.

**Template Original**: [vintasoftware/nextjs-fastapi-template](https://github.com/vintasoftware/nextjs-fastapi-template/)

_Disclaimer: Este proyecto no está afiliado con Vercel._
