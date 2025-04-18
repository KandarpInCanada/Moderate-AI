resource "aws_dynamodb_table" "this" {
  name         = var.image_metadata_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = var.image_metadata_hash_key
  attribute {
    name = var.image_metadata_hash_key
    type = var.image_metadata_hash_key_type
  }
  tags = var.tags
}
