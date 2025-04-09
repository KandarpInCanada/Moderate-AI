variable "aws_account_id" {
  description = "AWS account id"
  type        = string
  sensitive   = true
}

variable "aws_access_key" {
  description = "AWS access key"
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS secret key"
  type        = string
  sensitive   = true
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "environment" {
  description = "AWS environment"
  type        = string
}

variable "repository_name" {
  description = "AWS environment"
  type        = string
}
