output "ecr_repository_url" {
  value = module.ecr.repository_url
}

output "s3_bucket_name" {
  value = module.media_storage.bucket_id
}

output "s3_bucket_domain" {
  value = module.media_storage.bucket_domain_name
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}
