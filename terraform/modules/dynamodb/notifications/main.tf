resource "aws_dynamodb_table" "this" {
  name         = var.notifications_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = var.notifications_hash_key
  range_key    = var.notifications_range_key

  attribute {
    name = var.notifications_hash_key
    type = var.notifications_hash_key_type
  }

  attribute {
    name = var.notifications_range_key
    type = var.notifications_range_key_type
  }

  tags = var.tags
}



