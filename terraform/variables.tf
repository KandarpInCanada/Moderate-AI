variable "app_name" {
  description = "Application name"
  type        = string
}

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
variable "vpc_private_subnet_cidrs" {
  description = "VPC private cidr block"
  type        = list(string)
}
variable "vpc_azs" {
  description = "VPC availability zones list"
  type        = list(string)
}
variable "ecs_tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
  default     = {}
}
variable "ecs_task_cpu" {
  description = "CPU units for the task"
  type        = number
}
variable "ecs_task_memory" {
  description = "Memory for the task in MiB"
  type        = number
}
variable "ecs_container_name" {
  description = "Name of the container"
  type        = string
}
variable "ecs_container_port" {
  description = "Port exposed by the containe"
  type        = number
}
variable "ecs_container_image_tag" {
  description = "Tag of the container image"
  type        = string
}
variable "ecs_container_environment" {
  description = "Environment variables for the container"
  type = list(object({
    name  = string
    value = string
  }))
}
variable "ecs_desired_count" {
  description = "Desired number of tasks"
  type        = number
}
variable "ecs_health_check_path" {
  description = "Path for health checks"
  type        = string
}
