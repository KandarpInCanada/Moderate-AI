# Get the current AWS account ID
data "aws_caller_identity" "current" {}

module "ecr" {
  source          = "./modules/ecr"
  repository_name = var.repository_name
  environment     = var.environment
}

module "media_storage" {
  source      = "./modules/s3"
  bucket_name = var.bucket_name
  environment = var.environment
}
