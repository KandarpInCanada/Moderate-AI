output "bucket_id" {
  description = "The name of the bucket"
  value       = aws_s3_bucket.media_bucket.id
}

output "bucket_arn" {
  description = "The ARN of the bucket"
  value       = aws_s3_bucket.media_bucket.arn
}

output "bucket_domain_name" {
  description = "The domain name of the bucket"
  value       = aws_s3_bucket.media_bucket.bucket_domain_name
}
