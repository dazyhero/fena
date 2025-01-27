# Stage 1: Install dependencies and build the Next.js app
FROM node:22 AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only necessary files for installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN pnpm run build

### **Stage 2: Serve the Next.js app**
FROM node:22 AS runner

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy the built app and pnpm configuration
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Command to run the Next.js app
CMD ["pnpm", "start"]
