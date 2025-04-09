# variables.tf

variable "aws_region" {
  description = "The AWS region to deploy resources"
  type        = string
}

variable "aws_access_key" {
  description = "The AWS access key to deploy resources"
  type        = string
}

variable "aws_secret_key" {
  description = "The AWS secret key to deploy resources"
  type        = string
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "repository_name" {
  description = "Name of the ECR repository"
  type        = string
}

variable "environment" {
  description = "Environment (e.g. dev, staging, prod)"
  type        = string
}
