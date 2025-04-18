variable "user_table_name" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "hash_key" {
  description = "Partition key for the table"
  type        = string
}

variable "hash_key_type" {
  description = "Type of the partition key (S | N | B)"
  type        = string
  default     = "S"
}

variable "tags" {
  description = "Tags to apply to the table"
  type        = map(string)
  default     = {}
}
