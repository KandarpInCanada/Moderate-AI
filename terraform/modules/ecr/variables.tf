variable "repository_name" {
  description = "Name of the ECR repository"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}
