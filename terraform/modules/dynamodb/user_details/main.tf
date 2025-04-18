resource "aws_dynamodb_table" "this" {
  name         = var.user_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = var.user_details_hash_key
  attribute {
    name = var.user_details_hash_key
    type = var.user_details_hash_key_type
  }
  tags = var.tags
}
