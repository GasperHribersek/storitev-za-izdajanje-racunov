# Stage 1: Build stage - Install dependencies
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source code
COPY . .

# Stage 2: Production stage - Minimal image
FROM node:22-alpine

WORKDIR /app

# Copy dependencies and application from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/server.js ./
COPY --from=build /app/config ./config
COPY --from=build /app/src ./src
COPY --from=build /app/sql ./sql

# Expose the application port
EXPOSE 5000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Run the application in production mode
CMD ["npm", "start"]
