### Autenticación lista para producción

Este template viene con un sistema de autenticación preconfigurado, lo que te permite comenzar a construir tu aplicación con funcionalidades de gestión de usuarios inmediatamente.

### Hot Reload en desarrollo

El proyecto incluye dos procesos de hot reload ejecutando la aplicación, uno para el backend y otro para el frontend. Estos reinician automáticamente los servidores locales cuando detectan cambios, asegurando que la aplicación esté siempre actualizada sin necesidad de reinicios manuales.

- El **hot reload del backend** monitorea cambios en el código del backend.
- El **hot reload del frontend** monitorea cambios en el código del frontend y en el schema `openapi.json` generado por el backend.

### Ejecución manual de comandos de Hot Reload

Puedes ejecutar manualmente los mismos comandos que llaman los hot reloads cuando detectan un cambio:

1. Para exportar el schema `openapi.json`:

   ```bash
   cd api && uv run python -m commands.generate_openapi_schema
   ```

   o usando Docker:

   ```bash
   docker compose run --rm --no-deps -T backend uv run python -m commands.generate_openapi_schema
   ```

2. Para generar el cliente del frontend:
   ```bash
   cd ui && pnpm run generate-client
   ```
   o usando Docker:
   ```bash
   docker compose run --rm --no-deps -T frontend pnpm run generate-client
   ```

### Pruebas (Testing)

Para ejecutar las pruebas, necesitas iniciar el contenedor de la base de datos de pruebas:

```bash
make docker-up-test-db
```

Luego ejecuta las pruebas localmente:

```bash
make test-backend
make test-frontend
```

O usando Docker:

```bash
make docker-test-backend
make docker-test-frontend
```

### Configuración de Pre-Commit

Para mantener la calidad y consistencia del código, el proyecto incluye dos archivos de configuración de pre-commit separados:

- `.pre-commit-config.yaml` se usa para ejecutar comprobaciones de pre-commit localmente.
- `.pre-commit-config.docker.yaml` se usa para ejecutar comprobaciones de pre-commit dentro de Docker.

### Instalación y activación de hooks de Pre-Commit

Para activar los hooks de pre-commit, ejecuta los siguientes comandos para cada archivo de configuración:

- **Para el archivo de configuración local**:

  ```bash
  pre-commit install -c .pre-commit-config.yaml
  ```

- **Para el archivo de configuración de Docker**:
  ```bash
  pre-commit install -c .pre-commit-config.docker.yaml
  ```

### Configuración del servidor de correo local

Para configurar el servidor de correo localmente, necesitas iniciar [MailHog](https://github.com/mailhog/MailHog) ejecutando el siguiente comando:

```bash
make docker-up-mailhog
```

- **Cliente de correo**: Accede al correo en `http://localhost:8025`.

### Ejecución de comprobaciones de Pre-Commit

Para ejecutar manualmente las comprobaciones de pre-commit en todos los archivos, usa:

```bash
pre-commit run --all-files -c .pre-commit-config.yaml
```

o

```bash
pre-commit run --all-files -c .pre-commit-config.docker.yaml
```

### Actualización de hooks de Pre-Commit

Para actualizar los hooks a sus versiones más recientes, ejecuta:

```bash
pre-commit autoupdate
```

### Migraciones de base de datos Alembic

Si necesitas crear una nueva migración de base de datos:

```bash
make docker-db-schema migration_name="nombre_de_la_migracion"
```

luego aplica la migración a la base de datos:

```bash
make docker-migrate-db
```

### GitHub Actions

Este proyecto tiene una configuración de GitHub Actions preconfigurada para habilitar CI/CD. Los archivos de configuración del flujo de trabajo se encuentran dentro del directorio `.github/workflows`. Puedes personalizar estos flujos de trabajo para adaptarlos mejor a las necesidades de tu proyecto.

### Configuración de Secretos

Para que los flujos de trabajo funcionen correctamente, añade las claves secretas a la configuración de tu repositorio de GitHub. Navega a Settings > Secrets and variables > Actions y añade las siguientes claves:

```
DATABASE_URL: La cadena de conexión para tu base de datos principal.
TEST_DATABASE_URL: La cadena de conexión para tu base de datos de pruebas.
ACCESS_SECRET_KEY: La clave secreta para la generación de tokens de acceso.
RESET_PASSWORD_SECRET_KEY: La clave secreta para la funcionalidad de restablecimiento de contraseña.
VERIFICATION_SECRET_KEY: La clave secreta para la verificación de email o usuario.
```

## Makefile

Este proyecto incluye un `Makefile` que proporciona un conjunto de comandos para simplificar las tareas cotidianas, como iniciar los servidores de backend y frontend, ejecutar pruebas, construir contenedores Docker y más.

### Comandos disponibles

Puedes ver todos los comandos disponibles y sus descripciones ejecutando el siguiente comando en tu terminal:

```bash
make help
```
