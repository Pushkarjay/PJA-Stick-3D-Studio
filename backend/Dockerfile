# Multi-stage build for Node.js backend

# Stage 1: Build stage with all dependencies
FROM node:18-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (bcrypt, sharp, etc.)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install ALL dependencies using npm ci for reproducible builds
RUN npm ci

# Copy source code
COPY . .

# Stage 2: Production stage
FROM node:18-slim

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy source code from builder
COPY --from=builder /app/src ./src

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN useradd -r -u 1001 -g root appuser && \
    chown -R appuser:root /app

# Switch to non-root user
USER appuser

# Expose port (Cloud Run uses PORT env var, default to 8080)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/server.js"]
