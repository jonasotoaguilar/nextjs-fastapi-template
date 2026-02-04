# Extender el Template

Esta guía te muestra cómo extender el template con nuevas funcionalidades, modelos y endpoints.

## Agregar nuevos modelos de base de datos

### 1. Crear el modelo SQLAlchemy

Crea un nuevo archivo en `fastapi_backend/app/db/models/` o agrega tu modelo a un archivo existente:

```python
# fastapi_backend/app/db/models/product.py
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String)
    price = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones (ejemplo)
    # user_id = Column(Integer, ForeignKey("user.id"))
    # user = relationship("User", back_populates="products")
```

### 2. Registrar el modelo

Asegúrate de que tu modelo sea importado en `fastapi_backend/app/db/base.py`:

```python
# fastapi_backend/app/db/base.py
from app.db.base_class import Base
from app.db.models.user import User
from app.db.models.product import Product  # Agregar esta línea

__all__ = ["Base", "User", "Product"]
```

### 3. Crear schemas Pydantic

Crea schemas para validación y serialización en `fastapi_backend/app/schemas/`:

```python
# fastapi_backend/app/schemas/product.py
from pydantic import BaseModel, Field
from datetime import datetime

class ProductBase(BaseModel):
    """Schema base con campos comunes"""
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    price: int = Field(..., gt=0)

class ProductCreate(ProductBase):
    """Schema para crear un producto"""
    pass

class ProductUpdate(BaseModel):
    """Schema para actualizar un producto (todos los campos opcionales)"""
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    price: int | None = Field(None, gt=0)

class ProductRead(ProductBase):
    """Schema para leer un producto"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Permite crear desde modelos SQLAlchemy
```

### 4. Crear migración de base de datos

Genera y aplica la migración:

```bash
# Generar migración
make docker-db-schema migration_name="add products table"

# Revisar el archivo generado en fastapi_backend/alembic/versions/

# Aplicar migración
make docker-migrate-db
```

## Agregar nuevos endpoints

### 1. Crear el router

Crea un nuevo archivo en `fastapi_backend/app/api/routes/`:

```python
# fastapi_backend/app/api/routes/products.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.db.models.product import Product
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=list[ProductRead])
async def list_products(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_async_session)
):
    """Listar todos los productos"""
    result = await session.execute(
        select(Product).offset(skip).limit(limit)
    )
    products = result.scalars().all()
    return products

@router.get("/{product_id}", response_model=ProductRead)
async def get_product(
    product_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Obtener un producto por ID"""
    result = await session.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return product

@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Crear un nuevo producto"""
    product = Product(**product_in.model_dump())
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product

@router.patch("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    """Actualizar un producto existente"""
    result = await session.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Actualizar solo los campos proporcionados
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    await session.commit()
    await session.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Eliminar un producto"""
    result = await session.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    await session.delete(product)
    await session.commit()
```

### 2. Registrar el router

Agrega el router en `fastapi_backend/app/api/routes/__init__.py`:

```python
from fastapi import APIRouter
from app.api.routes import auth, users, products  # Agregar products

api_router = APIRouter()

# Incluir routers
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(products.router)  # Agregar esta línea
```

### 3. Regenerar el cliente del frontend

El hot-reload regenera automáticamente el cliente cuando detecta cambios en el schema OpenAPI. También puedes hacerlo manualmente:

```bash
# Desde el directorio raíz
cd nextjs-frontend && pnpm run generate-client
```

## Usar el cliente tipado en el frontend

### Ejemplo básico

```typescript
// app/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { client } from "@/lib/api-client";
import type { components } from "@/lib/api-types";

type Product = components["schemas"]["ProductRead"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await client.GET("/api/products/");

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }

      if (data) {
        setProducts(data);
      }

      setLoading(false);
    }

    fetchProducts();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Productos</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Crear un producto

```typescript
"use client";

import { useState } from "react";
import { client } from "@/lib/api-client";

export default function CreateProductForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await client.POST("/api/products/", {
      body: {
        name,
        price,
        description: description || undefined,
      },
    });

    if (error) {
      console.error("Error creating product:", error);
      return;
    }

    if (data) {
      console.log("Product created:", data);
      // Resetear formulario o redirigir
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del producto"
        required
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        placeholder="Precio"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
      />
      <button type="submit">Crear Producto</button>
    </form>
  );
}
```

## Agregar autenticación a endpoints

### Proteger endpoints con autenticación

```python
from fastapi import Depends
from app.db.models.user import User
from app.api.deps import current_active_user

@router.post("/", response_model=ProductRead)
async def create_product(
    product_in: ProductCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)  # Requiere usuario autenticado
):
    """Crear un producto (requiere autenticación)"""
    product = Product(**product_in.model_dump(), user_id=user.id)
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product
```

### Usar el cliente autenticado en el frontend

```typescript
import { authenticatedClient } from "@/lib/api-client";

// El cliente autenticado incluye automáticamente el token JWT
const { data, error } = await authenticatedClient.POST("/api/products/", {
  body: {
    name: "Producto nuevo",
    price: 1000,
  },
});
```

## Agregar tests

### Tests del backend

```python
# fastapi_backend/tests/api/test_products.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.product import Product

@pytest.mark.asyncio
async def test_create_product(client: AsyncClient, session: AsyncSession):
    """Test crear un producto"""
    response = await client.post(
        "/api/products/",
        json={
            "name": "Test Product",
            "price": 1000,
            "description": "Test description"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Product"
    assert data["price"] == 1000

@pytest.mark.asyncio
async def test_list_products(client: AsyncClient, session: AsyncSession):
    """Test listar productos"""
    # Crear productos de prueba
    product1 = Product(name="Product 1", price=100)
    product2 = Product(name="Product 2", price=200)
    session.add_all([product1, product2])
    await session.commit()

    response = await client.get("/api/products/")

    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
```

### Tests del frontend

```typescript
// nextjs-frontend/__tests__/products.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import ProductsPage from "@/app/products/page";
import { client } from "@/lib/api-client";

jest.mock("@/lib/api-client");

describe("ProductsPage", () => {
  it("renders products list", async () => {
    const mockProducts = [
      { id: 1, name: "Product 1", price: 100, created_at: new Date(), updated_at: new Date() },
      { id: 2, name: "Product 2", price: 200, created_at: new Date(), updated_at: new Date() },
    ];

    (client.GET as jest.Mock).mockResolvedValue({
      data: mockProducts,
      error: null,
    });

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });
  });
});
```

## Mejores prácticas

### 1. Mantén la separación de responsabilidades

- **Modelos**: Solo definición de tablas y relaciones
- **Schemas**: Validación y serialización
- **Routers**: Lógica de endpoints
- **Services** (opcional): Lógica de negocio compleja

### 2. Usa transacciones para operaciones complejas

```python
async def create_order_with_items(
    order_data: OrderCreate,
    session: AsyncSession
):
    async with session.begin():  # Transacción automática
        order = Order(**order_data.model_dump(exclude={"items"}))
        session.add(order)
        await session.flush()  # Obtener el ID sin commit

        for item_data in order_data.items:
            item = OrderItem(**item_data.model_dump(), order_id=order.id)
            session.add(item)

        # Commit automático al salir del bloque

    await session.refresh(order)
    return order
```

### 3. Maneja errores apropiadamente

```python
from fastapi import HTTPException, status

@router.get("/{product_id}")
async def get_product(product_id: int, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )

    return product
```

### 4. Documenta tus endpoints

```python
@router.post(
    "/",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo producto",
    description="Crea un nuevo producto en la base de datos con los datos proporcionados.",
    responses={
        201: {"description": "Producto creado exitosamente"},
        400: {"description": "Datos de entrada inválidos"},
        401: {"description": "No autenticado"},
    }
)
async def create_product(
    product_in: ProductCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    """
    Crear un nuevo producto.

    - **name**: Nombre del producto (requerido)
    - **price**: Precio en centavos (requerido)
    - **description**: Descripción del producto (opcional)
    """
    pass
```

## Recursos adicionales

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAPI Specification](https://swagger.io/specification/)
