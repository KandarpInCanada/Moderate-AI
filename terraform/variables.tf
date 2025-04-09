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

variable "aws_environment" {
  description = "AWS environment"
  type        = string
}

variable "ecr_repository_name" {
  description = "AWS environment"
  type        = string
}

variable "s3_bucket_name" {
  description = "AWS bucket name"
  type        = string
}

variable "vpc_name" {
  description = "VPC name"
  type        = string
}
variable "vpc_cidr" {
  description = "VPC cidr block"
  type        = string
}
variable "vpc_public_subnet_cidrs" {
  description = "VPC public cidr block"
  type        = list(string)
}
variable "vpc_azs" {
  description = "VPC availability zones list"
  type        = list(string)
}
