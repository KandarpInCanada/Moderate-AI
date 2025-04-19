data "aws_caller_identity" "current" {}

# Lambda Execution Role
resource "aws_iam_role" "lambda_exec" {
  name = "${var.lambda_function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = var.tags
}

#######################
# Policy: CloudWatch Logs
#######################
resource "aws_iam_policy" "cloudwatch_logs" {
  name        = "${var.lambda_function_name}-logs-policy"
  description = "Allow writing logs to CloudWatch"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      Resource = "*"
    }]
  })
}

#######################
# Policy: Rekognition
#######################
resource "aws_iam_policy" "rekognition_access" {
  name        = "${var.lambda_function_name}-rekognition-policy"
  description = "Allow using all necessary Rekognition operations"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = [
        "rekognition:DetectLabels",
        "rekognition:DetectFaces",
        "rekognition:DetectText",
        "rekognition:RecognizeCelebrities",
        "rekognition:DetectModerationLabels"
      ],
      Resource = "*"
    }]
  })
}

#######################
# Policy: DynamoDB
#######################
resource "aws_iam_policy" "dynamodb_access" {
  name        = "${var.lambda_function_name}-dynamodb-policy"
  description = "Allow writing to DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      Resource = [
        "arn:aws:dynamodb:${var.region}:${data.aws_caller_identity.current.account_id}:table/${var.image_metadata_dynamodb_table_name}",
        "arn:aws:dynamodb:${var.region}:${data.aws_caller_identity.current.account_id}:table/${var.notification_dynamodb_table_name}"
      ]
    }]
  })
}

resource "aws_iam_policy" "s3_access" {
  name        = "${var.lambda_function_name}-s3-policy"
  description = "Allow Lambda to read images from S3"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetBucketLocation",
          "s3:ListBucket"
        ],
        Resource = [
          "arn:aws:s3:::${var.s3_bucket}",
          "arn:aws:s3:::${var.s3_bucket}/*"
        ]
      }
    ]
  })
}

#######################
# Policy: SNS (New)
#######################
resource "aws_iam_policy" "sns_access" {
  name        = "${var.lambda_function_name}-sns-policy"
  description = "Allow creating and managing SNS topics and subscriptions"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "sns:CreateTopic",
          "sns:GetTopicAttributes",
          "sns:SetTopicAttributes",
          "sns:DeleteTopic",
          "sns:ListTopics",
          "sns:Subscribe",
          "sns:Unsubscribe",
          "sns:Publish",
          "sns:ListSubscriptions",
          "sns:ListSubscriptionsByTopic"
        ],
        Resource = "*"
      }
    ]
  })
}

########################
# Attach All Policies
########################
resource "aws_iam_role_policy_attachment" "attach_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.cloudwatch_logs.arn
}

resource "aws_iam_role_policy_attachment" "attach_rekognition" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.rekognition_access.arn
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}

resource "aws_iam_role_policy_attachment" "attach_s3" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.s3_access.arn
}

resource "aws_iam_role_policy_attachment" "attach_sns" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.sns_access.arn
}
