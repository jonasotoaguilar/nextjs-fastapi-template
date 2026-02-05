# Frontend - Next.js

Frontend del template Next.js + FastAPI construido con Next.js 16, React 19, TypeScript y Tailwind CSS.

## Stack Tecnológico

- **Next.js 16.1.6** - Framework React con App Router
- **React 19.2.4** - Biblioteca UI con Server Components
- **TypeScript 5** - Type safety de extremo a extremo
- **Tailwind CSS 4** - Framework de utilidades CSS
- **shadcn/ui** - Componentes React preconstruidos
- **Zod 4** - Validación de schemas y type safety
- **React Hook Form 7** - Gestión de formularios
- **Vitest** - Framework de testing
- **Biome** - Linter y formateador moderno
- **OpenAPI-TS** - Generación de cliente tipado desde OpenAPI

## Estructura del Proyecto

```
ui/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   │   ├── login/         # Página de login
│   │   └── register/      # Página de registro
│   ├── (dashboard)/       # Rutas protegidas
│   │   └── profile/       # Perfil de usuario
│   ├── layout.tsx         # Layout raíz
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   └── ...               # Componentes personalizados
├── lib/                  # Utilidades y configuración
│   ├── api-client.ts     # Cliente API tipado
│   ├── clientService.ts  # Servicios del cliente
│   └── utils.ts          # Funciones de utilidad
├── public/               # Assets estáticos
├── Dockerfile            # Configuración Docker
├── next.config.mjs       # Configuración Next.js
├── tailwind.config.ts    # Configuración Tailwind
├── tsconfig.json         # Configuración TypeScript
├── biome.json            # Configuración Biome
├── vitest.config.ts      # Configuración Vitest
└── package.json          # Dependencias y scripts
```

## Scripts Disponibles

### Desarrollo

```bash
pnpm dev                  # Iniciar servidor de desarrollo (puerto 3000)
pnpm build                # Construir para producción
pnpm start                # Iniciar servidor de producción
```

### Calidad de Código

```bash
pnpm lint                 # Ejecutar linter (Biome)
pnpm lint:fix             # Ejecutar linter y auto-corregir
pnpm format               # Formatear código con Biome
pnpm check                # Ejecutar linter y formatear
pnpm tsc                  # Verificar tipos TypeScript
```

### Testing

```bash
pnpm test                 # Ejecutar tests
pnpm coverage             # Ejecutar tests con coverage
```

### Cliente API

```bash
pnpm generate-client      # Regenerar cliente API desde OpenAPI
```

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```bash
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Cliente API Tipado

El cliente API se genera automáticamente desde el schema OpenAPI del backend:

1. **Generación automática**: El watcher detecta cambios en `openapi.json` y regenera el cliente
2. **Generación manual**: Ejecuta `pnpm generate-client`

**Uso del cliente:**

```typescript
import { client } from "@/lib/api-client";

// El cliente está completamente tipado
const { data, error } = await client.POST("/api/users/", {
  body: {
    email: "user@example.com",
    password: "securepassword",
  },
});

// TypeScript conoce la estructura de 'data' y 'error'
if (data) {
  console.log(data.id, data.email);
}
```

## Desarrollo

### Iniciar el Frontend

**Con Docker:**

```bash
# Desde la raíz del proyecto
make docker-start-ui
```

**Sin Docker:**

```bash
# Desde la carpeta ui/
pnpm dev
```

El servidor estará disponible en `http://localhost:3000`.

### Hot Reload

El proyecto incluye hot reload para:

- **Código fuente**: Next.js recarga automáticamente los cambios
- **Cliente API**: El watcher regenera el cliente cuando cambia `openapi.json`

### Agregar Nuevos Componentes

**Componentes shadcn/ui:**

```bash
# Instalar componente desde shadcn/ui
npx shadcn@latest add button
```

**Componentes personalizados:**

Crea componentes en `components/` siguiendo las convenciones:

```typescript
// components/my-component.tsx
import { cn } from "@/lib/utils";

interface MyComponentProps {
  className?: string;
  // ... otras props
}

export function MyComponent({ className, ...props }: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {/* contenido */}
    </div>
  );
}
```

## Testing

### Ejecutar Tests

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar con coverage
pnpm coverage

# Ejecutar en modo watch
pnpm vitest
```

### Escribir Tests

Los tests se escriben con Vitest y React Testing Library:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MyComponent } from "./my-component";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected text")).toBeInTheDocument();
  });
});
```

## Despliegue

### Docker

El proyecto incluye un Dockerfile multi-stage optimizado:

```bash
# Construir imagen
docker build -t nextjs-frontend .

# Ejecutar contenedor
docker run -p 3000:3000 nextjs-frontend
```

### Vercel

El proyecto está optimizado para despliegue en Vercel:

1. Conecta tu repositorio en Vercel
2. Configura las variables de entorno
3. Vercel detectará automáticamente Next.js y lo desplegará

**Variables de entorno en Vercel:**

- `NEXT_PUBLIC_API_URL`: URL del backend API

## Convenciones de Código

### TypeScript

- Usar tipos explícitos para props de componentes
- Evitar `any`, usar `unknown` si es necesario
- Definir interfaces para objetos complejos

### React

- Preferir Server Components cuando sea posible
- Usar Client Components solo cuando sea necesario (`'use client'`)
- Componentes funcionales con hooks

### Estilos

- Usar Tailwind CSS para estilos
- Seguir el sistema de diseño de shadcn/ui
- Usar `cn()` para combinar clases condicionales

### Estructura de Archivos

- Componentes en `components/`
- Páginas en `app/`
- Utilidades en `lib/`
- Tipos compartidos en archivos `.types.ts`

## Troubleshooting

### El cliente API no se actualiza

```bash
# Regenerar manualmente
pnpm generate-client

# Verificar que openapi.json existe
ls -la openapi.json
```

### Errores de TypeScript

```bash
# Limpiar caché de TypeScript
rm -rf .next tsconfig.tsbuildinfo

# Verificar tipos
pnpm tsc
```

### Problemas con dependencias

```bash
# Limpiar e instalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Recursos

- [Documentación del Proyecto](https://jonasotoaguilar.github.io/nextjs-fastapi-template/)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com/)
