# Email Queue Simulation

## Overview

This application simulates the process of sending a large number of emails. It is designed with a queue system for job management, a backend to handle requests, and a frontend to monitor job progress in real-time.

---

## Features

### **Frontend**

- **Job Creation**:
  - Input the number of emails (e.g., 100,000).
  - Submit the job to start processing.
- **Job Monitoring**:
  - Displays all job statuses: Job ID, total emails, and progress (e.g., "70% complete").
  - Allows polling every few seconds for updates.

### **Backend**

- **Job APIs**:
  - **`POST /jobs`**: Create a new job and add it to the queue.
  - **`GET /jobs/:id`**: Retrieve the status of a specific job.
  - **`GET /jobs`**: Fetch the status of all jobs.
- **Queue Integration**:
  - Uses AWS SQS to manage job queues.
  - Simulates batch email processing (e.g., processes 100 emails at a time with a delay).
- **Job Status**:
  - Maintains job records in the database with fields like Job ID, total emails, processed count, and status (`Pending`, `In Progress`, `Completed`).

---

## Tech Stack

- **Frontend**: Next.js
- **Backend**: NestJS
- **Queue**: AWS SQS
- **Database**: AWS RDS PostgreSQL

---

## Setup Instructions

### **Requirements**

- Docker and Docker Compose installed locally.
- AWS credentials configured for SQS and RDS (if using AWS services).
- Node.js .

### **Steps to Run the Application**

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd email-queue-simulation
   ```

2. Create a .env file in the root directory and set the required environment variables:
   ```bash
   SQS_REGION=your-region
   SQS_URL=your-sqs-url
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   POSTGRES_HOST=your-rds-host
   POSTGRES_PORT=5432
   POSTGRES_DB=jobqueue
   POSTGRES_USER=your-username
   POSTGRES_PASSWORD=your-password
   ```
3. Start the application:

   ```bash
   docker-compose up -d --build
   ```
