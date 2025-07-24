FROM node:22-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 5555

# Command to run the server
CMD [ "node", "dist/main.js" ]