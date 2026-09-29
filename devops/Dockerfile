# ==============================================================================
# Production Multi-Stage Dockerfile for Heal Engine
# Compliant with enterprise security standards: non-root execution, minimal attack surface
# ==============================================================================

# Stage 1: Build Frontend and Compile Server
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Build Vite frontend bundle & compile TypeScript server
RUN npm run build
RUN npm run lint:server

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install dumb-init for proper signal handling and zombie reaping
RUN apk add --no-cache dumb-init curl

# Create unprivileged application user
RUN addgroup -g 1001 -S healengine && \
    adduser -u 1001 -S healengine -G healengine

# Copy build artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/node_modules ./node_modules

# Assign ownership to unprivileged user
RUN chown -R healengine:healengine /app

USER healengine

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npx", "tsx", "backend/index.ts"]
