FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY server.js ./
COPY public/ ./public/

# Expose port
EXPOSE 8080

# Set environment defaults
ENV PORT=8080
ENV API_BASE=http://localhost:3000

CMD ["node", "server.js"]
