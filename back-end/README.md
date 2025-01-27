# Email Processing Queue System

An email processing queue system built with NestJS, PostgreSQL, and AWS SQS.

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)

## Setup Instructions

### Prerequisites

- Node.js
- Docker and Docker Compose
- AWS Account with SQS access
- PostgreSQL (if running without Docker)

### Local Development Setup

1. **Environment Configuration**

   Update the `.env` file with your AWS credentials and other configurations:

   ```
   AWS_REGION=eu-central-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   SQS_QUEUE_URL=your_sqs_queue_url
   ```

2. **Using Docker (Recommended)**

   ```bash
   # Start all services
    docker build -d -t email-queue-system .
   ```

3. **Manual Setup (Alternative)**

   ```bash
   # Install dependencies
   npm install

   # Start PostgreSQL database
   # Configure connection in .env

   # Run migrations
   npm run migration:run

   # Start development server
   npm run start:dev
   ```

## Design Decisions & Trade-offs

### 1. Queue Processing Architecture

#### Decisions:

- Used AWS SQS for reliable message queuing
- Implemented in-memory cache for duplicate prevention
- Batch processing with configurable batch sizes
- Asynchronous job status updates

#### Trade-offs:

- **In-Memory Cache vs Database Checks**

  - ✅ Faster processing
  - ✅ Reduced database load
  - ❌ Cache lost on service restart
  - ❌ Not suitable for distributed systems

- **AWS SQS vs Redis/RabbitMQ**
  - ✅ Managed service, less operational overhead
  - ✅ High availability and scalability
  - ❌ Higher latency
  - ❌ Cost considerations for high volume

#### Trade-offs:

- **Retry Strategy**
  - ✅ Improved reliability
  - ❌ Increased processing time
  - ❌ Potential duplicate processing

### 4. Scalability Considerations

- Horizontal scaling capability
- Stateless application design
- Connection pooling
- Rate limiting implementation

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   NestJS    │────▶│    AWS      │
│             │     │   Service   │     │    SQS      │
└─────────────┘     └─────────────┘     └─────────────┘
                          │                     │
                          │                     │
                    ┌─────▼─────┐        ┌─────▼─────┐
                    │  In-Memory│        │  Message  │
                    │   Cache   │        │ Processor │
                    └─────┬─────┘        └─────┬─────┘
                          │                    │
                          │                    │
                    ┌─────▼────────────────────▼─────┐
                    │          PostgreSQL            │
                    │         Job Storage            │
                    └────────────────────────────────┘
```

## API Documentation

### Endpoints

```
POST /jobs
- Create new email processing job

GET /jobs/:id
- Get job status

GET /jobs
- List all jobs
```

### Example Usage

```bash
# Create new job
curl -X POST http://localhost:3001/jobs \
  -H "Content-Type: application/json" \
  -d '{"totalEmails": 5000}'
```
