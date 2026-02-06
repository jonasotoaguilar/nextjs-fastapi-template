# Project Instructions

This document contains rules and conventions specific to the Next.js FastAPI Template project.

## Tech Stack

### Frontend (ui/)

- **Next.js 16** with App Router
- **React 19** with Server Components
- **TypeScript 5**
- **Tailwind CSS 4**
- **shadcn/ui** for components
- **Zod 4** for validation
- **Vitest** for testing
- **Biome** for linting and formatting
- **pnpm** as package manager

### Backend (api/)

- **FastAPI 0.128**
- **Python 3.12**
- **SQLAlchemy 2** (async)
- **PostgreSQL** as database
- **Alembic** for migrations
- **fastapi-users** for authentication
- **pytest** for testing
- **Ruff** for linting and formatting
- **UV** as dependency manager

## Main Commands

### Development

```bash
# Initialize project
make init-env                # Copy .env files
make install                 # Install dependencies (host)
make install-pre-commit      # Install pre-commit hooks

# Docker
make docker-build            # Build images
make docker-up               # Start all services
make docker-down             # Stop services
make docker-start-api        # Start only API
make docker-start-ui         # Start only UI

# Without Docker
make start-api               # Start API (host)
make start-ui                # Start UI (host)
```

### Database

```bash
make docker-migrate-db                              # Apply migrations
make docker-db-schema migration_name="description"  # Create migration
```

### Testing

```bash
make test-api                # API tests (host)
make test-ui                 # UI tests (host)
make docker-test-api         # API tests (docker)
make docker-test-ui          # UI tests (docker)
```

### Code Quality

```bash
make lint                    # Run pre-commit on all files
```

## Architecture

### End-to-End Type Safety

The project maintains full type safety between frontend and backend:

1. **Backend**: Defines schemas with Pydantic
2. **OpenAPI**: FastAPI generates OpenAPI schema automatically
3. **Frontend**: Typed client generated from OpenAPI with `@hey-api/openapi-ts`
4. **Validation**: Zod validates data on the frontend

### Typed API Client

The API client is automatically regenerated:

- **Watcher**: `ui/watcher.js` detects changes in `openapi.json`
- **Generation**: Runs `pnpm generate-client` automatically
- **Location**: Generated client in `ui/lib/openapi-client/`

**Do not manually edit** the files in `ui/lib/openapi-client/`.

### Authentication

Complete system with `fastapi-users`:

- **JWT tokens** for authentication
- **Secure hashing** of passwords with bcrypt
- **Password recovery** via email
- **Email verification** (optional)

Endpoints:

- `POST /api/auth/register` - Registration
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password

## Code Conventions

### General

- **Commits**: Use Conventional Commits (enforced by pre-commit)
- **Branches**: Feature branches from `main`
- **PRs**: All tests and linters must pass

### Frontend (TypeScript/React)

- **Components**: Functional with hooks
- **Server Components**: By default, use Client Components only when necessary
- **Type Safety**: Explicit type hints for props
- **Styling**: Tailwind CSS, use `cn()` for conditional classes
- **Forms**: React Hook Form + Zod for validation
- **Testing**: Vitest + React Testing Library

See `ui/AGENTS.md` for more details.

### Backend (Python/FastAPI)

- **Type Hints**: Mandatory for all functions
- **Async**: Use async/await for I/O operations
- **Dependency Injection**: For DB sessions and dependencies
- **Response Models**: Define in all endpoints
- **Migrations**: Create for all schema changes
- **Testing**: pytest with pytest-asyncio

See `api/AGENTS.md` for more details.

## Project Structure

### Adding New Models

1. Create model in `api/app/db/models/`
2. Import in `api/app/db/base.py`
3. Create schemas in `api/app/schemas/`
4. Create migration: `make docker-db-schema migration_name="description"`
5. Apply migration: `make docker-migrate-db`

### Adding New Endpoints

1. Create router in `api/app/api/routes/`
2. Register router in `api/app/main.py`
3. The frontend client will regenerate automatically

### Adding New Components

1. shadcn/ui components: `npx shadcn@latest add <component>`
2. Custom components: Create in `ui/components/`
3. Follow shadcn/ui conventions for props and styles

## Testing

### Minimum Coverage

- **Backend**: > 80% coverage
- **Frontend**: > 70% coverage

### Strategy

- **Unit tests**: Functions and utilities
- **Integration tests**: Full API endpoints
- **Component tests**: React components

## Deployment

### Docker

Optimized multi-stage Dockerfiles:

- `api/Dockerfile` - FastAPI Backend
- `ui/Dockerfile` - Next.js Frontend

### Vercel

Vercel-ready configuration:

- `api/vercel.json` - Serverless backend
- `ui/vercel.json` - Frontend

Required environment variables on Vercel:

- See `api/.env.example` for backend
- See `ui/.env.example` for frontend

## CI/CD

GitHub Actions workflows:

- `.github/workflows/ci.yml` - Tests and linting
- `.github/workflows/api-container-build-push.yml` - Build API Docker
- `.github/workflows/ui-container-build-push.yml` - Build UI Docker

## Security

### Secrets

- **Never** commit `.env` files
- Use `.env.example` as a template
- Rotate secrets regularly in production

### Dependencies

- Pre-commit hooks verify dependencies
- Update dependencies regularly
- Review security advisories

## Security Limits

### DO NOT:

- ❌ Commit secrets or API keys
- ❌ Disable pre-commit hooks
- ❌ Make direct commits to `main` (use PRs)
- ❌ Edit automatically generated files
- ❌ Modify already applied migrations in production

### DO:

- ✅ Use environment variables for configuration
- ✅ Run tests before pushing
- ✅ Create migrations for schema changes
- ✅ Document important changes
- ✅ Follow Conventional Commits

## References

- **Full Documentation**: https://jonasotoaguilar.github.io/nextjs-fastapi-template/
- **Frontend specific**: `ui/README.md` and `ui/AGENTS.md`
- **Backend specific**: `api/README.md` and `api/AGENTS.md`
- **Makefile**: See `make help` for all commands
- **Original Template**: https://github.com/vintasoftware/nextjs-fastapi-template/
