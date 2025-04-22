![Next.js Badge](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=fff&style=flat-square)

### PhotoSense - AI-Powered Photo Organization

## Overview

PhotoSense is a cloud-native photo organization application that leverages AWS services and AI to automatically analyze, categorize, and organize your photos. The application uses AWS Rekognition to detect objects, faces, text, and locations in images, providing a smart and intuitive way to browse and search your photo collection. The entire application is deployed using a serverless architecture with AWS ECS Fargate and Lambda functions.

## Features

- **AI-Powered Photo Analysis**: Automatically detects objects, faces, text, and locations in your photos using AWS Rekognition
- **Smart Collections**: Dynamically creates collections based on people, locations, objects, and dates
- **Real-time Notifications**: Receive notifications when your photos are processed using AWS SQS
- **Secure Authentication**: Google OAuth integration via Supabase
- **Responsive UI**: Modern interface built with Next.js, Tailwind CSS, and shadcn/ui
- **Dark/Light Mode**: Fully customizable theme support
- **Cloud Storage**: Secure storage of photos in AWS S3
- **Fully Serverless Architecture**:

- Frontend and API deployed on AWS ECS Fargate
- Background processing with AWS Lambda
- No server management required

- **Infrastructure as Code**: Complete Terraform configuration for AWS resources

## Serverless Architecture

PhotoSense implements a fully serverless architecture using AWS services:

### ECS Fargate Deployment

The application frontend and API are deployed using AWS ECS Fargate, which provides:

- **Serverless Container Execution**: No EC2 instances to manage
- **Automatic Scaling**: Scales containers based on demand
- **Pay-per-use**: Only pay for the resources you consume
- **High Availability**: Deployed across multiple availability zones
- **Integrated Monitoring**: CloudWatch integration for logs and metrics

The ECS Fargate service is configured to:

- Run the Next.js application in containers
- Auto-scale based on CPU and memory utilization
- Distribute traffic through an Application Load Balancer
- Maintain high availability across multiple availability zones

## Technologies Used

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable UI components
- **Framer Motion**: Animations and transitions
- **SWR**: Data fetching and caching

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **AWS SDK for JavaScript**: Interact with AWS services
- **Supabase Auth**: Authentication and user management

### Infrastructure

- **AWS ECS Fargate**: Serverless container orchestration
- **AWS Lambda**: Serverless compute for image processing
- **Terraform**: Infrastructure as Code
- **AWS CloudFormation**: Resource provisioning
- **GitHub Actions**: CI/CD (optional)

## AWS Services

PhotoSense integrates the following AWS services:

- **ECS Fargate**: Serverless container orchestration for the web application
- **S3**: Storage for user-uploaded images
- **Lambda**: Serverless compute for image processing
- **Rekognition**: AI-powered image analysis
- **DynamoDB**: NoSQL database for image metadata and user data
- **SQS**: Message queue for notifications
- **IAM**: Identity and access management
- **CloudWatch**: Monitoring and logging
- **ECR**: Container registry for application deployment
- **Application Load Balancer**: Traffic distribution to ECS tasks
- **Auto Scaling**: Automatic scaling of ECS tasks based on demand

## Serverless Benefits in PhotoSense

The serverless architecture of PhotoSense provides several advantages:

1. **Cost Efficiency**: Pay only for the resources you use, with no idle capacity
2. **Automatic Scaling**: Handles traffic spikes without manual intervention
3. **High Availability**: Deployed across multiple availability zones
4. **Reduced Operational Overhead**: No server management or patching required
5. **Faster Development**: Focus on application code rather than infrastructure
6. **Built-in Security**: Managed security patches and updates

## Setup and Installation (For Beginners)

This section provides detailed instructions for setting up PhotoSense, even if you're not familiar with AWS or Terraform.

### Prerequisites

Before you begin, make sure you have:

1. **AWS Account**: Create one at [aws.amazon.com](https://aws.amazon.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org)
4. **Terraform**: Install from [terraform.io/downloads](https://terraform.io/downloads)
5. **AWS CLI**: Install from [aws.amazon.com/cli](https://aws.amazon.com/cli)
6. **Docker**: Install from [docker.com/get-started](https://docker.com/get-started)

### Step 1: Set Up Supabase Authentication

1. Create a new Supabase project
2. Go to Authentication → Providers → Google
3. Enable Google OAuth and configure with your Google Cloud credentials
4. Note your Supabase URL and anon key from Settings → API

### Step 2: Configure AWS Credentials

1. Create an IAM user with programmatic access and AdministratorAccess policy
2. Configure AWS CLI with your credentials:

```shellscript
aws configure
```

3. Enter your AWS Access Key ID, Secret Access Key, and preferred region (e.g., us-east-1)

### Step 3: Clone the Repository

```shellscript
git clone https://github.com/yourusername/photosense.git
cd photosense
```

### Step 4: Configure Terraform Variables

Create a `terraform.tfvars` file in the `terraform` directory with the following variables:

```plaintext
# Basic AWS Configuration
aws_region               = "us-east-1"                # Your preferred AWS region
aws_access_key           = "YOUR_AWS_ACCESS_KEY"      # Your AWS access key
aws_secret_key           = "YOUR_AWS_SECRET_KEY"      # Your AWS secret key
aws_account_id           = "123456789012"             # Your AWS account ID
aws_environment          = "prod"                     # Environment (prod, dev, etc.)

# Application Configuration
app_name                 = "photosense"               # Application name
ecr_repository_name      = "photo-sense"              # ECR repository name
s3_bucket_name           = "photosense-media"         # S3 bucket for storing images

# VPC Configuration
vpc_name                 = "photosense"               # VPC name
vpc_cidr                 = "10.0.0.0/16"              # VPC CIDR block
vpc_public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]  # Public subnet CIDR blocks
vpc_private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"] # Private subnet CIDR blocks
vpc_azs                  = ["us-east-1a", "us-east-1b"]     # Availability zones

# ECS Fargate Configuration
ecs_task_cpu             = 2048                       # CPU units (2 vCPU)
ecs_task_memory          = 4096                       # Memory in MB (4 GB)
ecs_container_name       = "photo-sense"              # Container name
ecs_container_port       = 3000                       # Container port
ecs_container_image_tag  = "v1.2.0"                   # Container image tag
ecs_desired_count        = 1                          # Initial number of tasks
ecs_health_check_path    = "/api/health"              # Health check endpoint

# Container Environment Variables
ecs_container_environment = [
  {
    name  = "NODE_ENV"
    value = "production"
  }
]

# DynamoDB Tables
image_metadata_dynamodb_table_name    = "ImageMetadata"
image_metadata_dynamodb_hash_key      = "ImageId"
image_metadata_dynamodb_hash_key_type = "S"
user_details_dynamodb_table_name      = "UserDetails"
user_details_dynamodb_hash_key        = "Email"
user_details_dynamodb_hash_key_type   = "S"
notifications_dynamodb_table_name     = "PhotoSense-Notifications"
notifications_dynamodb_hash_key       = "UserId"
notifications_dynamodb_hash_key_type  = "S"
notifications_dynamodb_range_key      = "NotificationId"
notifications_dynamodb_range_key_type = "S"

# Lambda Function Configuration
lambda_function_name                 = "s3-trigger-lambda"
lambda_function_handler_name         = "index.handler"
lambda_function_s3_folder_watch_name = "users/"
lambda_environment_vars = {
  DYNAMODB_TABLE_NAME      = "ImageMetadata"
  NOTIFICATIONS_TABLE_NAME = "PhotoSense-Notifications"
  SQS_QUEUE_PREFIX         = "user-notify-"
}

# Supabase Configuration
supabase_project_id   = "YOUR_SUPABASE_PROJECT_ID"
supabase_access_token = "YOUR_SUPABASE_ACCESS_TOKEN"

# Resource Tags
tags = {
  Project     = "PhotoSense"
  Application = "PhotoSense"
  Service     = "PhotoSenseService"
  Environment = "prod"
  Owner       = "DevOps"
  Team        = "Backend"
  Contact     = "your.email@example.com"
  ManagedBy   = "Terraform"
  Monitoring  = "enabled"
  Name        = "photo-sense"
}
```

### Step 5: Deploy Infrastructure with Terraform

1. Navigate to the terraform directory:

```shellscript
cd terraform
```

2. Initialize Terraform:

```shellscript
terraform init
```

3. Validate your configuration:

```shellscript
terraform validate
```

4. See what resources will be created:

```shellscript
terraform plan
```

5. Apply the Terraform configuration:

```shellscript
terraform apply
```

6. When prompted, type `yes` to confirm the deployment
7. Wait for the deployment to complete (this may take 10-15 minutes)

### Step 6: Configure Environment Variables for Local Development

Create a `.env.local` file in the root directory with the following variables:

```plaintext
# AWS Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_BUCKET_NAME=photosense-media
NEXT_PUBLIC_AWS_ACCOUNT_ID=123456789012
NEXT_AWS_ACCESS_KEY_ID=your-access-key
NEXT_AWS_SECRET_ACCESS_KEY=your-secret-key

# DynamoDB Tables
NEXT_PUBLIC_IMAGE_METADATA_DYNAMODB_TABLE_NAME=ImageMetadata
NEXT_PUBLIC_USER_DETAILS_DYNAMODB_TABLE_NAME=UserDetails
NEXT_PUBLIC_NOTIFICATIONS_DYNAMODB_TABLE_NAME=PhotoSense-Notifications

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Step 7: Run the Application Locally

1. Install dependencies:

```shellscript
npm install
```

2. Run the development server:

```shellscript
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Step 8: Build and Deploy the Container

1. Build the Docker image:

```shellscript
docker build -t photosense:latest .
```

2. Get the ECR login command:

```shellscript
aws ecr get-login-password --region us-east-1
```

3. Log in to ECR:

```shellscript
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
```

4. Tag and push the image:

```shellscript
docker tag photosense:latest ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/photo-sense:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/photo-sense:latest
```

5. Update the ECS service to use the new image:

```shellscript
aws ecs update-service --cluster photosense-prod --service photosense-prod --force-new-deployment
```

## Terraform Variables Explained

Here's a detailed explanation of each variable in the `terraform.tfvars` file:

### AWS Configuration

| Variable          | Description                                     | Example                 |
| ----------------- | ----------------------------------------------- | ----------------------- |
| `aws_region`      | The AWS region where resources will be deployed | `"us-east-1"`           |
| `aws_access_key`  | Your AWS access key for authentication          | `"YOUR_AWS_ACCESS_KEY"` |
| `aws_secret_key`  | Your AWS secret key for authentication          | `"YOUR_AWS_SECRET_KEY"` |
| `aws_account_id`  | Your 12-digit AWS account ID                    | `"YOUR_AWS_ACCOUNT_ID"` |
| `aws_environment` | Environment name (prod, dev, staging)           | `"prod"`                |

### Application Configuration

| Variable              | Description                                  | Example              |
| --------------------- | -------------------------------------------- | -------------------- |
| `app_name`            | Name of the application                      | `"photosense"`       |
| `ecr_repository_name` | Name of the ECR repository for Docker images | `"photo-sense"`      |
| `s3_bucket_name`      | Name of the S3 bucket for storing images     | `"photosense-media"` |

### VPC Configuration

| Variable                   | Description                     | Example                            |
| -------------------------- | ------------------------------- | ---------------------------------- |
| `vpc_name`                 | Name of the VPC                 | `"photosense"`                     |
| `vpc_cidr`                 | CIDR block for the VPC          | `"10.0.0.0/16"`                    |
| `vpc_public_subnet_cidrs`  | CIDR blocks for public subnets  | `["10.0.1.0/24", "10.0.2.0/24"]`   |
| `vpc_private_subnet_cidrs` | CIDR blocks for private subnets | `["10.0.10.0/24", "10.0.11.0/24"]` |
| `vpc_azs`                  | Availability zones for the VPC  | `["us-east-1a", "us-east-1b"]`     |

### ECS Fargate Configuration

| Variable                    | Description                                | Example               |
| --------------------------- | ------------------------------------------ | --------------------- |
| `ecs_task_cpu`              | CPU units for the ECS task (1024 = 1 vCPU) | `2048`                |
| `ecs_task_memory`           | Memory for the ECS task in MB              | `4096`                |
| `ecs_container_name`        | Name of the container                      | `"photo-sense"`       |
| `ecs_container_port`        | Port the container listens on              | `3000`                |
| `ecs_container_image_tag`   | Tag for the container image                | `"v1.2.0"`            |
| `ecs_desired_count`         | Initial number of tasks to run             | `1`                   |
| `ecs_health_check_path`     | Path for health checks                     | `"/api/health"`       |
| `ecs_container_environment` | Environment variables for the container    | See example in tfvars |

### DynamoDB Tables

| Variable                                | Description                           | Example                      |
| --------------------------------------- | ------------------------------------- | ---------------------------- |
| `image_metadata_dynamodb_table_name`    | Table name for image metadata         | `"ImageMetadata"`            |
| `image_metadata_dynamodb_hash_key`      | Primary key for image metadata table  | `"ImageId"`                  |
| `image_metadata_dynamodb_hash_key_type` | Type of primary key (S=String)        | `"S"`                        |
| `user_details_dynamodb_table_name`      | Table name for user details           | `"UserDetails"`              |
| `user_details_dynamodb_hash_key`        | Primary key for user details table    | `"Email"`                    |
| `user_details_dynamodb_hash_key_type`   | Type of primary key (S=String)        | `"S"`                        |
| `notifications_dynamodb_table_name`     | Table name for notifications          | `"PhotoSense-Notifications"` |
| `notifications_dynamodb_hash_key`       | Partition key for notifications table | `"UserId"`                   |
| `notifications_dynamodb_hash_key_type`  | Type of partition key (S=String)      | `"S"`                        |
| `notifications_dynamodb_range_key`      | Sort key for notifications table      | `"NotificationId"`           |
| `notifications_dynamodb_range_key_type` | Type of sort key (S=String)           | `"S"`                        |

### Lambda Function Configuration

| Variable                               | Description                      | Example               |
| -------------------------------------- | -------------------------------- | --------------------- |
| `lambda_function_name`                 | Name of the Lambda function      | `"s3-trigger-lambda"` |
| `lambda_function_handler_name`         | Handler function name            | `"index.handler"`     |
| `lambda_function_s3_folder_watch_name` | S3 folder to watch for triggers  | `"users/"`            |
| `lambda_environment_vars`              | Environment variables for Lambda | See example in tfvars |

### Supabase Configuration

| Variable                | Description                | Example                        |
| ----------------------- | -------------------------- | ------------------------------ |
| `supabase_project_id`   | Your Supabase project ID   | `"YOUR_SUPABASE_PROJECT_ID"`   |
| `supabase_access_token` | Your Supabase access token | `"YOUR_SUPABASE_ACCESS_TOKEN"` |

## Troubleshooting

### Common Issues and Solutions

#### AWS Credentials Issues

- **Problem**: "Unable to locate credentials" error
- **Solution**: Run `aws configure` and enter your AWS credentials

#### Terraform Errors

- **Problem**: "Error: No valid credential sources found"
- **Solution**: Ensure AWS credentials are properly configured with `aws configure`
- **Problem**: "Error: Error creating S3 bucket: BucketAlreadyExists"
- **Solution**: Choose a different, globally unique S3 bucket name in your terraform.tfvars

#### Docker Build Issues

- **Problem**: "Error: Cannot connect to the Docker daemon"
- **Solution**: Ensure Docker is running with `docker info`

#### ECS Deployment Issues

- **Problem**: "Service is unable to place a task"
- **Solution**: Check that your VPC, subnets, and security groups are properly configured

#### Supabase Authentication Issues

- **Problem**: "Error: Invalid login credentials"
- **Solution**: Verify your Supabase URL and anon key in environment variables

### Getting Help

If you encounter issues not covered here:

1. Check the AWS CloudWatch logs for error messages
2. Review the Terraform state with `terraform state list` and `terraform state show [resource]`
3. Check the ECS service events with `aws ecs describe-services --cluster photosense-prod --services photosense-prod`
4. Open an issue on the GitHub repository with detailed error information

## Usage Guide

### User Flow

1. **Authentication**: Sign in with Google OAuth
2. **Upload**: Upload photos to your personal folder
3. **Processing**: AWS Lambda processes the images using Rekognition
4. **Notification**: Receive notifications when processing is complete
5. **Browse**: Browse photos by collections, search, or filter
6. **View Details**: View detailed AI analysis of each photo

### API Endpoints

PhotoSense provides the following API endpoints:

- **GET /api/images**: Retrieve user's images with metadata
- **POST /api/upload**: Generate pre-signed URLs for S3 uploads
- **GET /api/notifications**: Retrieve user notifications
- **POST /api/notifications/poll**: Poll for new notifications
- **DELETE /api/notifications**: Delete a notification
- **GET /api/metadata/aggregate**: Get aggregated metadata for filters
- **GET /api/health**: Health check endpoint
- **POST /api/users**: Store user details in DynamoDB

## Monitoring and Maintenance

### CloudWatch Monitoring

1. Navigate to AWS CloudWatch console
2. Check the following logs:

3. ECS task logs: `/ecs/photosense-prod`
4. Lambda function logs: `/aws/lambda/s3-trigger-lambda`

### Updating the Application

1. Make changes to the code
2. Build and push a new Docker image
3. Update the ECS service with the new image:

```shellscript
aws ecs update-service --cluster photosense-prod --service photosense-prod --force-new-deployment
```

### Scaling the Application

The application automatically scales based on CPU and memory utilization. You can modify the scaling parameters in the Terraform configuration:

```terraform
# In terraform/modules/ecs/main.tf
resource "aws_appautoscaling_policy" "cpu" {
  # Modify target_value to change the CPU threshold for scaling
  target_value = 70.0
}
```

## Future Improvements

- **Face Recognition**: Implement face recognition to group photos by person
- **Mobile App**: Develop a companion mobile application
- **Sharing Capabilities**: Allow users to share collections with others
- **Advanced Search**: Implement natural language search for photos
- **Batch Processing**: Add support for batch uploads and processing
- **Export/Backup**: Allow users to export or backup their collections
- **Custom AI Models**: Train custom models for improved categorization
- **Multi-Region Deployment**: Deploy to multiple AWS regions for lower latency
- **Enhanced Auto-Scaling**: Implement predictive scaling based on usage patterns

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## About the Developer

PhotoSense was developed as a final term project for a cloud computing course. The project demonstrates proficiency in serverless cloud architecture, container orchestration with ECS Fargate, AI integration with AWS Rekognition, and modern web development with Next.js.

This generation may require the following integrations:

Please make sure to add the following environment variables to your project:
