FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code and config
COPY src/ ./src/
COPY config/ ./config/

# Expose port
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start server
CMD ["node", "src/server.js"]
