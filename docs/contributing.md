# Contribuir

¡Toda ayuda es bienvenida para mejorar el template Next.js FastAPI! Por favor, siéntete libre de abordar los [issues existentes](https://github.com/jonasotoaguilar/nextjs-fastapi-template/issues). Si tienes una nueva idea, crea un hilo en [Discussions](https://github.com/jonasotoaguilar/nextjs-fastapi-template/discussions).

Sigue esta guía para aprender más sobre cómo desarrollar y probar el proyecto localmente antes de abrir un pull request.

## Configuración de desarrollo local

### Clonar el repositorio

```bash
git clone https://github.com/jonasotoaguilar/nextjs-fastapi-template.git
```

Consulta la página [Get Started](get-started.md#setup) para completar la configuración.

## Instalar hooks de pre-commit

Consulta la sección [Configuración de Pre-Commit](additional-settings.md#configuracion-de-pre-commit) para completar la configuración.

Es fundamental ejecutar los hooks de pre-commit antes de subir tu código para seguir el estilo de código del proyecto y evitar errores de linting.

## Actualización del schema OpenAPI

Es fundamental actualizar el schema OpenAPI cuando realices cambios en las rutas de FastAPI o archivos relacionados:

Consulta la sección [Ejecución manual de comandos de Hot Reload](additional-settings.md#ejecucion-manual-de-comandos-de-hot-reload) para ejecutar el comando.

## Pruebas (Tests)

Consulta la sección [Pruebas (Testing)](additional-settings.md#pruebas-testing) para ejecutar las pruebas.

## Documentación

Utilizamos [mkdocs-material](https://squidfunk.github.io/mkdocs-material/) para generar la documentación a partir de archivos markdown.
Revisa los archivos en el directorio `docs`.

Para ejecutar la documentación localmente, necesitas ejecutar:

```bash
uv run mkdocs serve
```

## Lanzamiento (Release)

!!! info
El backend y el frontend están versionados juntos, es decir, deben tener el mismo número de versión.

Para lanzar y publicar una nueva versión, sigue estos pasos:

1. Actualiza la versión en `api/pyproject.toml` y `ui/package.json`.
2. Actualiza el historial de cambios en `CHANGELOG.md`.
3. Abre un PR con los cambios.
4. Una vez que el PR se haya fusionado, ejecuta la [GitHub Action de Lanzamiento](https://github.com/jonasotoaguilar/nextjs-fastapi-template/actions/workflows/release.yml) para crear un borrador de lanzamiento.
5. Revisa el borrador de lanzamiento, asegúrate de que la descripción tenga al menos la entrada correspondiente del changelog y publícalo.
