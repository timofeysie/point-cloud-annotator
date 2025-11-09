terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# DynamoDB Table
resource "aws_dynamodb_table" "annotations" {
  name           = "${var.project_name}-annotations"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "${var.project_name}-annotations"
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM Role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-lambda-role"
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM Policy for Lambda to access DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "${var.project_name}-lambda-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Resource = aws_dynamodb_table.annotations.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Archive Lambda functions
# Note: node_modules must be installed in each lambda directory before running terraform apply
data "archive_file" "get_annotations_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/get-annotations"
  output_path = "${path.module}/lambda-get-annotations.zip"
}

data "archive_file" "create_annotation_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/create-annotation"
  output_path = "${path.module}/lambda-create-annotation.zip"
}

data "archive_file" "delete_annotation_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/delete-annotation"
  output_path = "${path.module}/lambda-delete-annotation.zip"
}

# Lambda function: Get Annotations
resource "aws_lambda_function" "get_annotations" {
  filename         = data.archive_file.get_annotations_zip.output_path
  function_name    = "${var.project_name}-get-annotations"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.get_annotations_zip.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10
  memory_size     = 128

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.annotations.name
    }
  }

  tags = {
    Name        = "${var.project_name}-get-annotations"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Lambda function: Create Annotation
resource "aws_lambda_function" "create_annotation" {
  filename         = data.archive_file.create_annotation_zip.output_path
  function_name    = "${var.project_name}-create-annotation"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.create_annotation_zip.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10
  memory_size     = 128

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.annotations.name
    }
  }

  tags = {
    Name        = "${var.project_name}-create-annotation"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Lambda function: Delete Annotation
resource "aws_lambda_function" "delete_annotation" {
  filename         = data.archive_file.delete_annotation_zip.output_path
  function_name    = "${var.project_name}-delete-annotation"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.delete_annotation_zip.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10
  memory_size     = 128

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.annotations.name
    }
  }

  tags = {
    Name        = "${var.project_name}-delete-annotation"
    Environment = var.environment
    Project     = var.project_name
  }
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.project_name}-api"
  description = "API Gateway for Point Cloud Annotator"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = "${var.project_name}-api"
    Environment = var.environment
    Project     = var.project_name
  }
}

# API Gateway Resource: /annotations
resource "aws_api_gateway_resource" "annotations" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "annotations"
}

# API Gateway Resource: /annotations/{id}
resource "aws_api_gateway_resource" "annotation_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.annotations.id
  path_part   = "{id}"
}

# API Gateway Method: GET /annotations
resource "aws_api_gateway_method" "get_annotations" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.annotations.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_annotations" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.annotations.id
  http_method = aws_api_gateway_method.get_annotations.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_annotations.invoke_arn
}

# API Gateway Method: POST /annotations
resource "aws_api_gateway_method" "create_annotation" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.annotations.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "create_annotation" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.annotations.id
  http_method = aws_api_gateway_method.create_annotation.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.create_annotation.invoke_arn
}

# API Gateway Method: DELETE /annotations/{id}
resource "aws_api_gateway_method" "delete_annotation" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.annotation_id.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "delete_annotation" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.annotation_id.id
  http_method = aws_api_gateway_method.delete_annotation.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.delete_annotation.invoke_arn
}

# OPTIONS method for CORS: GET /annotations
resource "aws_api_gateway_method" "options_annotations" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.annotations.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_annotations" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.annotations.id
  http_method = aws_api_gateway_method.options_annotations.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_annotations" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.annotations.id
  http_method = aws_api_gateway_method.options_annotations.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "options_annotations" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.annotations.id
  http_method = aws_api_gateway_method.options_annotations.http_method
  status_code = aws_api_gateway_method_response.options_annotations.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

# OPTIONS method for CORS: DELETE /annotations/{id}
resource "aws_api_gateway_method" "options_annotation_id" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.annotation_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_annotation_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.annotation_id.id
  http_method = aws_api_gateway_method.options_annotation_id.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_annotation_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.annotation_id.id
  http_method = aws_api_gateway_method.options_annotation_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "options_annotation_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.annotation_id.id
  http_method = aws_api_gateway_method.options_annotation_id.http_method
  status_code = aws_api_gateway_method_response.options_annotation_id.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "get_annotations" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action       = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_annotations.function_name
  principal    = "apigateway.amazonaws.com"
  source_arn   = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "create_annotation" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action       = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_annotation.function_name
  principal    = "apigateway.amazonaws.com"
  source_arn   = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_annotation" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action       = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_annotation.function_name
  principal    = "apigateway.amazonaws.com"
  source_arn   = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "deployment" {
  depends_on = [
    aws_api_gateway_integration.get_annotations,
    aws_api_gateway_integration.create_annotation,
    aws_api_gateway_integration.delete_annotation,
    aws_api_gateway_integration.options_annotations,
    aws_api_gateway_integration.options_annotation_id,
  ]

  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = var.environment

  lifecycle {
    create_before_destroy = true
  }
}

# S3 Bucket for static website hosting
resource "aws_s3_bucket" "frontend" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = "${var.project_name}-frontend"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.frontend]
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration {
    status = "Enabled"
  }
}

# CloudFront Distribution (optional)
resource "aws_cloudfront_distribution" "frontend" {
  count = var.enable_cloudfront ? 1 : 0

  origin {
    domain_name = aws_s3_bucket_website_configuration.frontend.website_endpoint
    origin_id   = "S3-${aws_s3_bucket.frontend.bucket}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.bucket}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl             = 3600
    max_ttl                 = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "${var.project_name}-cloudfront"
    Environment = var.environment
    Project     = var.project_name
  }
}

