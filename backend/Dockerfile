FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 4000

# Set environment defaults
ENV PORT=4000
ENV NODE_ENV=production

CMD ["node", "src/server.js"]
