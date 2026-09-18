# Multi-stage Docker build for Linova Music
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package manifests
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN npm install --prefix client
RUN npm install --prefix server

# Copy source code
COPY client ./client
COPY server ./server

# Build production frontend
RUN npm run build --prefix client

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy server and built client
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

# Expose application port
EXPOSE 5000

# Start server
CMD ["node", "server/src/server.js"]
