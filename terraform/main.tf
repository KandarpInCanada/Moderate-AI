# Get the current AWS account ID
data "aws_caller_identity" "current" {}

module "ecr" {
  source          = "./modules/ecr"
  repository_name = var.ecr_repository_name
  environment     = var.aws_environment
}

module "media_storage" {
  source      = "./modules/s3"
  bucket_name = var.s3_bucket_name
  environment = var.aws_environment
}

module "vpc" {
  source              = "./modules/vpc"
  name                = var.vpc_name
  vpc_cidr            = var.vpc_cidr
  public_subnet_cidrs = var.vpc_public_subnet_cidrs
  azs                 = var.vpc_azs
}
