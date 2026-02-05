# Makefile

# Variables
API_DIR=api
UI_DIR=ui
DOCKER_COMPOSE=docker compose -f docker-compose-dev.yml

# Help
.PHONY: help
help:
	@echo "Available commands:"
	@awk '/^[a-zA-Z_-]+:/{split($$1, target, ":"); print "  " target[1] "\t" substr($$0, index($$0,$$2))}' $(MAKEFILE_LIST)

# Initialization
.PHONY: init-env install install-pre-commit

init-env: ## Copy .env.example to .env in both ui and api
	@echo "Initializing environment variables..."
	@if [ ! -f $(API_DIR)/.env ]; then cp $(API_DIR)/.env.example $(API_DIR)/.env; echo "Created api .env"; else echo "API .env already exists"; fi
	@if [ ! -f $(UI_DIR)/.env ]; then cp $(UI_DIR)/.env.example $(UI_DIR)/.env.local; echo "Created ui .env.local"; else echo "UI .env already exists"; fi

install: ## Install dependencies for both api (uv) and ui (pnpm) on host
	@echo "Installing api dependencies (uv)..."
	cd $(API_DIR) && uv sync
	@echo "Installing ui dependencies (pnpm)..."
	cd $(UI_DIR) && pnpm install

install-pre-commit: ## Install pre-commit hooks using uv from api
	@echo "Installing pre-commit hooks..."
	cd $(API_DIR) && uv run pre-commit install

lint: ## Run pre-commit hooks on all files
	@echo "Running pre-commit hooks..."
	cd $(API_DIR) && uv run pre-commit run --all-files

# Cleanup
.PHONY: clean

clean: ## Remove temporary files, caches and dependency folders (node_modules, .venv, etc.)
	@echo "Cleaning up..."
	rm -rf $(UI_DIR)/node_modules $(UI_DIR)/.next
	rm -rf $(API_DIR)/.venv $(API_DIR)/__pycache__ $(API_DIR)/.pytest_cache
	find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "Cleanup complete."

# API commands
.PHONY: start-api test-api

start-api: ## Start the api server with FastAPI and hot reload
	cd $(API_DIR) && ./start.sh

test-api: ## Run api tests using pytest
	cd $(API_DIR) && uv run pytest


# UI commands
.PHONY: start-ui test-ui

start-ui: ## Start the ui server with pnpm and hot reload
	cd $(UI_DIR) && ./start.sh

test-ui: ## Run ui tests using npm
	cd $(UI_DIR) && pnpm run test


# Docker commands
.PHONY: docker-up docker-down docker-logs docker-api-shell docker-ui-shell docker-build docker-build-api \
        docker-build-ui docker-start-api docker-start-ui docker-up-test-db \
        docker-migrate-db docker-db-schema docker-test-api docker-test-ui


docker-up: ## Start all services in the background
	$(DOCKER_COMPOSE) up -d

docker-down: ## Stop and remove containers, networks, and images
	$(DOCKER_COMPOSE) down

docker-logs: ## View output from containers
	$(DOCKER_COMPOSE) logs -f

docker-api-shell: ## Access the api container shell
	$(DOCKER_COMPOSE) run --rm api sh

docker-ui-shell: ## Access the ui container shell
	$(DOCKER_COMPOSE) run --rm ui sh

docker-build: ## Build all the services
	$(DOCKER_COMPOSE) build --no-cache

docker-build-api: ## Build the api container with no cache
	$(DOCKER_COMPOSE) build api --no-cache

docker-build-ui: ## Build the ui container with no cache
	$(DOCKER_COMPOSE) build ui --no-cache

docker-start-api: ## Start the api container
	$(DOCKER_COMPOSE) up api

docker-start-ui: ## Start the ui container
	$(DOCKER_COMPOSE) up ui

docker-up-test-db: ## Start the test database container
	$(DOCKER_COMPOSE) up db_test

docker-migrate-db: ## Run database migrations using Alembic
	$(DOCKER_COMPOSE) run --rm api alembic upgrade head

docker-db-schema: ## Generate a new migration schema. Usage: make docker-db-schema migration_name="add users"
	$(DOCKER_COMPOSE) run --rm api alembic revision --autogenerate -m "$(migration_name)"

docker-test-api: ## Run tests for the api
	$(DOCKER_COMPOSE) run --rm api pytest

docker-test-ui: ## Run tests for the ui
	$(DOCKER_COMPOSE) run --rm ui pnpm run test

docker-up-mailhog: ## Start mailhog server
	$(DOCKER_COMPOSE) up mailhog
