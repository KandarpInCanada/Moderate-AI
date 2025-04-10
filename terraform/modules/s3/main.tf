# Simple S3 bucket for a small website's media storage

resource "aws_s3_bucket" "media_bucket" {
  bucket        = "${var.bucket_name}-${var.environment}"
  force_destroy = true
  tags = {
    Name        = "Media Storage - ${var.environment}"
    Environment = var.environment
  }
}

# Block public access to the bucket (security best practice)
resource "aws_s3_bucket_public_access_block" "media_bucket" {
  bucket = aws_s3_bucket.media_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable server-side encryption (security best practice)
resource "aws_s3_bucket_server_side_encryption_configuration" "media_bucket" {
  bucket = aws_s3_bucket.media_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CORS configuration for web access
resource "aws_s3_bucket_cors_configuration" "media_bucket" {
  bucket = aws_s3_bucket.media_bucket.id
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"] # You may want to restrict this in production
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
