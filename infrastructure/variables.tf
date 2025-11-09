variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
  default     = "point-cloud-annotator"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
  default     = "prod"
}

variable "s3_bucket_name" {
  description = "Name for the S3 bucket (must be globally unique)"
  type        = string
}

variable "enable_cloudfront" {
  description = "Enable CloudFront distribution for S3 bucket"
  type        = bool
  default     = false
}

