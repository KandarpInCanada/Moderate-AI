# Simple ECR Repository

resource "aws_ecr_repository" "repository" {
  name                 = "${var.repository_name}-${var.environment}"
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  tags = {
    Name        = "${var.repository_name}-${var.environment}"
    Environment = var.environment
  }
}

# Basic lifecycle policy to clean up old images
resource "aws_ecr_lifecycle_policy" "repository" {
  repository = aws_ecr_repository.repository.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
