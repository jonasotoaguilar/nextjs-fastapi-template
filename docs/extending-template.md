# Extending the Template

This guide shows you how to extend the template with new features, models, and endpoints.

## Adding New Database Models

### 1. Create the SQLAlchemy Model

Create a new file in `api/app/db/models/` or add your model to an existing file:

```python
# api/app/db/models/product.py
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

    # Relationships (example)
    # user_id = Column(Integer, ForeignKey("user.id"))
    # user = relationship("User", back_populates="products")
```

### 2. Register the Model

Ensure your model is imported in `api/app/db/base.py`:

```python
# api/app/db/base.py
from app.db.base_class import Base
from app.db.models.user import User
from app.db.models.product import Product  # Add this line

__all__ = ["Base", "User", "Product"]
```

### 3. Create Pydantic Schemas

Create schemas for validation and serialization in `api/app/schemas/`:

```python
# api/app/schemas/product.py
from pydantic import BaseModel, Field
from datetime import datetime

class ProductBase(BaseModel):
    """Base schema with common fields"""
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    price: int = Field(..., gt=0)

class ProductCreate(ProductBase):
    """Schema for creating a product"""
    pass

class ProductUpdate(BaseModel):
    """Schema for updating a product (all fields optional)"""
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    price: int | None = Field(None, gt=0)

class ProductRead(ProductBase):
    """Schema for reading a product"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows creation from SQLAlchemy models
```

### 4. Create Database Migration

Generate and apply the migration:

```bash
# Generate migration
make docker-db-schema migration_name="add products table"

# Review the generated file in api/alembic/versions/

# Apply migration
make docker-migrate-db
```

## Adding New Endpoints

### 1. Create the Router

Create a new file in `api/app/api/routes/`:

```python
# api/app/api/routes/products.py
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
    """List all products"""
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
    """Get a product by ID"""
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
    """Create a new product"""
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
    """Update an existing product"""
    result = await session.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Update only the fields provided
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
    """Delete a product"""
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

### 2. Register the Router

Add the router in `api/app/api/routes/__init__.py`:

```python
from fastapi import APIRouter
from app.api.routes import auth, users, products  # Add products

api_router = APIRouter()

# Include routers
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(products.router)  # Add this line
```

### 3. Regenerate the Frontend Client

Hot-reload automatically regenerates the client when it detects changes in the OpenAPI schema. You can also do it manually:

```bash
# From the root directory
cd ui && pnpm run generate-client
```

## Using the Typed Client in the Frontend

### Basic Example

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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Products</h1>
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

### Create a Product

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
      // Reset form or redirect
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product name"
        required
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        placeholder="Price"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
      />
      <button type="submit">Create Product</button>
    </form>
  );
}
```

## Adding Authentication to Endpoints

### Protecting Endpoints with Authentication

```python
from fastapi import Depends
from app.db.models.user import User
from app.api.deps import current_active_user

@router.post("/", response_model=ProductRead)
async def create_product(
    product_in: ProductCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)  # Requires authenticated user
):
    """Create a product (requires authentication)"""
    product = Product(**product_in.model_dump(), user_id=user.id)
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product
```

### Using the Authenticated Client in the Frontend

```typescript
import { authenticatedClient } from "@/lib/api-client";

// The authenticated client automatically includes the JWT token
const { data, error } = await authenticatedClient.POST("/api/products/", {
  body: {
    name: "New Product",
    price: 1000,
  },
});
```

## Adding Tests

### Backend Tests

```python
# api/tests/api/test_products.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.product import Product

@pytest.mark.asyncio
async def test_create_product(client: AsyncClient, session: AsyncSession):
    """Test creating a product"""
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
    """Test listing products"""
    # Create test products
    product1 = Product(name="Product 1", price=100)
    product2 = Product(name="Product 2", price=200)
    session.add_all([product1, product2])
    await session.commit()

    response = await client.get("/api/products/")

    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
```

### Frontend Tests

```typescript
// ui/__tests__/products.test.tsx
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

## Best Practices

### 1. Maintain Separation of Concerns

- **Models**: Only table and relationship definitions
- **Schemas**: Validation and serialization
- **Routers**: Endpoint logic
- **Services** (optional): Complex business logic

### 2. Use Transactions for Complex Operations

```python
async def create_order_with_items(
    order_data: OrderCreate,
    session: AsyncSession
):
    async with session.begin():  # Automatic transaction
        order = Order(**order_data.model_dump(exclude={"items"}))
        session.add(order)
        await session.flush()  # Get ID without commit

        for item_data in order_data.items:
            item = OrderItem(**item_data.model_dump(), order_id=order.id)
            session.add(item)

        # Automatic commit upon exiting block

    await session.refresh(order)
    return order
```

### 3. Handle Errors Appropriately

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

### 4. Document Your Endpoints

```python
@router.post(
    "/",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Creates a new product in the database with the provided data.",
    responses={
        201: {"description": "Product successfully created"},
        400: {"description": "Invalid input data"},
        401: {"description": "Not authenticated"},
    }
)
async def create_product(
    product_in: ProductCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    """
    Create a new product.

    - **name**: Product name (required)
    - **price**: Price in cents (required)
    - **description**: Product description (optional)
    """
    pass
```

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAPI Specification](https://swagger.io/specification/)
