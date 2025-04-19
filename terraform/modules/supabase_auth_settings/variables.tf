variable "supabase_access_token" {
  type        = string
  description = "Supabase personal access token"
  sensitive   = true
}

variable "project_id" {
  type        = string
  description = "Supabase project ID"
}

variable "site_url" {
  type        = string
  description = "Primary site URL for authentication redirects"
}

variable "additional_redirect_urls" {
  type        = list(string)
  description = "Additional allowed redirect URLs"
  default     = []
}
