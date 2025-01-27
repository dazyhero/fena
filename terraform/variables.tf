variable "aws_region" {
  default     = "eu-central-1"
  description = "The AWS region to create resources in."
}

variable "sqs_queue_name" {
  default     = "email-jobs-queue"
  description = "The name of the SQS queue."
}

variable "rds_instance_name" {
  default     = "jobqueue"
  description = "The name of the RDS instance."
}

variable "rds_username" {
  default     = "queue_admin"
  description = "The master username for the RDS instance."
}

variable "rds_password" {
  default     = "securepassword" # Change to a secure password
  description = "The master password for the RDS instance."
}

variable "rds_allocated_storage" {
  default     = 20
  description = "The allocated storage in GB for the RDS instance."
}

variable "rds_instance_class" {
  default     = "db.t3.micro"
  description = "The instance class for the RDS instance (Free Tier eligible)."
}
