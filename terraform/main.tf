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

module "image_metadata_dynamodb" {
  source                       = "./modules/dynamodb/image_metadata"
  image_metadata_table_name    = var.image_metadata_dynamodb_table_name
  image_metadata_hash_key      = var.image_metadata_dynamodb_hash_key
  image_metadata_hash_key_type = var.image_metadata_dynamodb_hash_key_type
  tags                         = var.tags
}

module "user_details_dynamodb" {
  source                     = "./modules/dynamodb/user_details"
  user_table_name            = var.user_details_dynamodb_table_name
  user_details_hash_key      = var.user_details_dynamodb_hash_key
  user_details_hash_key_type = var.user_details_dynamodb_hash_key_type
  tags                       = var.tags
}

module "notifications_dynamodb" {
  source                       = "./modules/dynamodb/notifications"
  notifications_table_name     = var.notifications_dynamodb_table_name
  notifications_hash_key       = var.notifications_dynamodb_hash_key
  notifications_hash_key_type  = var.notifications_dynamodb_hash_key_type
  notifications_range_key      = var.notifications_dynamodb_range_key
  notifications_range_key_type = var.notifications_dynamodb_range_key_type
  tags                         = var.tags
}

module "ecs_iam" {
  source        = "./modules/iam/ecs_iam"
  name_prefix   = "${var.app_name}-${var.aws_environment}"
  tags          = var.tags
  s3_bucket_arn = module.media_storage.bucket_arn
}

module "lambda_iam_role" {
  source               = "./modules/iam/lambda_iam"
  lambda_function_name = var.lambda_function_name
  dynamodb_table_name  = var.image_metadata_dynamodb_table_name
  s3_bucket            = module.media_storage.bucket_id
  region               = var.aws_region
  tags                 = var.tags
  depends_on           = [module.media_storage]
}

module "lambda_s3_trigger" {
  source               = "./modules/lambda_s3_trigger"
  lambda_function_name = var.lambda_function_name
  lambda_role_arn      = module.lambda_iam_role.lambda_exec_arn
  lambda_handler       = var.lambda_function_handler_name
  lambda_runtime       = "python3.9"
  s3_bucket            = module.media_storage.bucket_id
  s3_prefix            = var.lambda_function_s3_folder_watch_name
  tags                 = var.tags
  environment_vars     = var.lambda_environment_vars
  depends_on           = [module.media_storage]
}


module "ecs" {
  source                 = "./modules/ecs"
  aws_region             = var.aws_region
  app_name               = var.app_name
  environment            = var.aws_environment
  tags                   = var.tags
  vpc_id                 = module.vpc.vpc_id
  private_subnet_ids     = module.vpc.private_subnet_ids
  public_subnet_ids      = module.vpc.public_subnet_ids
  ecr_repository_url     = module.ecr.repository_url
  s3_bucket_arn          = module.media_storage.bucket_arn
  task_cpu               = var.ecs_task_cpu
  task_memory            = var.ecs_task_memory
  container_name         = var.ecs_container_name
  container_port         = var.ecs_container_port
  container_image_tag    = var.ecs_container_image_tag
  container_environment  = var.ecs_container_environment
  desired_count          = var.ecs_desired_count
  health_check_path      = var.ecs_health_check_path
  ecs_execution_role_arn = module.ecs_iam.execution_role_arn
  ecs_task_role_arn      = module.ecs_iam.task_role_arn
}
