# Multi-stage Dockerfile for CivicSolve V2
# Stage 1: Build & Compile
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package manifests
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all dependencies (including devDependencies for compiling)
RUN npm ci

# Copy full source tree
COPY shared/ ./shared/
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Compile TypeScript packages and bundle frontend
RUN npm run build

# Prune dev dependencies for lean production deployment
RUN npm prune --production

# -------------------------------------------------------------
# Stage 2: Production Minimal Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Security: Create non-root user and group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S civicsolve -u 1001 -G nodejs

# Copy pruned node_modules and built distributions
COPY --from=builder --chown=civicsolve:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=civicsolve:nodejs /app/package.json ./package.json
COPY --from=builder --chown=civicsolve:nodejs /app/shared/dist ./shared/dist
COPY --from=builder --chown=civicsolve:nodejs /app/shared/package.json ./shared/package.json
COPY --from=builder --chown=civicsolve:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=civicsolve:nodejs /app/backend/package.json ./backend/package.json
COPY --from=builder --chown=civicsolve:nodejs /app/backend/src/database/schema.sql ./backend/dist/database/schema.sql
COPY --from=builder --chown=civicsolve:nodejs /app/frontend/dist ./frontend/dist

# Create SQLite data directory with correct ownership if local fallback is used
RUN mkdir -p /app/backend/.data && chown -R civicsolve:nodejs /app/backend/.data

USER civicsolve

EXPOSE 5000

# Container Healthcheck targeting unthrottled health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["sh", "-c", "node backend/dist/database/migrate.js && node backend/dist/server.js"]
