FROM node:22-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

RUN npm install

# Copy the rest of the app
COPY . .

# Expose the app port
EXPOSE 5000

# Run the app
CMD ["npm", "run", "dev"]
