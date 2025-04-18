variable "lambda_function_name" {
  description = "Lambda function name"
  type        = string
}

variable "lambda_handler" {
  description = "Lambda handler"
  type        = string
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
}

variable "s3_bucket" {
  description = "S3 bucket to trigger Lambda"
  type        = string
}

variable "s3_prefix" {
  description = "S3 prefix to watch for new objects"
  type        = string
}

variable "lambda_role_arn" {
  description = "IAM Role ARN for the Lambda function"
  type        = string
}

variable "environment_vars" {
  description = "Environment variables for the Lambda"
  type        = map(string)
}

variable "tags" {
  description = "Tags for resources"
  type        = map(string)
}
