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
  source               = "./modules/vpc"
  name                 = var.vpc_name
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.vpc_public_subnet_cidrs
  private_subnet_cidrs = var.vpc_private_subnet_cidrs
  azs                  = var.vpc_azs
}

module "ecs" {
  source                = "./modules/ecs"
  aws_region            = var.aws_region
  app_name              = var.app_name
  environment           = var.aws_environment
  tags                  = var.ecs_tags
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  public_subnet_ids     = module.vpc.public_subnet_ids
  ecr_repository_url    = module.ecr.repository_url
  s3_bucket_arn         = module.media_storage.bucket_arn
  task_cpu              = var.ecs_task_cpu
  task_memory           = var.ecs_task_memory
  container_name        = var.ecs_container_name
  container_port        = var.ecs_container_port
  container_image_tag   = var.ecs_container_image_tag
  container_environment = var.ecs_container_environment
  desired_count         = var.ecs_desired_count
  health_check_path     = var.ecs_health_check_path
}
