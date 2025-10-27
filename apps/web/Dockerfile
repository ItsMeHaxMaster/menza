# Base stage for all builds
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
ENV PNPM_HOME=/usr/local/bin

# Dependencies stage
FROM base AS dependencies
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=dependencies /app/packages/eslint-config/node_modules ./packages/eslint-config/node_modules

# Copy build arguments as environment variables for Next.js build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CDN_URL
ARG NEXT_PUBLIC_STRIPE_PUBLIC
ARG NEXT_PUBLIC_TURNSTILE_PUBLIC

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CDN_URL=$NEXT_PUBLIC_CDN_URL
ENV NEXT_PUBLIC_STRIPE_PUBLIC=$NEXT_PUBLIC_STRIPE_PUBLIC
ENV NEXT_PUBLIC_TURNSTILE_PUBLIC=$NEXT_PUBLIC_TURNSTILE_PUBLIC

# Copy source files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web ./apps/web
COPY packages/eslint-config ./packages/eslint-config

# Build Next.js application
RUN pnpm run build --filter=@menza/web

# Production stage
FROM node:24-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built Next.js application
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/
COPY --from=builder /app/apps/web/package.json ./apps/web/

# Set working directory to web app
WORKDIR /app/apps/web

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js in production mode
CMD ["pnpm", "start"]
