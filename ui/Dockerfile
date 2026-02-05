FROM node:20-bookworm

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.7.1

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies as root (or myappuser, depending on your structure)
RUN pnpm install

## Switch to the non-root user
USER node

# Copy the rest of your application code
COPY . .

EXPOSE 3000

# Start the application
CMD ["./start.sh"]
