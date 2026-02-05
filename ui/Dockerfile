FROM node:20-bookworm AS base

# Install pnpm via corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# DEV Stage
FROM base AS dev
# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install

COPY . .

EXPOSE 3000
CMD ["pnpm", "dev"]

# BUILDER Stage
FROM base AS builder
# Install dependencies (frozen lockfile for reproducibility)
# Ignore scripts during install for security, then rebuild sharp for Next.js image optimization
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts && \
    pnpm rebuild sharp

COPY . .

# Generate OpenAPI client before building
# Set the OpenAPI file path as environment variable
ENV OPENAPI_OUTPUT_FILE=./openapi.json
RUN pnpm run generate-client

# Build the application
# We assume that next.config.mjs has been updated with output: 'standalone'
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# PROD Stage
FROM node:20-bookworm-slim AS prod
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy only the necessary files for the standalone build
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next \
    && chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
