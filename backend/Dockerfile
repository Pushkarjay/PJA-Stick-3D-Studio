# Multi-stage build for Node.js backend

# Stage 1: Build stage
FROM node:18-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (sharp, bcrypt)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
# Using npm install instead of npm ci since package-lock.json is not in repo
RUN npm install

# Copy source code
COPY . .

# Stage 2: Production stage
FROM node:18-slim

# Create app directory
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --only=production

# Copy built application from builder
COPY --from=builder /app/src ./src

# Create non-root user
RUN useradd -r -u 1001 -g root appuser && \
    chown -R appuser:root /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/server.js"]
