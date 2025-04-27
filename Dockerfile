# Use Node as Base Image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all code to container
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Run Application 
CMD ["npm", "start"]