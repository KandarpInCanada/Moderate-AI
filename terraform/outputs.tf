output "ecr_repository_url" {
  description = "The URL of the ECR repository"
  value       = module.ecr.repository_url
}

output "s3_bucket_name" {
  value = module.media_storage.bucket_id
}

output "s3_bucket_domain" {
  value = module.media_storage.bucket_domain_name
}
