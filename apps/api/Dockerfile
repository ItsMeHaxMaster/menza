# Base stage for all builds
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
ENV PNPM_HOME=/usr/local/bin

# Dependencies stage
FROM base AS dependencies
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/eslint-config/node_modules ./packages/eslint-config/node_modules

# Copy source files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api ./apps/api
COPY packages/types ./packages/types
COPY packages/eslint-config ./packages/eslint-config

# Build packages and API
RUN pnpm run build --filter=@menza/api...

# Production stage
FROM node:24-alpine AS production
WORKDIR /app

# Install production dependencies only
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder
COPY --from=builder /app/apps/api/build ./apps/api/build
COPY --from=builder /app/packages/types/build ./packages/types/build

# Create logs directory
RUN mkdir -p /app/apps/api/logs

# Expose port
EXPOSE 3001

# Set working directory to API
WORKDIR /app/apps/api

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "build/index.js"]
