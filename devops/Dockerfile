# ==============================================================================
# Production Multi-Stage Dockerfile for Heal Engine
# Compliant with enterprise security standards: non-root execution, minimal attack surface
# ==============================================================================

# Stage 1: Build Frontend and Compile Server
FROM node:22-alpine AS builder
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

# Ensure /app/dist exists (defensive fallback if Vite placed output in frontend/dist)
RUN if [ -d "/app/frontend/dist" ] && [ ! -d "/app/dist" ]; then cp -r /app/frontend/dist /app/dist; fi

# Verify dist directory was created
RUN test -d /app/dist || { echo "ERROR: /app/dist not found after build"; ls -la /app/; exit 1; }

# Stage 2: Minimal Production Runtime
FROM node:22-alpine AS runner
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
