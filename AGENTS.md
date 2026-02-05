# Instrucciones del Proyecto

Este documento contiene reglas y convenciones específicas del proyecto Next.js FastAPI Template.

## Stack Tecnológico

### Frontend (ui/)
- **Next.js 16** con App Router
- **React 19** con Server Components
- **TypeScript 5**
- **Tailwind CSS 4**
- **shadcn/ui** para componentes
- **Zod 4** para validación
- **Vitest** para testing
- **Biome** para linting y formateo
- **pnpm** como gestor de paquetes

### Backend (api/)
- **FastAPI 0.128**
- **Python 3.12**
- **SQLAlchemy 2** (async)
- **PostgreSQL** como base de datos
- **Alembic** para migraciones
- **fastapi-users** para autenticación
- **pytest** para testing
- **Ruff** para linting y formateo
- **UV** como gestor de dependencias

## Comandos Principales

### Desarrollo

```bash
# Inicializar proyecto
make init-env                # Copiar archivos .env
make install                 # Instalar dependencias (host)
make install-pre-commit      # Instalar pre-commit hooks

# Docker
make docker-build            # Construir imágenes
make docker-up               # Iniciar todos los servicios
make docker-down             # Detener servicios
make docker-start-api        # Iniciar solo API
make docker-start-ui         # Iniciar solo UI

# Sin Docker
make start-api               # Iniciar API (host)
make start-ui                # Iniciar UI (host)
```

### Base de Datos

```bash
make docker-migrate-db                              # Aplicar migraciones
make docker-db-schema migration_name="descripción"  # Crear migración
```

### Testing

```bash
make test-api                # Tests API (host)
make test-ui                 # Tests UI (host)
make docker-test-api         # Tests API (docker)
make docker-test-ui          # Tests UI (docker)
```

### Calidad de Código

```bash
make lint                    # Ejecutar pre-commit en todos los archivos
```

## Arquitectura

### Type Safety de Extremo a Extremo

El proyecto mantiene type safety completo entre frontend y backend:

1. **Backend**: Define schemas con Pydantic
2. **OpenAPI**: FastAPI genera schema OpenAPI automáticamente
3. **Frontend**: Cliente tipado generado desde OpenAPI con `@hey-api/openapi-ts`
4. **Validación**: Zod valida datos en el frontend

### Cliente API Tipado

El cliente API se regenera automáticamente:

- **Watcher**: `ui/watcher.js` detecta cambios en `openapi.json`
- **Generación**: Ejecuta `pnpm generate-client` automáticamente
- **Ubicación**: Cliente generado en `ui/lib/openapi-client/`

**No editar manualmente** los archivos en `ui/lib/openapi-client/`.

### Autenticación

Sistema completo con `fastapi-users`:

- **JWT tokens** para autenticación
- **Hash seguro** de contraseñas con bcrypt
- **Recuperación de contraseña** por email
- **Verificación de email** (opcional)

Endpoints:
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Solicitar reset
- `POST /api/auth/reset-password` - Resetear contraseña

## Convenciones de Código

### General

- **Commits**: Usar Conventional Commits (enforced por pre-commit)
- **Branches**: Feature branches desde `main`
- **PRs**: Todos los tests y linters deben pasar

### Frontend (TypeScript/React)

- **Componentes**: Funcionales con hooks
- **Server Components**: Por defecto, usar Client Components solo cuando sea necesario
- **Type Safety**: Type hints explícitos para props
- **Estilos**: Tailwind CSS, usar `cn()` para clases condicionales
- **Formularios**: React Hook Form + Zod para validación
- **Testing**: Vitest + React Testing Library

Ver `ui/AGENTS.md` para más detalles.

### Backend (Python/FastAPI)

- **Type Hints**: Obligatorios en todas las funciones
- **Async**: Usar async/await para operaciones I/O
- **Dependency Injection**: Para sesiones de DB y dependencias
- **Response Models**: Definir en todos los endpoints
- **Migraciones**: Crear para todos los cambios de schema
- **Testing**: pytest con pytest-asyncio

Ver `api/AGENTS.md` para más detalles.

## Estructura de Archivos

### Agregar Nuevos Modelos

1. Crear modelo en `api/app/db/models/`
2. Importar en `api/app/db/base.py`
3. Crear schemas en `api/app/schemas/`
4. Crear migración: `make docker-db-schema migration_name="descripción"`
5. Aplicar migración: `make docker-migrate-db`

### Agregar Nuevos Endpoints

1. Crear router en `api/app/api/routes/`
2. Registrar router en `api/app/main.py`
3. El cliente del frontend se regenerará automáticamente

### Agregar Nuevos Componentes

1. Componentes shadcn/ui: `npx shadcn@latest add <component>`
2. Componentes custom: Crear en `ui/components/`
3. Seguir convenciones de shadcn/ui para props y estilos

## Testing

### Cobertura Mínima

- **Backend**: > 80% coverage
- **Frontend**: > 70% coverage

### Estrategia

- **Unit tests**: Funciones y utilidades
- **Integration tests**: Endpoints API completos
- **Component tests**: Componentes React

## Despliegue

### Docker

Dockerfiles multi-stage optimizados:
- `api/Dockerfile` - Backend FastAPI
- `ui/Dockerfile` - Frontend Next.js

### Vercel

Configuración lista para Vercel:
- `api/vercel.json` - Backend serverless
- `ui/vercel.json` - Frontend

Variables de entorno requeridas en Vercel:
- Ver `api/.env.example` para backend
- Ver `ui/.env.example` para frontend

## CI/CD

GitHub Actions workflows:

- `.github/workflows/ci.yml` - Tests y linting
- `.github/workflows/api-container-build-push.yml` - Build API Docker
- `.github/workflows/ui-container-build-push.yml` - Build UI Docker

## Seguridad

### Secrets

- **Nunca** commitear archivos `.env`
- Usar `.env.example` como template
- Rotar secrets regularmente en producción

### Dependencias

- Pre-commit hooks verifican dependencias
- Actualizar dependencias regularmente
- Revisar security advisories

## Límites de Seguridad

### NO hacer:

- ❌ Commitear secrets o API keys
- ❌ Deshabilitar pre-commit hooks
- ❌ Hacer commits directos a `main` (usar PRs)
- ❌ Editar archivos generados automáticamente
- ❌ Modificar migraciones ya aplicadas en producción

### SÍ hacer:

- ✅ Usar variables de entorno para configuración
- ✅ Ejecutar tests antes de hacer push
- ✅ Crear migraciones para cambios de schema
- ✅ Documentar cambios importantes
- ✅ Seguir Conventional Commits

## Referencias

- **Documentación completa**: https://jonasotoaguilar.github.io/nextjs-fastapi-template/
- **Frontend específico**: `ui/README.md` y `ui/AGENTS.md`
- **Backend específico**: `api/README.md` y `api/AGENTS.md`
- **Makefile**: Ver `make help` para todos los comandos
- **Template original**: https://github.com/vintasoftware/nextjs-fastapi-template/
