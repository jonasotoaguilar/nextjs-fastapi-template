FROM python:3.12-bookworm AS base

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set the working directory
WORKDIR /app

# Set environment variables for uv
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Copy dependency files
COPY pyproject.toml uv.lock ./

# DEV Stage
FROM base AS dev
# Install all dependencies (including dev)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

ENV PATH="/app/.venv/bin:$PATH"

# Copy source code
COPY . .

# Ensure start script is executable
RUN chmod +x ./start.sh

EXPOSE 8001
CMD ["./start.sh"]

# BUILDER Stage (for prod)
FROM base AS builder
# Install ONLY prod dependencies into a virtual environment
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# PROD Stage
FROM python:3.12-slim-bookworm AS prod

WORKDIR /app

# Copy the virtual environment from the builder stage
COPY --from=builder /app/.venv /app/.venv

# Update PATH to use the virtual environment
ENV PATH="/app/.venv/bin:$PATH"

# Copy the application code
COPY . .

# Ensure start script is executable (redundant but safe)
RUN chmod +x ./start.sh \
    && groupadd -r appuser \
    && useradd -r -g appuser appuser
USER appuser

EXPOSE 8001
CMD ["./start.sh"]
