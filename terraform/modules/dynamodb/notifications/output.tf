output "notifications_table_name" {
  description = "The name of the Notifications DynamoDB table"
  value       = aws_dynamodb_table.this.name
}

output "notifications_table_arn" {
  description = "The ARN of the Notifications DynamoDB table"
  value       = aws_dynamodb_table.this.arn
}
