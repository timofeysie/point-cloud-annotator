# Work log

```bash
aws --version
aws-cli/2.31.37 Python/3.13.9 Darwin/24.6.0 source/arm64
terraform --version
timo@Timothys-MacBook-Pro AI for Devs book % terraform --version
Terraform v1.5.7
on darwin_arm64
Your version of Terraform is out of date! The latest version
is 1.13.5. You can update by downloading from https://www.terraform.io/downloads.html
terraform init
cd infrastructure
terraform init

Initializing the backend...

Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Finding hashicorp/archive versions matching "~> 2.4"...
- Installing hashicorp/aws v5.100.0...
- Installed hashicorp/aws v5.100.0 (signed by HashiCorp)
- Installing hashicorp/archive v2.7.1...
- Installed hashicorp/archive v2.7.1 (signed by HashiCorp)

Terraform has created a lock file .terraform.lock.hcl to record the provider
selections it made above. Include this file in your version control repository
so that Terraform can guarantee to make the same selections by default when
you run "terraform init" in the future.

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.

timo@Timothys-MacBook-Pro infrastructure % terraform plan
data.archive_file.create_annotation_zip: Reading...
data.archive_file.delete_annotation_zip: Reading...
data.archive_file.get_annotations_zip: Reading...
data.archive_file.create_annotation_zip: Read complete after 1s [id=a862508e5d27f9477e9c21727621c779b42b2abb]
data.archive_file.delete_annotation_zip: Read complete after 1s [id=21e7dd010592b850e5bd1893ef18775d2008dce9]
data.archive_file.get_annotations_zip: Read complete after 1s [id=e4b9747fb455d24eb5f8351247d51b17799c8a29]

Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # aws_api_gateway_deployment.deployment will be created
  + resource "aws_api_gateway_deployment" "deployment" {
      + created_date  = (known after apply)
      + execution_arn = (known after apply)
      + id            = (known after apply)
      + invoke_url    = (known after apply)
      + rest_api_id   = (known after apply)
      + stage_name    = "prod"
    }

  # aws_api_gateway_integration.create_annotation will be created
  + resource "aws_api_gateway_integration" "create_annotation" {
      + cache_namespace         = (known after apply)
      + connection_type         = "INTERNET"
      + http_method             = "POST"
      + id                      = (known after apply)
      + integration_http_method = "POST"
      + passthrough_behavior    = (known after apply)
      + resource_id             = (known after apply)
      + rest_api_id             = (known after apply)
      + timeout_milliseconds    = 29000
      + type                    = "AWS_PROXY"
      + uri                     = (known after apply)
    }

  # aws_api_gateway_integration.delete_annotation will be created
  + resource "aws_api_gateway_integration" "delete_annotation" {
      + cache_namespace         = (known after apply)
      + connection_type         = "INTERNET"
      + http_method             = "DELETE"
      + id                      = (known after apply)
      + integration_http_method = "POST"
      + passthrough_behavior    = (known after apply)
      + resource_id             = (known after apply)
      + rest_api_id             = (known after apply)
      + timeout_milliseconds    = 29000
      + type                    = "AWS_PROXY"
      + uri                     = (known after apply)
    }

  # aws_api_gateway_integration.get_annotations will be created
  + resource "aws_api_gateway_integration" "get_annotations" {
      + cache_namespace         = (known after apply)
      + connection_type         = "INTERNET"
      + http_method             = "GET"
      + id                      = (known after apply)
      + integration_http_method = "POST"
      + passthrough_behavior    = (known after apply)
      + resource_id             = (known after apply)
      + rest_api_id             = (known after apply)
      + timeout_milliseconds    = 29000
      + type                    = "AWS_PROXY"
      + uri                     = (known after apply)
    }

  # aws_api_gateway_integration.options_annotation_id will be created
  + resource "aws_api_gateway_integration" "options_annotation_id" {
      + cache_namespace      = (known after apply)
      + connection_type      = "INTERNET"
      + http_method          = "OPTIONS"
      + id                   = (known after apply)
      + passthrough_behavior = (known after apply)
      + request_templates    = {
          + "application/json" = jsonencode(
                {
                  + statusCode = 200
                }
            )
        }
      + resource_id          = (known after apply)
      + rest_api_id          = (known after apply)
      + timeout_milliseconds = 29000
      + type                 = "MOCK"
    }

  # aws_api_gateway_integration.options_annotations will be created
  + resource "aws_api_gateway_integration" "options_annotations" {
      + cache_namespace      = (known after apply)
      + connection_type      = "INTERNET"
      + http_method          = "OPTIONS"
      + id                   = (known after apply)
      + passthrough_behavior = (known after apply)
      + request_templates    = {
          + "application/json" = jsonencode(
                {
                  + statusCode = 200
                }
            )
        }
      + resource_id          = (known after apply)
      + rest_api_id          = (known after apply)
      + timeout_milliseconds = 29000
      + type                 = "MOCK"
    }

  # aws_api_gateway_integration_response.options_annotation_id will be created
  + resource "aws_api_gateway_integration_response" "options_annotation_id" {
      + http_method         = "OPTIONS"
      + id                  = (known after apply)
      + resource_id         = (known after apply)
      + response_parameters = {
          + "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
          + "method.response.header.Access-Control-Allow-Methods" = "'DELETE,OPTIONS'"
          + "method.response.header.Access-Control-Allow-Origin"  = "'*'"
        }
      + rest_api_id         = (known after apply)
      + status_code         = "200"
    }

  # aws_api_gateway_integration_response.options_annotations will be created
  + resource "aws_api_gateway_integration_response" "options_annotations" {
      + http_method         = "OPTIONS"
      + id                  = (known after apply)
      + resource_id         = (known after apply)
      + response_parameters = {
          + "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
          + "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
          + "method.response.header.Access-Control-Allow-Origin"  = "'*'"
        }
      + rest_api_id         = (known after apply)
      + status_code         = "200"
    }

  # aws_api_gateway_method.create_annotation will be created
  + resource "aws_api_gateway_method" "create_annotation" {
      + api_key_required = false
      + authorization    = "NONE"
      + http_method      = "POST"
      + id               = (known after apply)
      + resource_id      = (known after apply)
      + rest_api_id      = (known after apply)
    }

  # aws_api_gateway_method.delete_annotation will be created
  + resource "aws_api_gateway_method" "delete_annotation" {
      + api_key_required = false
      + authorization    = "NONE"
      + http_method      = "DELETE"
      + id               = (known after apply)
      + resource_id      = (known after apply)
      + rest_api_id      = (known after apply)
    }

  # aws_api_gateway_method.get_annotations will be created
  + resource "aws_api_gateway_method" "get_annotations" {
      + api_key_required = false
      + authorization    = "NONE"
      + http_method      = "GET"
      + id               = (known after apply)
      + resource_id      = (known after apply)
      + rest_api_id      = (known after apply)
    }

  # aws_api_gateway_method.options_annotation_id will be created
  + resource "aws_api_gateway_method" "options_annotation_id" {
      + api_key_required = false
      + authorization    = "NONE"
      + http_method      = "OPTIONS"
      + id               = (known after apply)
      + resource_id      = (known after apply)
      + rest_api_id      = (known after apply)
    }

  # aws_api_gateway_method.options_annotations will be created
  + resource "aws_api_gateway_method" "options_annotations" {
      + api_key_required = false
      + authorization    = "NONE"
      + http_method      = "OPTIONS"
      + id               = (known after apply)
      + resource_id      = (known after apply)
      + rest_api_id      = (known after apply)
    }

  # aws_api_gateway_method_response.options_annotation_id will be created
  + resource "aws_api_gateway_method_response" "options_annotation_id" {
      + http_method         = "OPTIONS"
      + id                  = (known after apply)
      + resource_id         = (known after apply)
      + response_parameters = {
          + "method.response.header.Access-Control-Allow-Headers" = true
          + "method.response.header.Access-Control-Allow-Methods" = true
          + "method.response.header.Access-Control-Allow-Origin"  = true
        }
      + rest_api_id         = (known after apply)
      + status_code         = "200"
    }

  # aws_api_gateway_method_response.options_annotations will be created
  + resource "aws_api_gateway_method_response" "options_annotations" {
      + http_method         = "OPTIONS"
      + id                  = (known after apply)
      + resource_id         = (known after apply)
      + response_parameters = {
          + "method.response.header.Access-Control-Allow-Headers" = true
          + "method.response.header.Access-Control-Allow-Methods" = true
          + "method.response.header.Access-Control-Allow-Origin"  = true
        }
      + rest_api_id         = (known after apply)
      + status_code         = "200"
    }

  # aws_api_gateway_resource.annotation_id will be created
  + resource "aws_api_gateway_resource" "annotation_id" {
      + id          = (known after apply)
      + parent_id   = (known after apply)
      + path        = (known after apply)
      + path_part   = "{id}"
      + rest_api_id = (known after apply)
    }

  # aws_api_gateway_resource.annotations will be created
  + resource "aws_api_gateway_resource" "annotations" {
      + id          = (known after apply)
      + parent_id   = (known after apply)
      + path        = (known after apply)
      + path_part   = "annotations"
      + rest_api_id = (known after apply)
    }

  # aws_api_gateway_rest_api.api will be created
  + resource "aws_api_gateway_rest_api" "api" {
      + api_key_source               = (known after apply)
      + arn                          = (known after apply)
      + binary_media_types           = (known after apply)
      + created_date                 = (known after apply)
      + description                  = "API Gateway for Point Cloud Annotator"
      + disable_execute_api_endpoint = (known after apply)
      + execution_arn                = (known after apply)
      + id                           = (known after apply)
      + minimum_compression_size     = (known after apply)
      + name                         = "point-cloud-annotator-api"
      + policy                       = (known after apply)
      + root_resource_id             = (known after apply)
      + tags                         = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-api"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all                     = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-api"
          + "Project"     = "point-cloud-annotator"
        }

      + endpoint_configuration {
          + ip_address_type  = (known after apply)
          + types            = [
              + "REGIONAL",
            ]
          + vpc_endpoint_ids = (known after apply)
        }
    }

  # aws_dynamodb_table.annotations will be created
  + resource "aws_dynamodb_table" "annotations" {
      + arn              = (known after apply)
      + billing_mode     = "PAY_PER_REQUEST"
      + hash_key         = "id"
      + id               = (known after apply)
      + name             = "point-cloud-annotator-annotations"
      + read_capacity    = (known after apply)
      + stream_arn       = (known after apply)
      + stream_label     = (known after apply)
      + stream_view_type = (known after apply)
      + tags             = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-annotations"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all         = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-annotations"
          + "Project"     = "point-cloud-annotator"
        }
      + write_capacity   = (known after apply)

      + attribute {
          + name = "id"
          + type = "S"
        }

      + point_in_time_recovery {
          + enabled                 = true
          + recovery_period_in_days = (known after apply)
        }
    }

  # aws_iam_role.lambda_role will be created
  + resource "aws_iam_role" "lambda_role" {
      + arn                   = (known after apply)
      + assume_role_policy    = jsonencode(
            {
              + Statement = [
                  + {
                      + Action    = "sts:AssumeRole"
                      + Effect    = "Allow"
                      + Principal = {
                          + Service = "lambda.amazonaws.com"
                        }
                    },
                ]
              + Version   = "2012-10-17"
            }
        )
      + create_date           = (known after apply)
      + force_detach_policies = false
      + id                    = (known after apply)
      + managed_policy_arns   = (known after apply)
      + max_session_duration  = 3600
      + name                  = "point-cloud-annotator-lambda-role"
      + name_prefix           = (known after apply)
      + path                  = "/"
      + tags                  = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-lambda-role"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all              = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-lambda-role"
          + "Project"     = "point-cloud-annotator"
        }
      + unique_id             = (known after apply)
    }

  # aws_iam_role_policy.lambda_dynamodb_policy will be created
  + resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
      + id          = (known after apply)
      + name        = "point-cloud-annotator-lambda-dynamodb-policy"
      + name_prefix = (known after apply)
      + policy      = (known after apply)
      + role        = (known after apply)
    }

  # aws_lambda_function.create_annotation will be created
  + resource "aws_lambda_function" "create_annotation" {
      + architectures                  = (known after apply)
      + arn                            = (known after apply)
      + code_sha256                    = (known after apply)
      + filename                       = "./lambda-create-annotation.zip"
      + function_name                  = "point-cloud-annotator-create-annotation"
      + handler                        = "index.handler"
      + id                             = (known after apply)
      + invoke_arn                     = (known after apply)
      + last_modified                  = (known after apply)
      + memory_size                    = 128
      + package_type                   = "Zip"
      + publish                        = false
      + qualified_arn                  = (known after apply)
      + qualified_invoke_arn           = (known after apply)
      + reserved_concurrent_executions = -1
      + role                           = (known after apply)
      + runtime                        = "nodejs20.x"
      + signing_job_arn                = (known after apply)
      + signing_profile_version_arn    = (known after apply)
      + skip_destroy                   = false
      + source_code_hash               = "0piW4gqrbG7NaTET2xY2IrbdT6VpuMvBuuRf7M2+6+A="
      + source_code_size               = (known after apply)
      + tags                           = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-create-annotation"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all                       = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-create-annotation"
          + "Project"     = "point-cloud-annotator"
        }
      + timeout                        = 10
      + version                        = (known after apply)

      + environment {
          + variables = {
              + "TABLE_NAME" = "point-cloud-annotator-annotations"
            }
        }
    }

  # aws_lambda_function.delete_annotation will be created
  + resource "aws_lambda_function" "delete_annotation" {
      + architectures                  = (known after apply)
      + arn                            = (known after apply)
      + code_sha256                    = (known after apply)
      + filename                       = "./lambda-delete-annotation.zip"
      + function_name                  = "point-cloud-annotator-delete-annotation"
      + handler                        = "index.handler"
      + id                             = (known after apply)
      + invoke_arn                     = (known after apply)
      + last_modified                  = (known after apply)
      + memory_size                    = 128
      + package_type                   = "Zip"
      + publish                        = false
      + qualified_arn                  = (known after apply)
      + qualified_invoke_arn           = (known after apply)
      + reserved_concurrent_executions = -1
      + role                           = (known after apply)
      + runtime                        = "nodejs20.x"
      + signing_job_arn                = (known after apply)
      + signing_profile_version_arn    = (known after apply)
      + skip_destroy                   = false
      + source_code_hash               = "SdLDtODn28d2bXBguk/PAXZABbcNy2qbMD6RmSsKOm8="
      + source_code_size               = (known after apply)
      + tags                           = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-delete-annotation"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all                       = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-delete-annotation"
          + "Project"     = "point-cloud-annotator"
        }
      + timeout                        = 10
      + version                        = (known after apply)

      + environment {
          + variables = {
              + "TABLE_NAME" = "point-cloud-annotator-annotations"
            }
        }
    }

  # aws_lambda_function.get_annotations will be created
  + resource "aws_lambda_function" "get_annotations" {
      + architectures                  = (known after apply)
      + arn                            = (known after apply)
      + code_sha256                    = (known after apply)
      + filename                       = "./lambda-get-annotations.zip"
      + function_name                  = "point-cloud-annotator-get-annotations"
      + handler                        = "index.handler"
      + id                             = (known after apply)
      + invoke_arn                     = (known after apply)
      + last_modified                  = (known after apply)
      + memory_size                    = 128
      + package_type                   = "Zip"
      + publish                        = false
      + qualified_arn                  = (known after apply)
      + qualified_invoke_arn           = (known after apply)
      + reserved_concurrent_executions = -1
      + role                           = (known after apply)
      + runtime                        = "nodejs20.x"
      + signing_job_arn                = (known after apply)
      + signing_profile_version_arn    = (known after apply)
      + skip_destroy                   = false
      + source_code_hash               = "l+7TPhSAlsgnv14SHN6lVgfF2EQ4KfM+LjCpPcloWrE="
      + source_code_size               = (known after apply)
      + tags                           = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-get-annotations"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all                       = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-get-annotations"
          + "Project"     = "point-cloud-annotator"
        }
      + timeout                        = 10
      + version                        = (known after apply)

      + environment {
          + variables = {
              + "TABLE_NAME" = "point-cloud-annotator-annotations"
            }
        }
    }

  # aws_lambda_permission.create_annotation will be created
  + resource "aws_lambda_permission" "create_annotation" {
      + action              = "lambda:InvokeFunction"
      + function_name       = "point-cloud-annotator-create-annotation"
      + id                  = (known after apply)
      + principal           = "apigateway.amazonaws.com"
      + source_arn          = (known after apply)
      + statement_id        = "AllowExecutionFromAPIGateway"
      + statement_id_prefix = (known after apply)
    }

  # aws_lambda_permission.delete_annotation will be created
  + resource "aws_lambda_permission" "delete_annotation" {
      + action              = "lambda:InvokeFunction"
      + function_name       = "point-cloud-annotator-delete-annotation"
      + id                  = (known after apply)
      + principal           = "apigateway.amazonaws.com"
      + source_arn          = (known after apply)
      + statement_id        = "AllowExecutionFromAPIGateway"
      + statement_id_prefix = (known after apply)
    }

  # aws_lambda_permission.get_annotations will be created
  + resource "aws_lambda_permission" "get_annotations" {
      + action              = "lambda:InvokeFunction"
      + function_name       = "point-cloud-annotator-get-annotations"
      + id                  = (known after apply)
      + principal           = "apigateway.amazonaws.com"
      + source_arn          = (known after apply)
      + statement_id        = "AllowExecutionFromAPIGateway"
      + statement_id_prefix = (known after apply)
    }

  # aws_s3_bucket.frontend will be created
  + resource "aws_s3_bucket" "frontend" {
      + acceleration_status         = (known after apply)
      + acl                         = (known after apply)
      + arn                         = (known after apply)
      + bucket                      = "point-cloud-annotator-232723"
      + bucket_domain_name          = (known after apply)
      + bucket_prefix               = (known after apply)
      + bucket_regional_domain_name = (known after apply)
      + force_destroy               = false
      + hosted_zone_id              = (known after apply)
      + id                          = (known after apply)
      + object_lock_enabled         = (known after apply)
      + policy                      = (known after apply)
      + region                      = (known after apply)
      + request_payer               = (known after apply)
      + tags                        = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-frontend"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all                    = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-frontend"
          + "Project"     = "point-cloud-annotator"
        }
      + website_domain              = (known after apply)
      + website_endpoint            = (known after apply)
    }

  # aws_s3_bucket_policy.frontend will be created
  + resource "aws_s3_bucket_policy" "frontend" {
      + bucket = (known after apply)
      + id     = (known after apply)
      + policy = (known after apply)
    }

  # aws_s3_bucket_public_access_block.frontend will be created
  + resource "aws_s3_bucket_public_access_block" "frontend" {
      + block_public_acls       = false
      + block_public_policy     = false
      + bucket                  = (known after apply)
      + id                      = (known after apply)
      + ignore_public_acls      = false
      + restrict_public_buckets = false
    }

  # aws_s3_bucket_versioning.frontend will be created
  + resource "aws_s3_bucket_versioning" "frontend" {
      + bucket = (known after apply)
      + id     = (known after apply)

      + versioning_configuration {
          + mfa_delete = (known after apply)
          + status     = "Enabled"
        }
    }

  # aws_s3_bucket_website_configuration.frontend will be created
  + resource "aws_s3_bucket_website_configuration" "frontend" {
      + bucket           = (known after apply)
      + id               = (known after apply)
      + routing_rules    = (known after apply)
      + website_domain   = (known after apply)
      + website_endpoint = (known after apply)

      + error_document {
          + key = "index.html"
        }

      + index_document {
          + suffix = "index.html"
        }
    }

Plan: 32 to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + api_gateway_url            = (known after apply)
  + dynamodb_table_name        = "point-cloud-annotator-annotations"
  + s3_bucket_name             = "point-cloud-annotator-232723"
  + s3_website_endpoint        = (known after apply)
╷
│ Warning: Argument is deprecated
│ 
│   with aws_api_gateway_deployment.deployment,
│   on main.tf line 400, in resource "aws_api_gateway_deployment" "deployment":
│  400:   stage_name  = var.environment
│ 
│ stage_name is deprecated. Use the aws_api_gateway_stage resource instead.
╵

──────────────────────────────────────────────────────────────────────────────────

Note: You didn't use the -out option to save this plan, so Terraform can't
guarantee to take exactly these actions if you run "terraform apply" now.


timo@Timothys-MacBook-Pro infrastructure % terraform apply   
data.archive_file.get_annotations_zip: Reading...
data.archive_file.create_annotation_zip: Reading...
data.archive_file.delete_annotation_zip: Reading...
data.archive_file.create_annotation_zip: Read complete after 0s [id=a862508e5d27f9477e9c21727621c779b42b2abb]
data.archive_file.delete_annotation_zip: Read complete after 0s [id=21e7dd010592b850e5bd1893ef18775d2008dce9]
data.archive_file.get_annotations_zip: Read complete after 0s [id=e4b9747fb455d24eb5f8351247d51b17799c8a29]

Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # aws_api_gateway_deployment.deployment will be created
  + resource "aws_api_gateway_deployment" "deployment" {
      + created_date  = (known after apply)
      + execution_arn = (known after apply)
      + id            = (known after apply)
      + invoke_url    = (known after apply)
      + rest_api_id   = (known after apply)
      + stage_name    = "prod"
    }

  # aws_api_gateway_integration.create_annotation will be created
  + resource "aws_api_gateway_integration" "create_annotation" {
      + cache_namespace         = (known after apply)
      + connection_type         = "INTERNET"
      + http_method             = "POST"
      + id                      = (known after apply)
      + integration_http_method = "POST"
      + passthrough_behavior    = (known after apply)
      + resource_id             = (known after apply)
      + rest_api_id             = (known after apply)
      + timeout_milliseconds    = 29000
      + type                    = "AWS_PROXY"
      + uri                     = (known after apply)
    }

  # aws_api_gateway_integration.delete_annotation will be created
  + resource "aws_api_gateway_integration" "delete_annotation" {
      + cache_namespace         = (known after apply)
      + connection_type         = "INTERNET"
      + http_method             = "DELETE"
      + id                      = (known after apply)
      + integration_http_method = "POST"
      + passthrough_behavior    = (known after apply)
      + resource_id             = (known after apply)
      + rest_api_id             = (known after apply)
      + timeout_milliseconds    = 29000
      + type                    = "AWS_PROXY"
      + uri                     = (known after apply)
    }

  # aws_api_gateway_integration.get_annotations will be created
  + resource "aws_api_gateway_integration" "get_annotations" {
      + cache_namespace         = (known after apply)
      + connection_type         = "INTERNET"
      + http_method             = "GET"
      + id                      = (known after apply)
      + integration_http_method = "POST"
      + passthrough_behavior    = (known after apply)
      + resource_id             = (known after apply)
      + rest_api_id             = (known after apply)
      + timeout_milliseconds    = 29000
      + type                    = "AWS_PROXY"
      + uri                     = (known after apply)
    }

  # aws_api_gateway_integration.options_annotation_id will be created
  + resource "aws_api_gateway_integration" "options_annotation_id" {
      + cache_namespace      = (known after apply)
      + connection_type      = "INTERNET"
      + http_method          = "OPTIONS"
      + id                   = (known after apply)
      + passthrough_behavior = (known after apply)
      + request_templates    = {
          + "application/json" = jsonencode(
                {
                  + statusCode = 200
                }
            )
        }
      + resource_id          = (known after apply)
      + rest_api_id          = (known after apply)
      + timeout_milliseconds = 29000
      + type                 = "MOCK"
    }

  # aws_api_gateway_integration.options_annotations will be created
  + resource "aws_api_gateway_integration" "options_annotations" {
      + cache_namespace      = (known after apply)
      + connection_type      = "INTERNET"
      + http_method          = "OPTIONS"
      + id                   = (known after apply)
      + passthrough_behavior = (known after apply)
      + request_templates    = {
          + "application/json" = jsonencode(
                {
                  + statusCode = 200
                }
            )
        }
      + resource_id          = (known after apply)
      + rest_api_id          = (known after apply)
      + timeout_milliseconds = 29000
      + type                 = "MOCK"
    }

  # aws_api_gateway_integration_response.options_annotation_id will be created
  + resource "aws_api_gateway_integration_response" "options_annotation_id" {
      + http_method         = "OPTIONS"
      + id                  = (known after apply)
      + resource_id         = (known after apply)
      + response_parameters = {
          + "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
          + "method.response.header.Access-Control-Allow-Methods" = "'DELETE,OPTIONS'"
          + "method.response.header.Access-Control-Allow-Origin"  = "'*'"
        }
      + rest_api_id         = (known after apply)
      + status_code         = "200"
    }

  # aws_api_gateway_integration_response.options_annotations will be created
  + resource "aws_api_gateway_integration_response" "options_annotations" {
      + http_method         = "OPTIONS"
      + id                  = (known after apply)
      + resource_id         = (known after apply)
      + response_parameters = {
          + "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
          + "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
          + "method.response.header.Access-Control-Allow-Origin"  = "'*'"
        }
      + rest_api_id         = (known after apply)
      + status_code         = "200"
    }

  # aws_api_gateway_method.create_annotation will be created
  + resource "aws_api_gateway_method" "create_annotation" {
      + api_key_required = false
      + authorization    = "NONE"
      + http_method      = "POST"
      + id               = (known after apply)
      + resource_id      = (known after apply)
      + rest_api_id      = (known after apply)
    }

  # aws_api_gateway_method.delete_annotation will be created
  + resource "aws_api_gateway_method" "delete_annotation" {
      + api_key_required = false
      + authorization    = "NONE"
      + http_method      = "DELETE"
      + id               = (known after apply)
      + resource_id      = (known after apply)
      + rest_api_id      = (known after apply)
    }

  # aws_api_gateway_method.get_annotations will be created
  + resource "aws_api_gateway_method" "get_annotations" {
      + api_key_required = false
      + authorization    = "NONE"
      + http_method      = "GET"
      + id               = (known after apply)
      + resource_id      = (known after apply)
      + rest_api_id      = (known after apply)
    }

  # aws_api_gateway_method.options_annotation_id will be created
  + resource "aws_api_gateway_method" "options_annotation_id" {
      + api_key_required = false
      + authorization    = "NONE"
      + http_method      = "OPTIONS"
      + id               = (known after apply)
      + resource_id      = (known after apply)
      + rest_api_id      = (known after apply)
    }

  # aws_api_gateway_method.options_annotations will be created
  + resource "aws_api_gateway_method" "options_annotations" {
      + api_key_required = false
      + authorization    = "NONE"
      + http_method      = "OPTIONS"
      + id               = (known after apply)
      + resource_id      = (known after apply)
      + rest_api_id      = (known after apply)
    }

  # aws_api_gateway_method_response.options_annotation_id will be created
  + resource "aws_api_gateway_method_response" "options_annotation_id" {
      + http_method         = "OPTIONS"
      + id                  = (known after apply)
      + resource_id         = (known after apply)
      + response_parameters = {
          + "method.response.header.Access-Control-Allow-Headers" = true
          + "method.response.header.Access-Control-Allow-Methods" = true
          + "method.response.header.Access-Control-Allow-Origin"  = true
        }
      + rest_api_id         = (known after apply)
      + status_code         = "200"
    }

  # aws_api_gateway_method_response.options_annotations will be created
  + resource "aws_api_gateway_method_response" "options_annotations" {
      + http_method         = "OPTIONS"
      + id                  = (known after apply)
      + resource_id         = (known after apply)
      + response_parameters = {
          + "method.response.header.Access-Control-Allow-Headers" = true
          + "method.response.header.Access-Control-Allow-Methods" = true
          + "method.response.header.Access-Control-Allow-Origin"  = true
        }
      + rest_api_id         = (known after apply)
      + status_code         = "200"
    }

  # aws_api_gateway_resource.annotation_id will be created
  + resource "aws_api_gateway_resource" "annotation_id" {
      + id          = (known after apply)
      + parent_id   = (known after apply)
      + path        = (known after apply)
      + path_part   = "{id}"
      + rest_api_id = (known after apply)
    }

  # aws_api_gateway_resource.annotations will be created
  + resource "aws_api_gateway_resource" "annotations" {
      + id          = (known after apply)
      + parent_id   = (known after apply)
      + path        = (known after apply)
      + path_part   = "annotations"
      + rest_api_id = (known after apply)
    }

  # aws_api_gateway_rest_api.api will be created
  + resource "aws_api_gateway_rest_api" "api" {
      + api_key_source               = (known after apply)
      + arn                          = (known after apply)
      + binary_media_types           = (known after apply)
      + created_date                 = (known after apply)
      + description                  = "API Gateway for Point Cloud Annotator"
      + disable_execute_api_endpoint = (known after apply)
      + execution_arn                = (known after apply)
      + id                           = (known after apply)
      + minimum_compression_size     = (known after apply)
      + name                         = "point-cloud-annotator-api"
      + policy                       = (known after apply)
      + root_resource_id             = (known after apply)
      + tags                         = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-api"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all                     = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-api"
          + "Project"     = "point-cloud-annotator"
        }

      + endpoint_configuration {
          + ip_address_type  = (known after apply)
          + types            = [
              + "REGIONAL",
            ]
          + vpc_endpoint_ids = (known after apply)
        }
    }

  # aws_dynamodb_table.annotations will be created
  + resource "aws_dynamodb_table" "annotations" {
      + arn              = (known after apply)
      + billing_mode     = "PAY_PER_REQUEST"
      + hash_key         = "id"
      + id               = (known after apply)
      + name             = "point-cloud-annotator-annotations"
      + read_capacity    = (known after apply)
      + stream_arn       = (known after apply)
      + stream_label     = (known after apply)
      + stream_view_type = (known after apply)
      + tags             = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-annotations"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all         = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-annotations"
          + "Project"     = "point-cloud-annotator"
        }
      + write_capacity   = (known after apply)

      + attribute {
          + name = "id"
          + type = "S"
        }

      + point_in_time_recovery {
          + enabled                 = true
          + recovery_period_in_days = (known after apply)
        }
    }

  # aws_iam_role.lambda_role will be created
  + resource "aws_iam_role" "lambda_role" {
      + arn                   = (known after apply)
      + assume_role_policy    = jsonencode(
            {
              + Statement = [
                  + {
                      + Action    = "sts:AssumeRole"
                      + Effect    = "Allow"
                      + Principal = {
                          + Service = "lambda.amazonaws.com"
                        }
                    },
                ]
              + Version   = "2012-10-17"
            }
        )
      + create_date           = (known after apply)
      + force_detach_policies = false
      + id                    = (known after apply)
      + managed_policy_arns   = (known after apply)
      + max_session_duration  = 3600
      + name                  = "point-cloud-annotator-lambda-role"
      + name_prefix           = (known after apply)
      + path                  = "/"
      + tags                  = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-lambda-role"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all              = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-lambda-role"
          + "Project"     = "point-cloud-annotator"
        }
      + unique_id             = (known after apply)
    }

  # aws_iam_role_policy.lambda_dynamodb_policy will be created
  + resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
      + id          = (known after apply)
      + name        = "point-cloud-annotator-lambda-dynamodb-policy"
      + name_prefix = (known after apply)
      + policy      = (known after apply)
      + role        = (known after apply)
    }

  # aws_lambda_function.create_annotation will be created
  + resource "aws_lambda_function" "create_annotation" {
      + architectures                  = (known after apply)
      + arn                            = (known after apply)
      + code_sha256                    = (known after apply)
      + filename                       = "./lambda-create-annotation.zip"
      + function_name                  = "point-cloud-annotator-create-annotation"
      + handler                        = "index.handler"
      + id                             = (known after apply)
      + invoke_arn                     = (known after apply)
      + last_modified                  = (known after apply)
      + memory_size                    = 128
      + package_type                   = "Zip"
      + publish                        = false
      + qualified_arn                  = (known after apply)
      + qualified_invoke_arn           = (known after apply)
      + reserved_concurrent_executions = -1
      + role                           = (known after apply)
      + runtime                        = "nodejs20.x"
      + signing_job_arn                = (known after apply)
      + signing_profile_version_arn    = (known after apply)
      + skip_destroy                   = false
      + source_code_hash               = "0piW4gqrbG7NaTET2xY2IrbdT6VpuMvBuuRf7M2+6+A="
      + source_code_size               = (known after apply)
      + tags                           = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-create-annotation"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all                       = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-create-annotation"
          + "Project"     = "point-cloud-annotator"
        }
      + timeout                        = 10
      + version                        = (known after apply)

      + environment {
          + variables = {
              + "TABLE_NAME" = "point-cloud-annotator-annotations"
            }
        }
    }

  # aws_lambda_function.delete_annotation will be created
  + resource "aws_lambda_function" "delete_annotation" {
      + architectures                  = (known after apply)
      + arn                            = (known after apply)
      + code_sha256                    = (known after apply)
      + filename                       = "./lambda-delete-annotation.zip"
      + function_name                  = "point-cloud-annotator-delete-annotation"
      + handler                        = "index.handler"
      + id                             = (known after apply)
      + invoke_arn                     = (known after apply)
      + last_modified                  = (known after apply)
      + memory_size                    = 128
      + package_type                   = "Zip"
      + publish                        = false
      + qualified_arn                  = (known after apply)
      + qualified_invoke_arn           = (known after apply)
      + reserved_concurrent_executions = -1
      + role                           = (known after apply)
      + runtime                        = "nodejs20.x"
      + signing_job_arn                = (known after apply)
      + signing_profile_version_arn    = (known after apply)
      + skip_destroy                   = false
      + source_code_hash               = "SdLDtODn28d2bXBguk/PAXZABbcNy2qbMD6RmSsKOm8="
      + source_code_size               = (known after apply)
      + tags                           = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-delete-annotation"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all                       = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-delete-annotation"
          + "Project"     = "point-cloud-annotator"
        }
      + timeout                        = 10
      + version                        = (known after apply)

      + environment {
          + variables = {
              + "TABLE_NAME" = "point-cloud-annotator-annotations"
            }
        }
    }

  # aws_lambda_function.get_annotations will be created
  + resource "aws_lambda_function" "get_annotations" {
      + architectures                  = (known after apply)
      + arn                            = (known after apply)
      + code_sha256                    = (known after apply)
      + filename                       = "./lambda-get-annotations.zip"
      + function_name                  = "point-cloud-annotator-get-annotations"
      + handler                        = "index.handler"
      + id                             = (known after apply)
      + invoke_arn                     = (known after apply)
      + last_modified                  = (known after apply)
      + memory_size                    = 128
      + package_type                   = "Zip"
      + publish                        = false
      + qualified_arn                  = (known after apply)
      + qualified_invoke_arn           = (known after apply)
      + reserved_concurrent_executions = -1
      + role                           = (known after apply)
      + runtime                        = "nodejs20.x"
      + signing_job_arn                = (known after apply)
      + signing_profile_version_arn    = (known after apply)
      + skip_destroy                   = false
      + source_code_hash               = "l+7TPhSAlsgnv14SHN6lVgfF2EQ4KfM+LjCpPcloWrE="
      + source_code_size               = (known after apply)
      + tags                           = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-get-annotations"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all                       = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-get-annotations"
          + "Project"     = "point-cloud-annotator"
        }
      + timeout                        = 10
      + version                        = (known after apply)

      + environment {
          + variables = {
              + "TABLE_NAME" = "point-cloud-annotator-annotations"
            }
        }
    }

  # aws_lambda_permission.create_annotation will be created
  + resource "aws_lambda_permission" "create_annotation" {
      + action              = "lambda:InvokeFunction"
      + function_name       = "point-cloud-annotator-create-annotation"
      + id                  = (known after apply)
      + principal           = "apigateway.amazonaws.com"
      + source_arn          = (known after apply)
      + statement_id        = "AllowExecutionFromAPIGateway"
      + statement_id_prefix = (known after apply)
    }

  # aws_lambda_permission.delete_annotation will be created
  + resource "aws_lambda_permission" "delete_annotation" {
      + action              = "lambda:InvokeFunction"
      + function_name       = "point-cloud-annotator-delete-annotation"
      + id                  = (known after apply)
      + principal           = "apigateway.amazonaws.com"
      + source_arn          = (known after apply)
      + statement_id        = "AllowExecutionFromAPIGateway"
      + statement_id_prefix = (known after apply)
    }

  # aws_lambda_permission.get_annotations will be created
  + resource "aws_lambda_permission" "get_annotations" {
      + action              = "lambda:InvokeFunction"
      + function_name       = "point-cloud-annotator-get-annotations"
      + id                  = (known after apply)
      + principal           = "apigateway.amazonaws.com"
      + source_arn          = (known after apply)
      + statement_id        = "AllowExecutionFromAPIGateway"
      + statement_id_prefix = (known after apply)
    }

  # aws_s3_bucket.frontend will be created
  + resource "aws_s3_bucket" "frontend" {
      + acceleration_status         = (known after apply)
      + acl                         = (known after apply)
      + arn                         = (known after apply)
      + bucket                      = "point-cloud-annotator-232723"
      + bucket_domain_name          = (known after apply)
      + bucket_prefix               = (known after apply)
      + bucket_regional_domain_name = (known after apply)
      + force_destroy               = false
      + hosted_zone_id              = (known after apply)
      + id                          = (known after apply)
      + object_lock_enabled         = (known after apply)
      + policy                      = (known after apply)
      + region                      = (known after apply)
      + request_payer               = (known after apply)
      + tags                        = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-frontend"
          + "Project"     = "point-cloud-annotator"
        }
      + tags_all                    = {
          + "Environment" = "prod"
          + "Name"        = "point-cloud-annotator-frontend"
          + "Project"     = "point-cloud-annotator"
        }
      + website_domain              = (known after apply)
      + website_endpoint            = (known after apply)
    }

  # aws_s3_bucket_policy.frontend will be created
  + resource "aws_s3_bucket_policy" "frontend" {
      + bucket = (known after apply)
      + id     = (known after apply)
      + policy = (known after apply)
    }

  # aws_s3_bucket_public_access_block.frontend will be created
  + resource "aws_s3_bucket_public_access_block" "frontend" {
      + block_public_acls       = false
      + block_public_policy     = false
      + bucket                  = (known after apply)
      + id                      = (known after apply)
      + ignore_public_acls      = false
      + restrict_public_buckets = false
    }

  # aws_s3_bucket_versioning.frontend will be created
  + resource "aws_s3_bucket_versioning" "frontend" {
      + bucket = (known after apply)
      + id     = (known after apply)

      + versioning_configuration {
          + mfa_delete = (known after apply)
          + status     = "Enabled"
        }
    }

  # aws_s3_bucket_website_configuration.frontend will be created
  + resource "aws_s3_bucket_website_configuration" "frontend" {
      + bucket           = (known after apply)
      + id               = (known after apply)
      + routing_rules    = (known after apply)
      + website_domain   = (known after apply)
      + website_endpoint = (known after apply)

      + error_document {
          + key = "index.html"
        }

      + index_document {
          + suffix = "index.html"
        }
    }

Plan: 32 to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + api_gateway_url            = (known after apply)
  + dynamodb_table_name        = "point-cloud-annotator-annotations"
  + s3_bucket_name             = "point-cloud-annotator-232723"
  + s3_website_endpoint        = (known after apply)
╷
│ Warning: Argument is deprecated
│ 
│   with aws_api_gateway_deployment.deployment,
│   on main.tf line 400, in resource "aws_api_gateway_deployment" "deployment":
│  400:   stage_name  = var.environment
│ 
│ stage_name is deprecated. Use the aws_api_gateway_stage resource instead.
╵

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value:  yes

aws_iam_role.lambda_role: Creating...
aws_api_gateway_rest_api.api: Creating...
aws_dynamodb_table.annotations: Creating...
aws_s3_bucket.frontend: Creating...
aws_api_gateway_rest_api.api: Creation complete after 1s [id=w6wxmcp64f]
aws_api_gateway_resource.annotations: Creating...
aws_iam_role.lambda_role: Creation complete after 1s [id=point-cloud-annotator-lambda-role]
aws_api_gateway_resource.annotations: Creation complete after 1s [id=u9shu2]
aws_api_gateway_resource.annotation_id: Creating...
aws_api_gateway_method.create_annotation: Creating...
aws_api_gateway_method.get_annotations: Creating...
aws_api_gateway_method.options_annotations: Creating...
aws_api_gateway_method.create_annotation: Creation complete after 0s [id=agm-w6wxmcp64f-u9shu2-POST]
aws_api_gateway_method.get_annotations: Creation complete after 0s [id=agm-w6wxmcp64f-u9shu2-GET]
aws_api_gateway_method.options_annotations: Creation complete after 0s [id=agm-w6wxmcp64f-u9shu2-OPTIONS]
aws_api_gateway_method_response.options_annotations: Creating...
aws_api_gateway_integration.options_annotations: Creating...
aws_api_gateway_resource.annotation_id: Creation complete after 0s [id=nvf27r]
aws_api_gateway_method.options_annotation_id: Creating...
aws_api_gateway_method.delete_annotation: Creating...
aws_api_gateway_method_response.options_annotations: Creation complete after 0s [id=agmr-w6wxmcp64f-u9shu2-OPTIONS-200]
aws_api_gateway_integration_response.options_annotations: Creating...
aws_api_gateway_method.delete_annotation: Creation complete after 0s [id=agm-w6wxmcp64f-nvf27r-DELETE]
aws_api_gateway_integration.options_annotations: Creation complete after 0s [id=agi-w6wxmcp64f-u9shu2-OPTIONS]
aws_api_gateway_method.options_annotation_id: Creation complete after 1s [id=agm-w6wxmcp64f-nvf27r-OPTIONS]
aws_api_gateway_method_response.options_annotation_id: Creating...
aws_api_gateway_integration.options_annotation_id: Creating...
aws_api_gateway_integration_response.options_annotations: Creation complete after 1s [id=agir-w6wxmcp64f-u9shu2-OPTIONS-200]
aws_api_gateway_method_response.options_annotation_id: Creation complete after 0s [id=agmr-w6wxmcp64f-nvf27r-OPTIONS-200]
aws_api_gateway_integration_response.options_annotation_id: Creating...
aws_api_gateway_integration.options_annotation_id: Creation complete after 0s [id=agi-w6wxmcp64f-nvf27r-OPTIONS]
aws_api_gateway_integration_response.options_annotation_id: Creation complete after 0s [id=agir-w6wxmcp64f-nvf27r-OPTIONS-200]
aws_s3_bucket.frontend: Creation complete after 6s [id=point-cloud-annotator-232723]
aws_s3_bucket_public_access_block.frontend: Creating...
aws_s3_bucket_versioning.frontend: Creating...
aws_s3_bucket_website_configuration.frontend: Creating...
aws_s3_bucket_public_access_block.frontend: Creation complete after 1s [id=point-cloud-annotator-232723]
aws_s3_bucket_policy.frontend: Creating...
aws_s3_bucket_website_configuration.frontend: Creation complete after 1s [id=point-cloud-annotator-232723]
aws_s3_bucket_policy.frontend: Creation complete after 1s [id=point-cloud-annotator-232723]
aws_s3_bucket_versioning.frontend: Creation complete after 2s [id=point-cloud-annotator-232723]
aws_dynamodb_table.annotations: Still creating... [10s elapsed]
aws_dynamodb_table.annotations: Creation complete after 16s [id=point-cloud-annotator-annotations]
aws_iam_role_policy.lambda_dynamodb_policy: Creating...
aws_lambda_function.create_annotation: Creating...
aws_lambda_function.get_annotations: Creating...
aws_lambda_function.delete_annotation: Creating...
aws_iam_role_policy.lambda_dynamodb_policy: Creation complete after 1s [id=point-cloud-annotator-lambda-role:point-cloud-annotator-lambda-dynamodb-policy]
aws_lambda_function.create_annotation: Creation complete after 10s [id=point-cloud-annotator-create-annotation]
aws_api_gateway_integration.create_annotation: Creating...
aws_lambda_permission.create_annotation: Creating...
aws_lambda_function.get_annotations: Still creating... [10s elapsed]
aws_lambda_function.delete_annotation: Still creating... [10s elapsed]
aws_api_gateway_integration.create_annotation: Creation complete after 1s [id=agi-w6wxmcp64f-u9shu2-POST]
aws_lambda_permission.create_annotation: Creation complete after 1s [id=AllowExecutionFromAPIGateway]
aws_lambda_function.get_annotations: Creation complete after 18s [id=point-cloud-annotator-get-annotations]
aws_api_gateway_integration.get_annotations: Creating...
aws_lambda_permission.get_annotations: Creating...
aws_api_gateway_integration.get_annotations: Creation complete after 1s [id=agi-w6wxmcp64f-u9shu2-GET]
aws_lambda_permission.get_annotations: Creation complete after 1s [id=AllowExecutionFromAPIGateway]
aws_lambda_function.delete_annotation: Still creating... [20s elapsed]
aws_lambda_function.delete_annotation: Creation complete after 26s [id=point-cloud-annotator-delete-annotation]
aws_lambda_permission.delete_annotation: Creating...
aws_api_gateway_integration.delete_annotation: Creating...
aws_lambda_permission.delete_annotation: Creation complete after 1s [id=AllowExecutionFromAPIGateway]
aws_api_gateway_integration.delete_annotation: Creation complete after 1s [id=agi-w6wxmcp64f-nvf27r-DELETE]
aws_api_gateway_deployment.deployment: Creating...
aws_api_gateway_deployment.deployment: Creation complete after 0s [id=tv21hm]
╷
│ Warning: Argument is deprecated
│ 
│   with aws_api_gateway_deployment.deployment,
│   on main.tf line 400, in resource "aws_api_gateway_deployment" "deployment":
│  400:   stage_name  = var.environment
│ 
│ stage_name is deprecated. Use the aws_api_gateway_stage resource instead.
╵

Apply complete! Resources: 32 added, 0 changed, 0 destroyed.

Outputs:

api_gateway_url = "https://w6wxmcp64f.execute-api.us-east-1.amazonaws.com/prod"
dynamodb_table_name = "point-cloud-annotator-annotations"
s3_bucket_name = "point-cloud-annotator-232723"
s3_website_endpoint = "point-cloud-annotator-232723.s3-website-us-east-1.amazonaws.com"
```

```sh
timo@Timothys-MacBook-Pro infrastructure % terraform output api_gateway_url
"https://w6wxmcp64f.execute-api.us-east-1.amazonaws.com/prod"
cd ..
echo "VITE_API_GATEWAY_URL=$(cd infrastructure && terraform output -raw api_gateway_url)" > .env
```

```sh
timo@Timothys-MacBook-Pro point-cloud-annotator-main % npm run build

> vite-react-typescript-starter@0.0.0 build
> vite build

vite v5.4.8 building for production...
transforming (1) index.htmlBrowserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
✓ 1759 modules transformed.
dist/index.html                     0.48 kB │ gzip:   0.31 kB
dist/assets/index-CJKApB37.css     10.18 kB │ gzip:   2.62 kB
dist/assets/index-Db6s2SUu.js   1,496.88 kB │ gzip: 435.05 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 2.21s
```

```sh
timo@Timothys-MacBook-Pro infrastructure % terraform output s3_website_endpoint
"point-cloud-annotator-232723.s3-website-us-east-1.amazonaws.com"
```

```sh
timo@Timothys-MacBook-Pro point-cloud-annotator-main % git status
On branch develop
Your branch is up to date with 'origin/develop'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   docs/DEPLOYMENT_STEPS.md
        new file:   docs/WORK_LOG.md
        new file:   infrastructure/.terraform.lock.hcl
        new file:   infrastructure/.terraform/providers/registry.terraform.io/hashicorp/archive/2.7.1/darwin_arm64/LICENSE.txt
        new file:   infrastructure/.terraform/providers/registry.terraform.io/hashicorp/archive/2.7.1/darwin_arm64/terraform-provider-archive_v2.7.1_x5
        new file:   infrastructure/.terraform/providers/registry.terraform.io/hashicorp/aws/5.100.0/darwin_arm64/LICENSE.txt
        new file:   infrastructure/.terraform/providers/registry.terraform.io/hashicorp/aws/5.100.0/darwin_arm64/terraform-provider-aws_v5.100.0_x5
        new file:   infrastructure/lambda-create-annotation.zip
        new file:   infrastructure/lambda-delete-annotation.zip
        new file:   infrastructure/lambda-get-annotations.zip
        new file:   infrastructure/terraform.tfstate
        new file:   infrastructure/terraform.tfvars
        new file:   lambda/create-annotation/package-lock.json
        new file:   lambda/delete-annotation/package-lock.json
        new file:   lambda/get-annotations/package-lock.json
        new file:   scripts/deploy-s3.sh
        modified:   src/components/PotreeViewer.tsx

timo@Timothys-MacBook-Pro point-cloud-annotator-main % git commit -m "deployment steps compl
ete via terraform but still seeing point cloud loading issue"
[develop 3c16a60] deployment steps complete via terraform but still seeing point cloud loading issue
 17 files changed, 7938 insertions(+), 14 deletions(-)
 create mode 100644 docs/DEPLOYMENT_STEPS.md
 create mode 100644 docs/WORK_LOG.md
 create mode 100644 infrastructure/.terraform.lock.hcl
 create mode 100644 infrastructure/.terraform/providers/registry.terraform.io/hashicorp/archive/2.7.1/darwin_arm64/LICENSE.txt
 create mode 100755 infrastructure/.terraform/providers/registry.terraform.io/hashicorp/archive/2.7.1/darwin_arm64/terraform-provider-archive_v2.7.1_x5
 create mode 100644 infrastructure/.terraform/providers/registry.terraform.io/hashicorp/aws/5.100.0/darwin_arm64/LICENSE.txt
 create mode 100755 infrastructure/.terraform/providers/registry.terraform.io/hashicorp/aws/5.100.0/darwin_arm64/terraform-provider-aws_v5.100.0_x5
 create mode 100644 infrastructure/lambda-create-annotation.zip
 create mode 100644 infrastructure/lambda-delete-annotation.zip
 create mode 100644 infrastructure/lambda-get-annotations.zip
 create mode 100644 infrastructure/terraform.tfstate
 create mode 100644 infrastructure/terraform.tfvars
 create mode 100644 lambda/create-annotation/package-lock.json
 create mode 100644 lambda/delete-annotation/package-lock.json
 create mode 100644 lambda/get-annotations/package-lock.json
 create mode 100755 scripts/deploy-s3.sh
timo@Timothys-MacBook-Pro point-cloud-annotator-main % git push
Enumerating objects: 48, done.
Counting objects: 100% (48/48), done.
Delta compression using up to 12 threads
Compressing objects: 100% (28/28), done.
Writing objects: 100% (37/37), 143.43 MiB | 1.08 MiB/s, done.
Total 37 (delta 8), reused 1 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (8/8), completed with 4 local objects.
remote: error: Trace: 290cd6651b6dae0f52e462622fd59e84baf833f81b2eeb3ffd4213157f816c81
remote: error: See https://gh.io/lfs for more information.
remote: error: File infrastructure/.terraform/providers/registry.terraform.io/hashicorp/aws/5.100.0/darwin_arm64/terraform-provider-aws_v5.100.0_x5 is 648.39 MB; this exceeds GitHub's file size limit of 100.00 MB
remote: error: GH001: Large files detected. You may want to try Git Large File Storage - https://git-lfs.github.com.
To https://github.com/timofeysie/point-cloud-annotator.git
 ! [remote rejected] develop -> develop (pre-receive hook declined)
error: failed to push some refs to 'https://github.com/ti...
```

The .terraform directory contains downloaded provider binaries and shouldn't be committed. The .terraform directory (provider binaries) is tracked, but it shouldn't be. These are large, platform-specific, and regenerated by terraform init.

Prompt:
After that, there is no change in the situation.  The message displayed in the deployed app is still "Point cloud not loaded. This is expected in development - potree-loader has limitations with local files. The point cloud will work once deployed to S3. You can still test annotation functionality."  I doubt your assessment about the potree loader.  Lets go back to working locally with the sample clpud and fix this issue. 

I notice this example code 
https://github.com/potree/potree/blob/develop/examples/lion.html 
When viewed on this page:
https://potree.org/potree/examples/lion 
Works as expected.
We need to start from this working sample but in a react setting.  Lets start over and make this sample work in this app.

It would be nice if we could keep some of the existing code, so we can try these answers first:
	1. keep the annotation functionality for now.
	2. For the working example approach, should we: c) Create a new simplified component alongside the existing one for comparison
	3. the mock point cloud should not be needed and signifies failure and can exist in the repo

With that plan, we still see the "Failed to load point cloud: Error: Unsupported file type
    at PotreeViewer.tsx:75:12" error again.
So lets go with the other options to the pan:
1. a) Start with a minimal React component that mirrors the working example exactly, then integrate annotations




```
Minimal component: Loading point cloud: {name: 'lion', url: '/pointclouds/lion_takanawa/cloud.json'}
installHook.js:1 ✗ Minimal component: Failed to load point cloud: Error: Unsupported file type
    at _Potree.loadPointCloud (potree-loader.js?v=5a2ca2d1:26592:11)
    at PotreeViewerMinimal.tsx:61:12
    at commitHookEffectListMount (react-dom_client.js?v=5a2ca2d1:16915:34)
    at commitPassiveMountOnFiber (react-dom_client.js?v=5a2ca2d1:18156:19)
    at commitPassiveMountEffects_complete (react-dom_client.js?v=5a2ca2d1:18129:17)
    at commitPassiveMountEffects_begin (react-dom_client.js?v=5a2ca2d1:18119:15)
    at commitPassiveMountEffects (react-dom_client.js?v=5a2ca2d1:18109:11)
    at flushPassiveEffectsImpl (react-dom_client.js?v=5a2ca2d1:19490:11)
    at flushPassiveEffects (react-dom_client.js?v=5a2ca2d1:19447:22)
    at react-dom_client.js?v=5a2ca2d1:19328:17
overrideMethod @ installHook.js:1
(anonymous) @ PotreeViewerMinimal.tsx:91
Promise.catch
(anonymous) @ PotreeViewerMinimal.tsx:90
commitHookEffectListMount @ react-dom_client.js?v=5a2ca2d1:16915
commitPassiveMountOnFiber @ react-dom_client.js?v=5a2ca2d1:18156
commitPassiveMountEffects_complete @ react-dom_client.js?v=5a2ca2d1:18129
commitPassiveMountEffects_begin @ react-dom_client.js?v=5a2ca2d1:18119
commitPassiveMountEffects @ react-dom_client.js?v=5a2ca2d1:18109
flushPassiveEffectsImpl @ react-dom_client.js?v=5a2ca2d1:19490
flushPassiveEffects @ react-dom_client.js?v=5a2ca2d1:19447
(anonymous) @ react-dom_client.js?v=5a2ca2d1:19328
workLoop @ react-dom_client.js?v=5a2ca2d1:197
flushWork @ react-dom_client.js?v=5a2ca2d1:176
performWorkUntilDeadline @ react-dom_client.js?v=5a2ca2d1:384Understand this error
installHook.js:1 Error details: {message: 'Unsupported file type', stack: 'Error: Unsupported file type\n    at _Potree.loadPo…vite/deps/react-dom_client.js?v=5a2ca2d1:19328:17', error: Error: Unsupported file type
    at _Potree.loadPointCloud (http://localhost:5173/node_modules/.vit…}
overrideMethod @ installHook.js:1
(anonymous) @ PotreeViewerMinimal.tsx:92
Promise.catch
(anonymous) @ PotreeViewerMinimal.tsx:90
commitHookEffectListMount @ react-dom_client.js?v=5a2ca2d1:16915
commitPassiveMountOnFiber @ react-dom_client.js?v=5a2ca2d1:18156
commitPassiveMountEffects_complete @ react-dom_client.js?v=5a2ca2d1:18129
commitPassiveMountEffects_begin @ react-dom_client.js?v=5a2ca2d1:18119
commitPassiveMountEffects @ react-dom_client.js?v=5a2ca2d1:18109
flushPassiveEffectsImpl @ react-dom_client.js?v=5a2ca2d1:19490
flushPassiveEffects @ react-dom_client.js?v=5a2ca2d1:19447
(anonymous) @ react-dom_client.js?v=5a2ca2d1:19328
workLoop @ react-dom_client.js?v=5a2ca2d1:197
flushWork @ react-dom_client.js?v=5a2ca2d1:176
performWorkUntilDeadline @ react-dom_client.js?v=5a2ca2d1:384Understand this error
installHook.js:1 ✗ Minimal component: Failed to load point cloud: Error: Unsupported file type
    at _Potree.loadPointCloud (potree-loader.js?v=5a2ca2d1:26592:11)
    at PotreeViewerMinimal.tsx:61:12
    at commitHookEffectListMount (react-dom_client.js?v=5a2ca2d1:16915:34)
    at invokePassiveEffectMountInDEV (react-dom_client.js?v=5a2ca2d1:18324:19)
    at invokeEffectsInDev (react-dom_client.js?v=5a2ca2d1:19701:19)
    at commitDoubleInvokeEffectsInDEV (react-dom_client.js?v=5a2ca2d1:19686:15)
    at flushPassiveEffectsImpl (react-dom_client.js?v=5a2ca2d1:19503:13)
    at flushPassiveEffects (react-dom_client.js?v=5a2ca2d1:19447:22)
    at react-dom_client.js?v=5a2ca2d1:19328:17
    at workLoop (react-dom_client.js?v=5a2ca2d1:197:42)
overrideMethod @ installHook.js:1
(anonymous) @ PotreeViewerMinimal.tsx:91
Promise.catch
(anonymous) @ PotreeViewerMinimal.tsx:90
commitHookEffectListMount @ react-dom_client.js?v=5a2ca2d1:16915
invokePassiveEffectMountInDEV @ react-dom_client.js?v=5a2ca2d1:18324
invokeEffectsInDev @ react-dom_client.js?v=5a2ca2d1:19701
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5a2ca2d1:19686
flushPassiveEffectsImpl @ react-dom_client.js?v=5a2ca2d1:19503
flushPassiveEffects @ react-dom_client.js?v=5a2ca2d1:19447
(anonymous) @ react-dom_client.js?v=5a2ca2d1:19328
workLoop @ react-dom_client.js?v=5a2ca2d1:197
flushWork @ react-dom_client.js?v=5a2ca2d1:176
performWorkUntilDeadline @ react-dom_client.js?v=5a2ca2d1:384Understand this error
installHook.js:1 Error details: {message: 'Unsupported file type', stack: 'Error: Unsupported file type\n    at _Potree.loadPo….vite/deps/react-dom_client.js?v=5a2ca2d1:197:42)', error: Error: Unsupported file type
    at _Potree.loadPointCloud (http://localhost:5173/node_modules/.vit…}
```

new plan

# Integrate Working Potree Library into React App

## Goal

Replace the failing `potree-loader` npm package with the actual Potree library from `potree/` directory, creating a minimal React component that exactly mirrors the working `lion.html` example.

## Key Differences from Current Approach

- **Current**: Uses `potree-loader` npm package with `potree.loadPointCloud(name, url)` (instance method, wrong API)
- **Working**: Uses actual Potree library with `Potree.loadPointCloud(path, name, callback)` (static method, correct API)

## Implementation Steps

### Step 1: Build Potree Library

- Navigate to `potree/` directory
- Run `npm install` to install dependencies
- Run `npm run build` to build potree (creates `build/potree/potree.js`)
- Verify `potree/build/potree/potree.js` exists

### Step 2: Configure Vite to Serve Potree

- Update `vite.config.ts` to:
  - Serve potree build files from `potree/build/` directory
  - Ensure potree resources (CSS, images) are accessible
  - Configure alias for potree if using ES modules

### Step 3: Create Minimal Potree Component

- Create `src/components/PotreeViewerWorking.tsx` that:
  - Loads Potree library (via script tag in `index.html` OR ES module import)
  - Creates `Potree.Viewer` instance exactly as in lion.html:
    ```javascript
    const viewer = new Potree.Viewer(containerElement);
    viewer.setEDLEnabled(true);
    viewer.setFOV(60);
    viewer.setPointBudget(1_000_000);
    ```

  - Uses `Potree.loadPointCloud()` exactly as in example:
    ```javascript
    Potree.loadPointCloud("/pointclouds/lion_takanawa/cloud.js", "lion", function(e){
      viewer.scene.addPointCloud(e.pointcloud);
      let material = e.pointcloud.material;
      material.size = 1;
      material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
      viewer.fitToScreen();
    });
    ```


### Step 4: Update App to Use Working Component

- Update `src/App.tsx` to use `PotreeViewerWorking` instead of `PotreeViewerMinimal`
- Remove dependency on `potree-loader` npm package (keep for now, remove later)

### Step 5: Copy Point Cloud Data

- Ensure point cloud files are accessible at `/pointclouds/lion_takanawa/cloud.js`
- Point cloud data is already in `potree/pointclouds/lion_takanawa/`
- Either copy to `public/pointclouds/` or configure Vite to serve from potree directory

### Step 6: Load Potree in index.html

- Add script tags to `index.html` to load:
  - Three.js (if not already loaded)
  - Potree library: `<script src="/potree/build/potree/potree.js"></script>`
  - Potree CSS: `<link rel="stylesheet" href="/potree/build/potree/potree.css">`
- OR configure Vite to handle this via imports

## Files to Modify/Create

1. **`potree/package.json`** - Already exists, just need to build
2. **`vite.config.ts`** - Add potree build directory to public assets or configure aliases
3. **`src/components/PotreeViewerWorking.tsx`** - NEW: Minimal component using actual Potree
4. **`src/App.tsx`** - Switch to use PotreeViewerWorking
5. **`index.html`** - Add Potree script/CSS tags OR configure Vite imports
6. **`public/pointclouds/`** - Copy point cloud data OR configure Vite to serve from potree/

## Alternative Approach (ES Modules)

If script tags don't work well with React, we can:

- Import Potree as ES module from `potree/src/Potree.js`
- Configure Vite to handle potree source files
- This requires ensuring all potree dependencies are resolved

## Success Criteria

- Point cloud loads and displays (no "Unsupported file type" error)
- Component mirrors lion.html example exactly
- No dependency on potree-loader npm package
- Clean, minimal implementation

## Notes

- The working example uses callback-based API: `Potree.loadPointCloud(path, name, callback)`
- Potree.Viewer handles scene, camera, renderer internally
- Point cloud path should be relative to public directory or absolute URL

Now instead of a black screen, there is a white screen and this output:

```
Uncaught ReferenceError: proj4 is not defined
    at map.js:5:1
    at potree.js:4:28
    at potree.js:5:2
(anonymous) @ map.js:5
(anonymous) @ potree.js:4
(anonymous) @ potree.js:5Understand this error
react-dom_client.js?v=5a2ca2d1:16670 Uncaught TypeError: Potree.Viewer is not a constructor
    at PotreeViewerWorking.tsx:25:20
    at commitHookEffectListMount (react-dom_client.js?v=5a2ca2d1:16915:34)
    at commitPassiveMountOnFiber (react-dom_client.js?v=5a2ca2d1:18156:19)
    at commitPassiveMountEffects_complete (react-dom_client.js?v=5a2ca2d1:18129:17)
    at commitPassiveMountEffects_begin (react-dom_client.js?v=5a2ca2d1:18119:15)
    at commitPassiveMountEffects (react-dom_client.js?v=5a2ca2d1:18109:11)
    at flushPassiveEffectsImpl (react-dom_client.js?v=5a2ca2d1:19490:11)
    at flushPassiveEffects (react-dom_client.js?v=5a2ca2d1:19447:22)
    at react-dom_client.js?v=5a2ca2d1:19328:17
    at workLoop (react-dom_client.js?v=5a2ca2d1:197:42)
(anonymous) @ PotreeViewerWorking.tsx:25
commitHookEffectListMount @ react-dom_client.js?v=5a2ca2d1:16915
commitPassiveMountOnFiber @ react-dom_client.js?v=5a2ca2d1:18156
commitPassiveMountEffects_complete @ react-dom_client.js?v=5a2ca2d1:18129
commitPassiveMountEffects_begin @ react-dom_client.js?v=5a2ca2d1:18119
commitPassiveMountEffects @ react-dom_client.js?v=5a2ca2d1:18109
flushPassiveEffectsImpl @ react-dom_client.js?v=5a2ca2d1:19490
flushPassiveEffects @ react-dom_client.js?v=5a2ca2d1:19447
(anonymous) @ react-dom_client.js?v=5a2ca2d1:19328
workLoop @ react-dom_client.js?v=5a2ca2d1:197
flushWork @ react-dom_client.js?v=5a2ca2d1:176
performWorkUntilDeadline @ react-dom_client.js?v=5a2ca2d1:384Understand this error
react-dom_client.js?v=5a2ca2d1:16670 Uncaught TypeError: Potree.Viewer is not a constructor
    at PotreeViewerWorking.tsx:25:20
    at commitHookEffectListMount (react-dom_client.js?v=5a2ca2d1:16915:34)
    at invokePassiveEffectMountInDEV (react-dom_client.js?v=5a2ca2d1:18324:19)
    at invokeEffectsInDev (react-dom_client.js?v=5a2ca2d1:19701:19)
    at commitDoubleInvokeEffectsInDEV (react-dom_client.js?v=5a2ca2d1:19686:15)
    at flushPassiveEffectsImpl (react-dom_client.js?v=5a2ca2d1:19503:13)
    at flushPassiveEffects (react-dom_client.js?v=5a2ca2d1:19447:22)
    at react-dom_client.js?v=5a2ca2d1:19328:17
    at workLoop (react-dom_client.js?v=5a2ca2d1:197:42)
    at flushWork (react-dom_client.js?v=5a2ca2d1:176:22)
(anonymous) @ PotreeViewerWorking.tsx:25
commitHookEffectListMount @ react-dom_client.js?v=5a2ca2d1:16915
invokePassiveEffectMountInDEV @ react-dom_client.js?v=5a2ca2d1:18324
invokeEffectsInDev @ react-dom_client.js?v=5a2ca2d1:19701
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5a2ca2d1:19686
flushPassiveEffectsImpl @ react-dom_client.js?v=5a2ca2d1:19503
flushPassiveEffects @ react-dom_client.js?v=5a2ca2d1:19447
(anonymous) @ react-dom_client.js?v=5a2ca2d1:19328
workLoop @ react-dom_client.js?v=5a2ca2d1:197
flushWork @ react-dom_client.js?v=5a2ca2d1:176
performWorkUntilDeadline @ react-dom_client.js?v=5a2ca2d1:384Understand this error
2installHook.js:1 The above error occurred in the <PotreeViewerWorking> component:

    at PotreeViewerWorking (http://localhost:5173/src/components/PotreeViewerWorking.tsx:21:24)
    at div
    at App

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
overrideMethod @ installHook.js:1
logCapturedError @ react-dom_client.js?v=5a2ca2d1:14032
update.callback @ react-dom_client.js?v=5a2ca2d1:14052
callCallback @ react-dom_client.js?v=5a2ca2d1:11248
commitUpdateQueue @ react-dom_client.js?v=5a2ca2d1:11265
commitLayoutEffectOnFiber @ react-dom_client.js?v=5a2ca2d1:17093
commitLayoutMountEffects_complete @ react-dom_client.js?v=5a2ca2d1:17980
commitLayoutEffects_begin @ react-dom_client.js?v=5a2ca2d1:17969
commitLayoutEffects @ react-dom_client.js?v=5a2ca2d1:17920
commitRootImpl @ react-dom_client.js?v=5a2ca2d1:19353
commitRoot @ react-dom_client.js?v=5a2ca2d1:19277
performSyncWorkOnRoot @ react-dom_client.js?v=5a2ca2d1:18895
flushSyncCallbacks @ react-dom_client.js?v=5a2ca2d1:9119
flushPassiveEffectsImpl @ react-dom_client.js?v=5a2ca2d1:19506
flushPassiveEffects @ react-dom_client.js?v=5a2ca2d1:19447
(anonymous) @ react-dom_client.js?v=5a2ca2d1:19328
workLoop @ react-dom_client.js?v=5a2ca2d1:197
flushWork @ react-dom_client.js?v=5a2ca2d1:176
performWorkUntilDeadline @ react-dom_client.js?v=5a2ca2d1:384Understand this error
react-dom_client.js?v=5a2ca2d1:9129 Uncaught TypeError: Potree.Viewer is not a constructor
    at PotreeViewerWorking.tsx:25:20
    at commitHookEffectListMount (react-dom_client.js?v=5a2ca2d1:16915:34)
    at commitPassiveMountOnFiber (react-dom_client.js?v=5a2ca2d1:18156:19)
    at commitPassiveMountEffects_complete (react-dom_client.js?v=5a2ca2d1:18129:17)
    at commitPassiveMountEffects_begin (react-dom_client.js?v=5a2ca2d1:18119:15)
    at commitPassiveMountEffects (react-dom_client.js?v=5a2ca2d1:18109:11)
    at flushPassiveEffectsImpl (react-dom_client.js?v=5a2ca2d1:19490:11)
    at flushPassiveEffects (react-dom_client.js?v=5a2ca2d1:19447:22)
    at react-dom_client.js?v=5a2ca2d1:19328:17
    at workLoop (react-dom_client.js?v=5a2ca2d1:197:42)
(anonymous) @ PotreeViewerWorking.tsx:25
commitHookEffectListMount @ react-dom_client.js?v=5a2ca2d1:16915
commitPassiveMountOnFiber @ react-dom_client.js?v=5a2ca2d1:18156
commitPassiveMountEffects_complete @ react-dom_client.js?v=5a2ca2d1:18129
commitPassiveMountEffects_begin @ react-dom_client.js?v=5a2ca2d1:18119
commitPassiveMountEffects @ react-dom_client.js?v=5a2ca2d1:18109
flushPassiveEffectsImpl @ react-dom_client.js?v=5a2ca2d1:19490
flushPassiveEffects @ react-dom_client.js?v=5a2ca2d1:19447
(anonymous) @ react-dom_client.js?v=5a2ca2d1:19328
workLoop @ react-dom_client.js?v=5a2ca2d1:197
flushWork @ react-dom_client.js?v=5a2ca2d1:176
performWorkUntilDeadline @ react-dom_client.js?v=5a2ca2d1:384Understand this error
```

Then this:

```
proj4 loaded
Potree.js:99 Potree 1.8.0
Potree.js:306 Uncaught ReferenceError: jQuery is not defined
    at Potree.js:306:4
    at potree.js:4:28
    at potree.js:5:2
(anonymous) @ Potree.js:306
(anonymous) @ potree.js:4
(anonymous) @ potree.js:5Understand this error
(index):26 Potree loaded
(index):26 Potree available: true
(index):26 Potree.Viewer: undefined
installHook.js:1 Potree.Viewer is not available. Potree may not have loaded correctly. Error Component Stack
    at PotreeViewerWorking (PotreeViewerWorking.tsx:10:24)
    at div (<anonymous>)
    at App (<anonymous>)
overrideMethod @ installHook.js:1
checkPotree @ PotreeViewerWorking.tsx:28
(anonymous) @ PotreeViewerWorking.tsx:67
commitHookEffectListMount @ react-dom_client.js?v=5a2ca2d1:16915
commitPassiveMountOnFiber @ react-dom_client.js?v=5a2ca2d1:18156
commitPassiveMountEffects_complete @ react-dom_client.js?v=5a2ca2d1:18129
commitPassiveMountEffects_begin @ react-dom_client.js?v=5a2ca2d1:18119
commitPassiveMountEffects @ react-dom_client.js?v=5a2ca2d1:18109
flushPassiveEffectsImpl @ react-dom_client.js?v=5a2ca2d1:19490
flushPassiveEffects @ react-dom_client.js?v=5a2ca2d1:19447
(anonymous) @ react-dom_client.js?v=5a2ca2d1:19328
workLoop @ react-dom_client.js?v=5a2ca2d1:197
flushWork @ react-dom_client.js?v=5a2ca2d1:176
performWorkUntilDeadline @ react-dom_client.js?v=5a2ca2d1:384Understand this error
PotreeViewerWorking.tsx:29 Available Potree properties: ['scriptPath']
installHook.js:1 Potree.Viewer is not available. Potree may not have loaded correctly.
overrideMethod @ installHook.js:1
checkPotree @ PotreeViewerWorking.tsx:28
(anonymous) @ PotreeViewerWorking.tsx:67
commitHookEffectListMount @ react-dom_client.js?v=5a2ca2d1:16915
invokePassiveEffectMountInDEV @ react-dom_client.js?v=5a2ca2d1:18324
invokeEffectsInDev @ react-dom_client.js?v=5a2ca2d1:19701
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5a2ca2d1:19686
flushPassiveEffectsImpl @ react-dom_client.js?v=5a2ca2d1:19503
flushPassiveEffects @ react-dom_client.js?v=5a2ca2d1:19447
(anonymous) @ react-dom_client.js?v=5a2ca2d1:19328
workLoop @ react-dom_client.js?v=5a2ca2d1:197
flushWork @ react-dom_client.js?v=5a2ca2d1:176
performWorkUntilDeadline @ react-dom_client.js?v=5a2ca2d1:384Understand this error
PotreeViewerWorking.tsx:29 Available Potree properties: ['scriptPath']
```

The final solution to solve all these issues and show the liaon point cloud resulted from these changes:


TWEEN is exposed globally by tween.min.js. Dependencies are in place. Verifying the final setup:
All dependencies added
Added the missing dependencies:
BinaryHeap — Required for Potree visibility updates
TWEEN (Tween.js) — Required for camera animations like fitToScreen()
Final script loading order:
jQuery (jquery-3.1.1.min.js)
BinaryHeap (BinaryHeap.js)
TWEEN (tween.min.js)
proj4 (proj4.js)
Potree (potree.js)
Status
Point cloud is loading successfully (you saw "✓ Point cloud loaded")
Potree.Viewer is working
Dependencies are in place
After refreshing, the BinaryHeap and TWEEN errors should be resolved, and the point cloud should display with the camera automatically fitting to the scene.
The component should now work as expected, matching the lion.html example.
