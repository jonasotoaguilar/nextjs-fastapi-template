### Descripción general

Se admite el despliegue en **Vercel**, con botones dedicados para las aplicaciones de **Frontend** y **Backend**. Ambas requieren configuraciones específicas durante y después del despliegue para asegurar un funcionamiento correcto.

---

### Despliegue del Frontend

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjonasotoaguilar%2Fnextjs-fastapi-template%2Ftree%2Fmain%2Fui&env=API_BASE_URL&envDescription=The%20API_BASE_URL%20is%20the%20backend%20URL%20where%20the%20frontend%20sends%20requests.)

- Haz clic en el botón **Frontend** de arriba para iniciar el proceso de despliegue.
- Durante el despliegue, se te pedirá que configures `API_BASE_URL`. Usa un valor provisional (por ejemplo, `https://`) por ahora, ya que se actualizará con la URL del backend más adelante.
- Completa el proceso de despliegue [aquí](#configuracion-post-despliegue).

### Despliegue del Backend

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjonasotoaguilar%2Fnextjs-fastapi-template%2Ftree%2Fmain%2Fapi&env=CORS_ORIGINS,ACCESS_SECRET_KEY,RESET_PASSWORD_SECRET_KEY,VERIFICATION_SECRET_KEY&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

- Haz clic en el botón **Backend** de arriba para comenzar el despliegue.
- Primero, configura la base de datos. La conexión se configura automáticamente, así que sigue los pasos y debería funcionar por defecto.
- Durante el proceso de despliegue, se te pedirá que configures las siguientes variables de entorno:
  - **CORS_ORIGINS**
    - Configura esto a `["*"]` inicialmente para permitir todos los orígenes. Más adelante, puedes actualizar esto con la URL del frontend.

  - **ACCESS_SECRET_KEY**, **RESET_PASSWORD_SECRET_KEY**, **VERIFICATION_SECRET_KEY**
    - Durante el despliegue, puedes configurar temporalmente estas claves secretas como cadenas de texto simples (por ejemplo, `claveejemplo`). Sin embargo, debes generar claves seguras y actualizarlas después del despliegue en la sección de **Configuración Post-Despliegue**.

- Completa el proceso de despliegue [aquí](#configuracion-post-despliegue).

## Configuración de CI (GitHub Actions) para el Despliegue de Producción

Proporcionamos los archivos **prod-api-deploy.yml** y **prod-ui-deploy.yml** para habilitar la integración continua a través de GitHub Actions. Para conectarlos a GitHub, simplemente muévelos al directorio `.github/workflows/`.

Puedes hacerlo con los siguientes comandos:

```bash
 mv prod-api-deploy.yml .github/workflows/prod-api-deploy.yml
 mv prod-ui-deploy.yml .github/workflows/prod-ui-deploy.yml
```

### Prerrequisitos

1. **Crear un Token de Vercel**:
   - Genera tu [Token de Acceso de Vercel](https://vercel.com/account/tokens).
   - Guarda el token como `VERCEL_TOKEN` en tus secretos de GitHub.

2. **Instalar Vercel CLI**:
   ```bash
   pnpm i -g vercel@latest
   ```
3. Autentica tu cuenta:
   ```bash
   vercel login
   ```

### Creación de la Base de Datos (Requerido)

1. **Elegir una Base de Datos**
   - Puedes usar tu base de datos alojada en un servicio diferente o optar por la base de datos [Neon](https://neon.tech/docs/introduction), que se integra perfectamente con Vercel.

2. **Configurar una Base de Datos Neon a través de Vercel**
   - En la página del **Panel de Proyectos** en Vercel, navega a la sección **Storage**.
   - Selecciona la opción **Create a Database** para provisionar una base de datos Neon.

3. **Configurar la URL de la Base de Datos**
   - Después de crear la base de datos, obtén la **Database URL** proporcionada por Neon.
   - Incluye esta URL en tus **Variables de Entorno** bajo `DATABASE_URL`.

4. **Migrar la Base de Datos**
   - La migración de la base de datos ocurrirá automáticamente durante el despliegue de la GitHub Action, configurando las tablas y el schema necesarios.

### Configuración del Frontend

1. Vincula el proyecto `ui`.

2. Navega al directorio `ui` y ejecuta:
   ```bash
   cd ui
   vercel link
   ```
3. Sigue las instrucciones:
   - ¿Vincular a un proyecto existente? No
   - ¿Modificar ajustes? No

4. Guarda los IDs del Proyecto y añade los Secretos de GitHub:

- Abre `ui/.vercel/project.json` y añade lo siguiente a los secretos de tu repositorio de GitHub:
  - `projectId` → `VERCEL_PROJECT_ID_FRONTEND`
  - `orgId` → `VERCEL_ORG_ID`

### Configuración del Backend

1. Vincula el proyecto `api`.

2. Navega al directorio `api` y ejecuta:

   ```bash
   cd api
   vercel link --local-config=vercel.prod.json
   ```

   - Usamos un archivo de configuración específico para establecer el valor de `--local-config`.

3. Sigue las instrucciones:
   - ¿Vincular a un proyecto existente? No
   - ¿Modificar ajustes? No

4. Guarda los IDs del Proyecto y añade los Secretos de GitHub:

- Abre `api/.vercel/project.json` y añade lo siguiente a los secretos de tu repositorio de GitHub:
  - `projectId` → `VERCEL_PROJECT_ID_BACKEND`
  - `orgId` → `VERCEL_ORG_ID` (Solo en caso de que no lo hayas añadido antes)

5. Actualiza el archivo requirements.txt:

   ```bash
   cd api
   uv export > requirements.txt
   ```

   - Es necesario exportar un nuevo archivo `requirements.txt` para el despliegue en Vercel cuando se modifica el `uv.lock`.

### Notas

- Una vez que todo esté configurado, ejecuta `git push` y el despliegue ocurrirá automáticamente.
- Por favor, asegúrate de completar la configuración tanto para el frontend como para el backend por separado.
- Consulta la [Documentación de Vercel CLI](https://vercel.com/docs/cli) para más detalles.
- Puedes encontrar el `project_id` en la configuración del proyecto en la web de Vercel.
- Puedes encontrar el `organization_id` en la configuración de la organización en la web de Vercel.

## Configuración Post-Despliegue

### Frontend

- Navega a la página de **Settings** del proyecto de frontend desplegado.
- Accede a la sección **Environment Variables**.
- Actualiza la variable `API_BASE_URL` con la URL del backend una vez que el despliegue del backend se haya completado.

### Backend

- Accede a la página de **Settings** del proyecto de backend desplegado.
- Navega a la sección **Environment Variables** y actualiza las siguientes variables con valores seguros:
  - **CORS_ORIGINS**
    - Una vez que el frontend esté desplegado, reemplaza `["*"]` con la URL real del frontend.

  - **ACCESS_SECRET_KEY**
    - Genera una clave segura para el acceso a la API y confígurala aquí.

  - **RESET_PASSWORD_SECRET_KEY**
    - Genera una clave segura para la funcionalidad de restablecimiento de contraseña y confígurala.

  - **VERIFICATION_SECRET_KEY**
    - Genera una clave segura para la verificación de usuarios y confígurala.

- Para instrucciones detalladas sobre cómo configurar estas claves secretas, consulta la sección [Configuración de Variables de Entorno](get-started.md#configuracion-de-variables-de-entorno).

### Activación de serverless fluido

[Fluid](https://vercel.com/docs/functions/fluid-compute) es el nuevo modelo de concurrencia de Vercel para funciones serverless, que les permite manejar múltiples solicitudes por ejecución en lugar de iniciar una nueva instancia para cada solicitud. Esto mejora el rendimiento, reduce los arranques en frío (cold starts) y optimiza el uso de recursos, haciendo que las cargas de trabajo serverless sean más eficientes.

Sigue esta [guía](https://vercel.com/docs/functions/fluid-compute#how-to-enable-fluid-compute) para activar Fluid.
