variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}

variable "lambda_function_name" {
  type        = string
  description = "Name of the Lambda function"
}

variable "image_metadata_dynamodb_table_name" {
  type        = string
  description = "Target DynamoDB table name"
}

variable "notification_dynamodb_table_name" {
  type        = string
  description = "Target DynamoDB table name"
}

variable "region" {
  type        = string
  description = "AWS region"
}

variable "s3_bucket" {
  description = "S3 bucket to trigger Lambda"
  type        = string
}
