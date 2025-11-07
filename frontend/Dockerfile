# Use Node.js 16 alpine image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# Build the application
RUN npm run build

# Start the development server
CMD ["npm", "run", "dev"]