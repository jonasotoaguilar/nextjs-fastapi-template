# Backend - AI Agent Ruleset

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                                                                                                                                                                 | Skill                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Creating, modifying, organizing, or running Python tests, including unit, integration, async, database, or API test scenarios.                                         | `pytest`                          |
| Creating, structuring, or refactoring FastAPI services, including async architecture, dependency injection, routing, validation, or production-ready backend patterns. | `fastapi-templates`               |
| Designing or writing PostgreSQL schemas                                                                                                                                | `postgresql-table-design`         |
| Writing, modifying, profiling, or reviewing Python code where execution time, memory usage, concurrency, or scalability may be affected.                               | `python-performance-optimization` |

## Stack and Versions

- **FastAPI**: 0.128.1
- **Python**: 3.12
- **SQLAlchemy**: 2.x (async)
- **Alembic**: 1.18.3
- **PostgreSQL**: 15+ (asyncpg driver)
- **fastapi-users**: 15.0.4
- **Pydantic**: 2.x
- **pytest**: 9.0.2
- **Ruff**: 0.15.0
- **UV**: Latest

## Commands

```bash
# Development
./start.sh                           # Start server (http://localhost:8000)
uv run fastapi dev app/main.py      # Alternative with hot reload

# Database
uv run alembic revision --autogenerate -m "description"  # New migration
uv run alembic upgrade head          # Apply migrations
uv run alembic downgrade -1          # Revert last migration
uv run alembic history               # View history
uv run alembic current               # View current version

# Testing
uv run pytest                        # Run tests
uv run pytest --cov=app             # With coverage
uv run pytest -v                     # Verbose
uv run pytest tests/test_users.py   # Specific test

# Code Quality
uv run ruff check .                  # Linting
uv run ruff check --fix .            # Auto-fix
uv run ruff format .                 # Formatting
uv run mypy app                      # Type checking

# Utilities
uv run python -m commands.create_superuser  # Create superuser
```

## Project Structure

```
app/
├── api/                    # API Endpoints
│   ├── routes/            # Routers by resource
│   │   ├── __init__.py   # Router registration
│   │   ├── users.py      # User routes
│   │   └── ...
│   └── deps.py           # Shared dependencies
├── core/                  # Configuration and utilities
│   ├── config.py         # Settings (Pydantic)
│   ├── security.py       # Security utilities
│   └── ...
├── db/                    # Database
│   ├── models/           # SQLAlchemy models
│   │   ├── base.py      # Base class
│   │   ├── user.py      # User model
│   │   └── ...
│   ├── session.py        # Session configuration
│   └── base.py           # Model imports
├── schemas/               # Pydantic schemas
│   ├── user.py           # User schemas
│   └── ...
└── main.py                # Entry point
```

## Security Limits

### DO NOT:

- ❌ Use sync instead of async
- ❌ Omit type hints
- ❌ Modify already applied migrations
- ❌ Commit `.env` with secrets
- ❌ Expose sensitive information in logs
- ❌ Use `SELECT *` in queries
- ❌ Disable Pydantic validation
- ❌ Hardcode secrets in code

### DO:

- ✅ Use async/await for I/O
- ✅ Type hints in all functions
- ✅ Validate input with Pydantic
- ✅ Use dependency injection
- ✅ Create migrations for schema changes
- ✅ Hash passwords (never plain text)
- ✅ Validate permissions in protected endpoints
- ✅ Lint code with Ruff (`uv run ruff check .`)
- ✅ Tests for all endpoints (`uv run pytest`)
