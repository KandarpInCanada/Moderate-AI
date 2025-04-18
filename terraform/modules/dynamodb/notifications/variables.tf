variable "notifications_table_name" {
  description = "Name of the Notifications DynamoDB table"
  type        = string
  default     = "Notifications"
}

variable "notifications_hash_key" {
  description = "Partition key for the Notifications table"
  type        = string
  default     = "UserId"
}

variable "notifications_hash_key_type" {
  description = "Type of the partition key (S | N | B)"
  type        = string
  default     = "S"
}

variable "notifications_range_key" {
  description = "Sort key for the Notifications table"
  type        = string
  default     = "NotificationId"
}

variable "notifications_range_key_type" {
  description = "Type of the sort key (S | N | B)"
  type        = string
  default     = "S"
}

variable "tags" {
  description = "Tags to apply to the table"
  type        = map(string)
  default     = {}
}
