# Frontend - Specific Instructions

Specific rules and conventions for the Next.js frontend.

## Stack and Versions

- **Next.js**: 16.1.6 (App Router)
- **React**: 19.2.4
- **TypeScript**: 5.x
- **Tailwind CSS**: 4.1.18
- **Zod**: 4.3.6
- **React Hook Form**: 7.71.1
- **Vitest**: 4.0.18
- **Biome**: 2.3.14
- **pnpm**: 10.7.1

## Commands

```bash
pnpm dev                  # Development (http://localhost:3000)
pnpm build                # Production build
pnpm start                # Production server
pnpm lint                 # Linter (Biome)
pnpm lint:fix             # Auto-fix linting
pnpm format               # Format code
pnpm check                # Lint + format
pnpm tsc                  # Type checking
pnpm test                 # Tests
pnpm coverage             # Tests with coverage
pnpm generate-client      # Regenerate API client
```

## Architecture

### App Router (Next.js 16)

Route structure:

```
app/
├── (auth)/              # Authentication route group
│   ├── login/          # /login
│   └── register/       # /register
├── (dashboard)/        # Protected route group
│   └── profile/        # /profile
├── layout.tsx          # Root layout
└── page.tsx            # Home page (/)
```

**Conventions:**

- Folders in parentheses `(name)` are route groups (do not affect URL)
- `layout.tsx` defines shared layouts
- `page.tsx` defines pages
- `loading.tsx` for loading states
- `error.tsx` for error handling

### Server vs Client Components

**Default: Server Components**

```typescript
// Server Component (default)
export default function ServerPage() {
  // Executes on the server
  return <div>Server Component</div>;
}
```

**Client Components only when necessary:**

```typescript
'use client'; // Mandatory directive

import { useState } from 'react';

export function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Use Client Components for:**

- React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Third-party components that use hooks

### Typed API Client

**Location**: `lib/openapi-client/` (automatically generated)

**DO NOT EDIT** files in `lib/openapi-client/` - they are automatically regenerated.

**Usage:**

```typescript
import { client } from "@/lib/api-client";

// GET request
const { data, error } = await client.GET("/api/users/me");

// POST request
const { data, error } = await client.POST("/api/users/", {
  body: {
    email: "user@example.com",
    password: "securepass",
  },
});

// TypeScript automatically knows the types
if (data) {
  console.log(data.id, data.email); // ✅ Typed
}
```

## Code Conventions

### TypeScript

**Strict Type Safety:**

```typescript
// ✅ GOOD: Explicitly typed props
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌ BAD: Untyped props
export function Button({ label, onClick, variant }) {
  return <button onClick={onClick}>{label}</button>;
}
```

**Avoid `any`:**

```typescript
// ❌ BAD
function processData(data: any) {
  return data.value;
}

// ✅ GOOD
function processData(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return data.value;
  }
  throw new Error("Invalid data");
}
```

### React Components

**Functional Components:**

```typescript
// ✅ GOOD: Functional component
export function MyComponent({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

// ❌ BAD: Class component
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
      // Clean up effects
    };
  }, [count]);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Styling with Tailwind

**Use Tailwind CSS:**

```typescript
// ✅ GOOD: Tailwind classes
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      {children}
    </div>
  );
}

// ❌ BAD: Inline styles
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: '8px', padding: '24px' }}>
      {children}
    </div>
  );
}
```

**Conditional Classes with `cn()`:**

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

### Forms

**React Hook Form + Zod:**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
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
    // Submit data
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

### shadcn/ui Components

**Installation:**

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
```

**Usage:**

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

**Customization:**

shadcn/ui components are copied to `components/ui/` and can be edited.

## Testing

### Vitest + React Testing Library

**Test Structure:**

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
import { vi } from "vitest";

// Function mock
const mockFn = vi.fn();

// Module mock
vi.mock("@/lib/api-client", () => ({
  client: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));
```

## File Structure

### Organization

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
├── forms/                 # Custom forms
│   └── login-form.tsx
└── layout/                # Layout components
    ├── header.tsx
    └── footer.tsx

lib/
├── api-client.ts          # API client wrapper
├── clientService.ts       # Client services
├── utils.ts               # Utilities
└── openapi-client/        # Generated client (DO NOT EDIT)
```

### Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Utilities**: camelCase (`utils.ts`)
- **Constants**: UPPER_SNAKE_CASE (`const API_URL = '...'`)
- **Types/Interfaces**: PascalCase (`interface UserProps {}`)

## Configuration

### Environment Variables

**File**: `.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Usage:**

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**Rules:**

- Public variables: `NEXT_PUBLIC_` prefix
- Private variables: No prefix (server-side only)
- Never commit `.env.local`

### next.config.mjs

Next.js Configuration:

```javascript
const nextConfig = {
  output: "standalone", // For Docker
  // ... other options
};
```

### tailwind.config.ts

Tailwind Configuration:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Customizations
    },
  },
  plugins: [],
};

export default config;
```

## Security Limits

### DO NOT:

- ❌ Edit files in `lib/openapi-client/` (automatically generated)
- ❌ Use `any` in TypeScript
- ❌ Disable ESLint/Biome rules without justification
- ❌ Commit `.env.local` or secrets
- ❌ Use `dangerouslySetInnerHTML` without sanitization
- ❌ Direct fetch to external APIs from Client Components (use Server Actions)

### DO:

- ✅ Use the typed API client (`@/lib/api-client`)
- ✅ Validate forms with Zod
- ✅ Use Server Components by default
- ✅ Strict type safety
- ✅ Tests for critical components
- ✅ Follow shadcn/ui conventions

## Performance

### Optimizations

**Images:**

```typescript
import Image from 'next/image';

// ✅ GOOD: Next.js Image
<Image
  src="/photo.jpg"
  alt="Description"
  width={500}
  height={300}
  priority  // For above-the-fold images
/>

// ❌ BAD: img tag
<img src="/photo.jpg" alt="Description" />
```

**Fonts:**

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
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

## References

- **README**: `ui/README.md`
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev/
- **Tailwind Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/
