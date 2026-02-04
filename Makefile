# Makefile

# Variables
BACKEND_DIR=fastapi_backend
FRONTEND_DIR=nextjs-frontend
DOCKER_COMPOSE=docker compose

# Help
.PHONY: help
help:
	@echo "Available commands:"
	@awk '/^[a-zA-Z_-]+:/{split($$1, target, ":"); print "  " target[1] "\t" substr($$0, index($$0,$$2))}' $(MAKEFILE_LIST)

# Initialization
.PHONY: init-env install install-pre-commit

init-env: ## Copy .env.example to .env in both frontend and backend
	@echo "Initializing environment variables..."
	@if [ ! -f $(BACKEND_DIR)/.env ]; then cp $(BACKEND_DIR)/.env.example $(BACKEND_DIR)/.env; echo "Created backend .env"; else echo "Backend .env already exists"; fi
	@if [ ! -f $(FRONTEND_DIR)/.env ]; then cp $(FRONTEND_DIR)/.env.example $(FRONTEND_DIR)/.env.local; echo "Created frontend .env.local"; else echo "Frontend .env already exists"; fi

install: ## Install dependencies for both backend (uv) and frontend (pnpm) on host
	@echo "Installing backend dependencies (uv)..."
	cd $(BACKEND_DIR) && uv sync
	@echo "Installing frontend dependencies (pnpm)..."
	cd $(FRONTEND_DIR) && pnpm install

install-pre-commit: ## Install pre-commit hooks using uv from backend
	@echo "Installing pre-commit hooks..."
	cd $(BACKEND_DIR) && uv run pre-commit install

lint: ## Run pre-commit hooks on all files
	@echo "Running pre-commit hooks..."
	cd $(BACKEND_DIR) && uv run pre-commit run --all-files

# Cleanup
.PHONY: clean

clean: ## Remove temporary files, caches and dependency folders (node_modules, .venv, etc.)
	@echo "Cleaning up..."
	rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/.next
	rm -rf $(BACKEND_DIR)/.venv $(BACKEND_DIR)/__pycache__ $(BACKEND_DIR)/.pytest_cache
	find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "Cleanup complete."

# Backend commands
.PHONY: start-backend test-backend

start-backend: ## Start the backend server with FastAPI and hot reload
	cd $(BACKEND_DIR) && ./start.sh

test-backend: ## Run backend tests using pytest
	cd $(BACKEND_DIR) && uv run pytest


# Frontend commands
.PHONY: start-frontend test-frontend

start-frontend: ## Start the frontend server with pnpm and hot reload
	cd $(FRONTEND_DIR) && ./start.sh

test-frontend: ## Run frontend tests using npm
	cd $(FRONTEND_DIR) && pnpm run test


# Docker commands
.PHONY: docker-up docker-down docker-logs docker-backend-shell docker-frontend-shell docker-build docker-build-backend \
        docker-build-frontend docker-start-backend docker-start-frontend docker-up-test-db \
        docker-migrate-db docker-db-schema docker-test-backend docker-test-frontend


docker-up: ## Start all services in the background
	$(DOCKER_COMPOSE) up -d

docker-down: ## Stop and remove containers, networks, and images
	$(DOCKER_COMPOSE) down

docker-logs: ## View output from containers
	$(DOCKER_COMPOSE) logs -f

docker-backend-shell: ## Access the backend container shell
	$(DOCKER_COMPOSE) run --rm backend sh

docker-frontend-shell: ## Access the frontend container shell
	$(DOCKER_COMPOSE) run --rm frontend sh

docker-build: ## Build all the services
	$(DOCKER_COMPOSE) build --no-cache

docker-build-backend: ## Build the backend container with no cache
	$(DOCKER_COMPOSE) build backend --no-cache

docker-build-frontend: ## Build the frontend container with no cache
	$(DOCKER_COMPOSE) build frontend --no-cache

docker-start-backend: ## Start the backend container
	$(DOCKER_COMPOSE) up backend

docker-start-frontend: ## Start the frontend container
	$(DOCKER_COMPOSE) up frontend

docker-up-test-db: ## Start the test database container
	$(DOCKER_COMPOSE) up db_test

docker-migrate-db: ## Run database migrations using Alembic
	$(DOCKER_COMPOSE) run --rm backend alembic upgrade head

docker-db-schema: ## Generate a new migration schema. Usage: make docker-db-schema migration_name="add users"
	$(DOCKER_COMPOSE) run --rm backend alembic revision --autogenerate -m "$(migration_name)"

docker-test-backend: ## Run tests for the backend
	$(DOCKER_COMPOSE) run --rm backend pytest

docker-test-frontend: ## Run tests for the frontend
	$(DOCKER_COMPOSE) run --rm frontend pnpm run test

docker-up-mailhog: ## Start mailhog server
	$(DOCKER_COMPOSE) up mailhog
