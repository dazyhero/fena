provider "aws" {
  region = "eu-central-1" # Frankfurt region
}

# Create a VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "main-vpc"
  }
}

# Create Subnets in Two Availability Zones
resource "aws_subnet" "public_subnet_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "eu-central-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-a"
  }
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "eu-central-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-b"
  }
}

# Create an Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main-internet-gateway"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "public-route-table"
  }
}

# Associate Route Table with Subnets
resource "aws_route_table_association" "public_subnet_a_assoc" {
  subnet_id      = aws_subnet.public_subnet_a.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_subnet_b_assoc" {
  subnet_id      = aws_subnet.public_subnet_b.id
  route_table_id = aws_route_table.public_route_table.id
}

# Security Group for RDS
resource "aws_security_group" "rds_security_group" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Replace with your IP for better security
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "rds-security-group"
  }
}

# RDS DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "main-db-subnet-group"
  subnet_ids = [
    aws_subnet.public_subnet_a.id,
    aws_subnet.public_subnet_b.id
  ]

  tags = {
    Name = "main-db-subnet-group"
  }
}

# RDS Instance
resource "aws_db_instance" "postgres" {
  allocated_storage       = var.rds_allocated_storage
  engine                  = "postgres"
  engine_version          = "16.3" # Update if necessary
  instance_class          = var.rds_instance_class
  db_name                 = var.rds_instance_name
  username                = var.rds_username
  password                = var.rds_password
  publicly_accessible     = true
  vpc_security_group_ids  = [aws_security_group.rds_security_group.id]
  db_subnet_group_name    = aws_db_subnet_group.main.name
  skip_final_snapshot     = true
  backup_retention_period = 1

  tags = {
    Environment = "Development"
    Team        = "Backend"
  }
}

# SQS Queue
resource "aws_sqs_queue" "email_jobs_queue" {
  name                        = "email-jobs-queue"
  delay_seconds               = 0
  visibility_timeout_seconds  = 30
  message_retention_seconds   = 345600 # 4 days
  max_message_size            = 262144
  receive_wait_time_seconds   = 0
  fifo_queue                  = false

  tags = {
    Environment = "Development"
    Team        = "Backend"
  }
}

# Outputs
output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "The endpoint of the RDS PostgreSQL database."
}

output "rds_security_group_id" {
  value       = aws_security_group.rds_security_group.id
  description = "The ID of the security group for RDS."
}

output "sqs_queue_url" {
  value       = aws_sqs_queue.email_jobs_queue.id
  description = "The URL of the SQS queue."
}

output "vpc_id" {
  value       = aws_vpc.main.id
  description = "The ID of the VPC."
}
