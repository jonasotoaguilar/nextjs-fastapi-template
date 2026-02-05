Para usar este template para tu propio proyecto:

1. Crea un nuevo repositorio usando este template siguiendo la [guía de repositorios template de GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template#creating-a-repository-from-a-template)
2. Clona tu nuevo repositorio y navega a él: `cd nombre-de-tu-proyecto`
3. Asegúrate de tener Python 3.12 instalado

Una vez completado, procede a la sección [Setup](#setup) a continuación.

## Setup

### Instalación de herramientas requeridas

#### 1. uv

uv se usa para gestionar las dependencias de Python en el backend. Instala uv siguiendo la [guía oficial de instalación](https://docs.astral.sh/uv/getting-started/installation/).

#### 2. Node.js, npm y pnpm

Para ejecutar el frontend, asegúrate de tener Node.js y npm instalados. Sigue la [guía de instalación de Node.js](https://nodejs.org/en/download/).
Después, instala pnpm ejecutando:

```bash
npm install -g pnpm
```

#### 3. Docker

Docker es necesario para ejecutar el proyecto en un entorno contenedorizado. Sigue la guía de instalación correspondiente:

- [Instalar Docker para Mac](https://docs.docker.com/docker-for-mac/install/)
- [Instalar Docker para Windows](https://docs.docker.com/docker-for-windows/install/)
- [Obtener Docker CE para Linux](https://docs.docker.com/install/linux/docker-ce/)

#### 4. Docker Compose

Asegúrate de tener `docker-compose` instalado. Consulta la [guía de instalación de Docker Compose](https://docs.docker.com/compose/install/).

### Configuración de variables de entorno

**Backend (`api/.env`):**

Copia los archivos `.env.example` a `.env` y actualiza las variables con tus propios valores.

```bash
cd api && cp .env.example .env
```

Solo necesitarás actualizar las claves secretas. Puedes usar el siguiente comando para generar una nueva clave secreta:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

- Las configuraciones de DATABASE, MAIL, OPENAPI, CORS y FRONTEND_URL están listas para usarse localmente.
- Las configuraciones de DATABASE y MAIL ya están configuradas en Docker Compose si estás usando Docker.
- La configuración OPENAPI_URL está comentada. Descomentarla ocultará las URLs /docs y openapi.json, lo cual es ideal para producción.

Puedes consultar el archivo .env.example para más información sobre las variables.

**Frontend (`ui/.env.local`):**

Copia los archivos `.env.example` a `.env.local`. Es poco probable que estos valores cambien, por lo que puedes dejarlos como están.

```bash
cd ui && cp .env.example .env.local
```

### Ejecutando la base de datos

Usa Docker para ejecutar la base de datos y evitar problemas de instalación local. Construye e inicia el contenedor de la base de datos:

```bash
docker compose build db
docker compose up -d db
```

Ejecuta el siguiente comando para aplicar las migraciones de la base de datos:

```bash
make docker-migrate-db
```

### Construir el proyecto (sin Docker):

Para configurar el entorno del proyecto localmente, usa los siguientes comandos:

#### Backend

Navega al directorio `api` y ejecuta:

```bash
uv sync
```

#### Frontend

Navega al directorio `ui` y ejecuta:

```bash
pnpm install
```

### Construir el proyecto (con Docker):

Construye los contenedores de backend y frontend:

```bash
make docker-build
```

## Ejecutando la aplicación

**Si no estás usando Docker:**

Inicia el servidor FastAPI:

```bash
make start-api
```

Inicia el servidor de desarrollo de Next.js:

```bash
make start-ui
```

**Si estás usando Docker:**

Inicia el contenedor del servidor FastAPI:

```bash
make docker-start-api
```

Inicia el contenedor del servidor de desarrollo de Next.js:

```bash
make docker-start-ui
```

- **Backend**: Accede a la API en `http://localhost:8001`.
- **Frontend**: Accede a la aplicación web en `http://localhost:3000`.

## Consideraciones importantes

- **Variables de entorno**: Asegúrate de que tus archivos `.env` estén actualizados.
- **Configuración de base de datos**: Se recomienda usar Docker para ejecutar la base de datos, incluso cuando se ejecutan el backend y el frontend localmente, para simplificar la configuración y evitar posibles conflictos.
- **Consistencia**: **No se recomienda** alternar entre ejecutar el proyecto localmente y usar Docker, ya que esto puede causar problemas de permisos o problemas inesperados. Puedes elegir un método y mantenerlo.
