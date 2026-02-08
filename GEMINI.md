# Repository Guidelines

## How to Use This Guide

- Start here for cross-project norms. Prowler is a monorepo with several components.
- Each component has an `AGENTS.md` file with specific guidelines (e.g., `api/AGENTS.md`, `ui/AGENTS.md`).
- Component docs override this file when guidance conflicts.

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                                                                                                                                                                                        | Skill                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Adding, customizing, refactoring, or troubleshooting UI components built with shadcn/ui or related design-system primitives.                                                                  | `shadcn-ui`                       |
| After creating/modifying a skill                                                                                                                                                              | `skill-sync`                      |
| Always use for ui. SEO-optimized programmatic generation is required.                                                                                                                         | `programmatic-seo`                |
| Creating new skills                                                                                                                                                                           | `skill-creator`                   |
| Creating, modifying, or reviewing Next.js application code, architecture, routing, data fetching, rendering strategy, metadata, or performance behavior.                                      | `next-best-practices`             |
| Creating, modifying, organizing, or running Python tests, including unit, integration, async, database, or API test scenarios.                                                                | `pytest`                          |
| Creating, modifying, organizing, or running unit or component tests using Vitest, including mocking, coverage configuration, snapshots, or test environment setup.                            | `vitest`                          |
| Creating, refactoring, debugging, or integrating global client state in React applications using Zustand, including persistence, hydration, or TypeScript typing concerns.                    | `zustand-state-management`        |
| Creating, reviewing, refactoring, or optimizing React or Next.js code that may impact rendering performance, data fetching strategy, bundle size, or user-perceived latency.                  | `vercel-react-best-practices`     |
| Designing or writing PostgreSQL schemas                                                                                                                                                       | `postgresql-table-design`         |
| Designing, extending, or standardizing UI systems using Tailwind CSS, including tokens, theming, responsive behavior, and component composition.                                              | `tailwind-design-system`          |
| Designing, refactoring, or scaling React component architecture using composition patterns such as compound components, context orchestration, or render-prop abstractions.                   | `vercel-composition-patterns`     |
| Designing, reviewing, versioning, or refactoring REST or GraphQL APIs, including resource modeling, schema design, error handling, authentication, pagination, and long-term maintainability. | `api-design-principles`           |
| Implementing or refactoring complex TypeScript type logic, reusable type utilities, generics, conditional or mapped types, or compile-time safety constraints.                                | `typescript-advanced-types`       |
| Implementing, refactoring, or validating UI forms that use React Hook Form, Zod schemas, or structured client-side validation logic.                                                          | `react-hook-form-zod`             |
| Invoke when implementing, scaling, or debugging FastAPI-based services, including async I/O, database integration, authentication, real-time communication, validation, or OpenAPI exposure.  | `fastapi-expert`                  |
| Planning, designing, evaluating, or improving user interfaces or user experience, including layout, accessibility, interaction patterns, visual systems, and usability.                       | `ui-ux-pro-max`                   |
| Regenerate AGENTS.md Auto-invoke tables (sync.sh)                                                                                                                                             | `skill-sync`                      |
| Troubleshoot why a skill is missing from AGENTS.md auto-invoke                                                                                                                                | `skill-sync`                      |
| Writing, modifying, profiling, or reviewing Python code where execution time, memory usage, concurrency, or scalability may be affected.                                                      | `python-performance-optimization` |

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
