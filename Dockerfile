# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm install pkgroll typescript

# Copy source code and config files
COPY tsconfig.json ./
COPY src ./src

# Build the project
RUN npm run build

# Remove dev dependencies to keep image small
RUN npm prune --production

# Create logs directory for optional request logging
RUN mkdir -p logs

# Expose port 4040 (default port for the Alexa skill)
EXPOSE 4040

# Start the application
CMD ["npm", "start"]
