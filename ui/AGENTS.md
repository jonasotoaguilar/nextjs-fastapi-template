# Frontend - Instrucciones Específicas

Reglas y convenciones específicas para el frontend Next.js.

## Stack y Versiones

- **Next.js**: 16.1.6 (App Router)
- **React**: 19.2.4
- **TypeScript**: 5.x
- **Tailwind CSS**: 4.1.18
- **Zod**: 4.3.6
- **React Hook Form**: 7.71.1
- **Vitest**: 4.0.18
- **Biome**: 2.3.14
- **pnpm**: 10.7.1

## Comandos

```bash
pnpm dev                  # Desarrollo (http://localhost:3000)
pnpm build                # Build producción
pnpm start                # Servidor producción
pnpm lint                 # Linter (Biome)
pnpm lint:fix             # Auto-fix linting
pnpm format               # Formatear código
pnpm check                # Lint + format
pnpm tsc                  # Type checking
pnpm test                 # Tests
pnpm coverage             # Tests con coverage
pnpm generate-client      # Regenerar cliente API
```

## Arquitectura

### App Router (Next.js 16)

Estructura de rutas:

```
app/
├── (auth)/              # Grupo de rutas de autenticación
│   ├── login/          # /login
│   └── register/       # /register
├── (dashboard)/        # Grupo de rutas protegidas
│   └── profile/        # /profile
├── layout.tsx          # Layout raíz
└── page.tsx            # Página principal (/)
```

**Convenciones:**
- Carpetas entre paréntesis `(name)` son grupos de rutas (no afectan URL)
- `layout.tsx` define layouts compartidos
- `page.tsx` define páginas
- `loading.tsx` para estados de carga
- `error.tsx` para manejo de errores

### Server vs Client Components

**Por defecto: Server Components**

```typescript
// Server Component (por defecto)
export default function ServerPage() {
  // Se ejecuta en el servidor
  return <div>Server Component</div>;
}
```

**Client Components solo cuando sea necesario:**

```typescript
'use client'; // Directiva obligatoria

import { useState } from 'react';

export function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Usar Client Components para:**
- Hooks de React (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Componentes de terceros que usan hooks

### Cliente API Tipado

**Ubicación**: `lib/openapi-client/` (generado automáticamente)

**NO EDITAR** archivos en `lib/openapi-client/` - se regeneran automáticamente.

**Uso:**

```typescript
import { client } from '@/lib/api-client';

// GET request
const { data, error } = await client.GET('/api/users/me');

// POST request
const { data, error } = await client.POST('/api/users/', {
  body: {
    email: 'user@example.com',
    password: 'securepass',
  },
});

// TypeScript conoce los tipos automáticamente
if (data) {
  console.log(data.id, data.email); // ✅ Tipado
}
```

## Convenciones de Código

### TypeScript

**Type Safety estricto:**

```typescript
// ✅ BIEN: Props tipadas explícitamente
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌ MAL: Props sin tipar
export function Button({ label, onClick, variant }) {
  return <button onClick={onClick}>{label}</button>;
}
```

**Evitar `any`:**

```typescript
// ❌ MAL
function processData(data: any) {
  return data.value;
}

// ✅ BIEN
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return data.value;
  }
  throw new Error('Invalid data');
}
```

### React Components

**Componentes funcionales:**

```typescript
// ✅ BIEN: Componente funcional
export function MyComponent({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

// ❌ MAL: Componente de clase
export class MyComponent extends React.Component {
  render() {
    return <h1>{this.props.title}</h1>;
  }
}
```

**Hooks:**

```typescript
'use client';

import { useState, useEffect } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Cleanup function
    return () => {
      // Limpiar efectos
    };
  }, [count]);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Estilos con Tailwind

**Usar Tailwind CSS:**

```typescript
// ✅ BIEN: Tailwind classes
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      {children}
    </div>
  );
}

// ❌ MAL: Inline styles
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: '8px', padding: '24px' }}>
      {children}
    </div>
  );
}
```

**Clases condicionales con `cn()`:**

```typescript
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function Button({ variant = 'primary', className }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded px-4 py-2',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-900',
        className
      )}
    >
      Click me
    </button>
  );
}
```

### Formularios

**React Hook Form + Zod:**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Enviar datos
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

### Componentes shadcn/ui

**Instalación:**

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
```

**Uso:**

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

**Personalización:**

Los componentes shadcn/ui se copian a `components/ui/` y pueden editarse.

## Testing

### Vitest + React Testing Library

**Estructura de tests:**

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const { user } = render(<MyComponent />);
    const button = screen.getByRole('button');
    await user.click(button);
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

**Mocking:**

```typescript
import { vi } from 'vitest';

// Mock de función
const mockFn = vi.fn();

// Mock de módulo
vi.mock('@/lib/api-client', () => ({
  client: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));
```

## Estructura de Archivos

### Organización

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── layout.tsx
└── page.tsx

components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── forms/                 # Formularios custom
│   └── login-form.tsx
└── layout/                # Componentes de layout
    ├── header.tsx
    └── footer.tsx

lib/
├── api-client.ts          # Cliente API wrapper
├── clientService.ts       # Servicios del cliente
├── utils.ts               # Utilidades
└── openapi-client/        # Cliente generado (NO EDITAR)
```

### Naming Conventions

- **Componentes**: PascalCase (`MyComponent.tsx`)
- **Utilidades**: camelCase (`utils.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`const API_URL = '...'`)
- **Types/Interfaces**: PascalCase (`interface UserProps {}`)

## Configuración

### Environment Variables

**Archivo**: `.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Uso:**

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**Reglas:**
- Variables públicas: Prefijo `NEXT_PUBLIC_`
- Variables privadas: Sin prefijo (solo server-side)
- Nunca commitear `.env.local`

### next.config.mjs

Configuración de Next.js:

```javascript
const nextConfig = {
  output: 'standalone',  // Para Docker
  // ... otras opciones
};
```

### tailwind.config.ts

Configuración de Tailwind:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Personalizaciones
    },
  },
  plugins: [],
};

export default config;
```

## Límites de Seguridad

### NO hacer:

- ❌ Editar archivos en `lib/openapi-client/` (generados automáticamente)
- ❌ Usar `any` en TypeScript
- ❌ Deshabilitar ESLint/Biome rules sin justificación
- ❌ Commitear `.env.local` o secrets
- ❌ Usar `dangerouslySetInnerHTML` sin sanitización
- ❌ Fetch directo a APIs externas desde Client Components (usar Server Actions)

### SÍ hacer:

- ✅ Usar el cliente API tipado (`@/lib/api-client`)
- ✅ Validar formularios con Zod
- ✅ Usar Server Components por defecto
- ✅ Type safety estricto
- ✅ Tests para componentes críticos
- ✅ Seguir convenciones de shadcn/ui

## Performance

### Optimizaciones

**Imágenes:**

```typescript
import Image from 'next/image';

// ✅ BIEN: Next.js Image
<Image
  src="/photo.jpg"
  alt="Description"
  width={500}
  height={300}
  priority  // Para above-the-fold images
/>

// ❌ MAL: img tag
<img src="/photo.jpg" alt="Description" />
```

**Fuentes:**

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

**Lazy Loading:**

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <p>Loading...</p>,
});
```

## Referencias

- **README**: `ui/README.md`
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev/
- **Tailwind Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/
