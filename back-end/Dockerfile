# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Set NODE_ENV
ENV NODE_ENV=production
ENV POSTGRES_URL=postgresql://queue_admin:securepassword@terraform-20250125165600320600000001.chq800c88yfr.eu-central-1.rds.amazonaws.com:5432/jobqueue?sslmode=no-verify
ENV POSTGRES_HOST=terraform-20250125165600320600000001.chq800c88yfr.eu-central-1.rds.amazonaws.com
ENV SQS_URL=https://sqs.eu-central-1.amazonaws.com/038235372620/email-jobs-queue
ENV SQS_REGION=eu-central-1
ENV AWS_SECRET_ACCESS_KEY=OyBiH4pl/FWIwC+VCkD31g9AArJbcS9Hrz80Esu4
ENV AWS_ACCESS_KEY_ID=AKIAQRZYBPRGI7RAK5B2


# Expose port
EXPOSE 3001

# Start the application
CMD ["pnpm", "start:prod"]
