# Frontend - Next.js

Next.js + FastAPI template frontend built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Tech Stack

- **Next.js 16.1.6** - React Framework with App Router
- **React 19.2.4** - UI Library with Server Components
- **TypeScript 5** - End-to-end type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Pre-built React components
- **Zod 4** - Schema validation and type safety
- **React Hook Form 7** - Form management
- **Vitest** - Testing framework
- **Biome** - Modern linter and formatter
- **OpenAPI-TS** - Typed client generation from OpenAPI

## Project Structure

```
ui/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── login/         # Login page
│   │   └── register/      # Register page
│   ├── (dashboard)/       # Protected routes
│   │   └── profile/       # User profile
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utilities and configuration
│   ├── api-client.ts     # Typed API client
│   ├── clientService.ts  # Client services
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── Dockerfile            # Docker configuration
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── biome.json            # Biome configuration
├── vitest.config.ts      # Vitest configuration
└── package.json          # Dependencies and scripts
```

## Available Scripts

### Development

```bash
pnpm dev                  # Start development server (port 3000)
pnpm build                # Build for production
pnpm start                # Start production server
```

### Code Quality

```bash
pnpm lint                 # Run linter (Biome)
pnpm lint:fix             # Run linter and auto-fix
pnpm format               # Format code with Biome
pnpm check                # Run linter and format
pnpm tsc                  # Verify TypeScript types
```

### Testing

```bash
pnpm test                 # Run tests
pnpm coverage             # Run tests with coverage
```

### API Client

```bash
pnpm generate-client      # Regenerate API client from OpenAPI
```

## Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Typed API Client

The API client is automatically generated from the backend's OpenAPI schema:

1. **Automatic generation**: The watcher detects changes in `openapi.json` and regenerates the client.
2. **Manual generation**: Run `pnpm generate-client`.

**Client Usage:**

```typescript
import { client } from "@/lib/api-client";

// The client is fully typed
const { data, error } = await client.POST("/api/users/", {
  body: {
    email: "user@example.com",
    password: "securepassword",
  },
});

// TypeScript knows the structure of 'data' and 'error'
if (data) {
  console.log(data.id, data.email);
}
```

## Development

### Start the Frontend

**With Docker:**

```bash
# From project root
make docker-start-ui
```

**Without Docker:**

```bash
# From ui/ folder
pnpm dev
```

The server will be available at `http://localhost:3000`.

### Hot Reload

The project includes hot reload for:

- **Source code**: Next.js automatically reloads changes.
- **API Client**: The watcher regenerates the client when `openapi.json` changes.

### Adding New Components

**shadcn/ui components:**

```bash
# Install component from shadcn/ui
npx shadcn@latest add button
```

**Custom components:**

Create components in `components/` following conventions:

```typescript
// components/my-component.tsx
import { cn } from "@/lib/utils";

interface MyComponentProps {
  className?: string;
  // ... other props
}

export function MyComponent({ className, ...props }: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {/* content */}
    </div>
  );
}
```

## Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm coverage

# Run in watch mode
pnpm vitest
```

### Writing Tests

Tests are written with Vitest and React Testing Library:

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

## Deployment

### Docker

The project includes an optimized multi-stage Dockerfile:

```bash
# Build image
docker build -t nextjs-frontend .

# Run container
docker run -p 3000:3000 nextjs-frontend
```

### Vercel

The project is optimized for Vercel deployment:

1. Connect your repository to Vercel.
2. Configure environment variables.
3. Vercel will automatically detect Next.js and deploy it.

**Vercel Environment Variables:**

- `NEXT_PUBLIC_API_URL`: Backend API URL

## Code Conventions

### TypeScript

- Use explicit types for component props.
- Avoid `any`, use `unknown` if necessary.
- Define interfaces for complex objects.

### React

- Prefer Server Components when possible.
- Use Client Components only when necessary (`'use client'`).
- Functional components with hooks.

### Styling

- Use Tailwind CSS for styling.
- Follow shadcn/ui design system.
- Use `cn()` to combine conditional classes.

### File Structure

- Components in `components/`.
- Pages in `app/`.
- Utilities in `lib/`.
- Shared types in `.types.ts` files.

## Troubleshooting

### API Client Not Updating

```bash
# Regenerate manually
pnpm generate-client

# Verify that openapi.json exists
ls -la openapi.json
```

### TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next tsconfig.tsbuildinfo

# Verify types
pnpm tsc
```

### Dependency Issues

```bash
# Clean and install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Resources

- [Project Documentation](https://jonasotoaguilar.github.io/nextjs-fastapi-template/)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com/)
