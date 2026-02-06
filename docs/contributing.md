# Contributing

All help is welcome to improve the Next.js FastAPI template! Please feel free to address [existing issues](https://github.com/jonasotoaguilar/nextjs-fastapi-template/issues). If you have a new idea, start a thread in [Discussions](https://github.com/jonasotoaguilar/nextjs-fastapi-template/discussions).

Follow this guide to learn more about how to develop and test the project locally before opening a pull request.

## Local Development Setup

### Clone the Repository

```bash
git clone https://github.com/jonasotoaguilar/nextjs-fastapi-template.git
```

See the [Get Started](get-started.md#setup) page to complete the setup.

## Install Pre-Commit Hooks

See the [Pre-Commit Configuration](additional-settings.md#pre-commit-configuration) section to complete the setup.

It is essential to run pre-commit hooks before pushing your code to follow the project's code style and avoid linting errors.

## Updating the OpenAPI Schema

It is essential to update the OpenAPI schema when you make changes to FastAPI routes or related files:

See the [Manual Execution of Hot Reload Commands](additional-settings.md#manual-execution-of-hot-reload-commands) section to run the command.

## Testing

See the [Testing](additional-settings.md#testing) section to run the tests.

## Documentation

We use [mkdocs-material](https://squidfunk.github.io/mkdocs-material/) to generate documentation from markdown files.
Review the files in the `docs` directory.

To run the documentation locally, you need to run:

```bash
uv run mkdocs serve
```

## Release

!!! info
The backend and frontend are versioned together, meaning they must have the same version number.

To launch and publish a new version, follow these steps:

1. Update the version in `api/pyproject.toml` and `ui/package.json`.
2. Update the changelog in `CHANGELOG.md`.
3. Open a PR with the changes.
4. Once the PR is merged, run the [Release GitHub Action](https://github.com/jonasotoaguilar/nextjs-fastapi-template/actions/workflows/release.yml) to create a draft release.
5. Review the draft release, ensure the description has at least the corresponding changelog entry, and publish it.
