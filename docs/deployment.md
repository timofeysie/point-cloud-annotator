# Deployment Guide

This guide provides step-by-step instructions for deploying the Point Cloud Annotator application to AWS using Terraform.

## Prerequisites

Before deploying, ensure you have the following installed and configured:

1. **AWS Account**: An active AWS account with appropriate permissionsw
2. **AWS CLI**: Installed and configured ith credentials
   ```bash
   aws --version
   aws configure
   ```
3. **Terraform**: Version 1.0 or higher
   ```bash
   terraform --version
   ```
4. **Node.js**: Version 16 or higher (for building the frontend)
   ```bash
   node --version
   ```
5. **npm**: Package manager for Node.js

## Required AWS Permissions

Your AWS credentials need permissions to create and manage:
- DynamoDB tables
- Lambda functions
- API Gateway REST APIs
- S3 buckets
- IAM roles and policies
- CloudFront distributions (if enabled)

## Step 1: Configure Terraform Variables

1. Navigate to the `infrastructure/` directory:
   ```bash
   cd infrastructure
   ```

2. Copy the example Terraform variables file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

3. Edit `terraform.tfvars` with your configuration:
   ```hcl
   project_name = "point-cloud-annotator"
   aws_region   = "us-east-1"
   environment  = "prod"
   
   # IMPORTANT: S3 bucket name must be globally unique
   # Use a unique name like: yourname-point-cloud-annotator-2024
   s3_bucket_name = "your-unique-bucket-name-here"
   
   # Set to true to enable CloudFront distribution (optional)
   enable_cloudfront = false
   ```

## Step 2: Install Lambda Dependencies

Before deploying, you need to install dependencies for each Lambda function:

```bash
# From the project root directory
cd lambda/get-annotations && npm install && cd ../..
cd lambda/create-annotation && npm install && cd ../..
cd lambda/delete-annotation && npm install && cd ../..
```

Or use a script:
```bash
for dir in lambda/*/; do
  echo "Installing dependencies in $dir"
  (cd "$dir" && npm install)
done
```

## Step 3: Deploy Infrastructure with Terraform

1. Initialize Terraform:
   ```bash
   cd infrastructure
   terraform init
   ```

2. Review the execution plan:
   ```bash
   terraform plan
   ```

3. Apply the infrastructure:
   ```bash
   terraform apply
   ```

   Type `yes` when prompted to confirm.

4. After deployment completes, note the outputs:
   - `api_gateway_url`: The API Gateway endpoint URL
   - `s3_bucket_name`: The S3 bucket name for frontend deployment
   - `s3_website_endpoint`: The S3 website endpoint URL

## Step 4: Configure Frontend Environment Variable

1. Create a `.env` file in the project root (if it doesn't exist):
   ```bash
   cd ..  # Return to project root
   ```

2. Add the API Gateway URL from Terraform outputs:
   ```env
   VITE_API_GATEWAY_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
   ```

   Replace `your-api-id` with the actual API Gateway ID from the Terraform output.

   You can get the URL by running:
   ```bash
   cd infrastructure
   terraform output api_gateway_url
   ```

## Step 5: Build and Deploy Frontend

1. Install frontend dependencies (if not already done):
   ```bash
   npm install
   ```

2. Build the frontend:
   ```bash
   npm run build
   ```

   This creates the production build in the `dist/` directory.

3. Deploy to S3:
   ```bash
   export S3_BUCKET_NAME=$(cd infrastructure && terraform output -raw s3_bucket_name)
   npm run deploy
   ```

   Or manually:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

## Step 6: Access Your Application

After deployment, access your application using one of these URLs:

- **S3 Website Endpoint**: `http://your-bucket-name.s3-website-us-east-1.amazonaws.com`
- **CloudFront URL** (if enabled): `https://your-cloudfront-id.cloudfront.net`

To get the S3 website endpoint:
```bash
cd infrastructure
terraform output s3_website_endpoint
```

## Updating the Application

### Update Infrastructure

1. Make changes to Terraform files in `infrastructure/`
2. Review changes:
   ```bash
   cd infrastructure
   terraform plan
   ```
3. Apply changes:
   ```bash
   terraform apply
   ```

### Update Frontend

1. Make code changes
2. Rebuild:
   ```bash
   npm run build
   ```
3. Redeploy:
   ```bash
   export S3_BUCKET_NAME=$(cd infrastructure && terraform output -raw s3_bucket_name)
   npm run deploy
   ```

### Update Lambda Functions

1. Make changes to Lambda function code in `lambda/` directories
2. Reinstall dependencies if needed:
   ```bash
   cd lambda/function-name && npm install && cd ../..
   ```
3. Apply Terraform (it will detect changes and redeploy):
   ```bash
   cd infrastructure
   terraform apply
   ```

## Destroying Infrastructure

To remove all AWS resources:

1. Navigate to the infrastructure directory:
   ```bash
   cd infrastructure
   ```

2. Destroy resources:
   ```bash
   terraform destroy
   ```

   Type `yes` when prompted to confirm.

**Warning**: This will permanently delete all resources including:
- DynamoDB table and all data
- Lambda functions
- API Gateway
- S3 bucket and all files
- CloudFront distribution (if enabled)

## Troubleshooting

### Lambda Functions Not Working

1. Check Lambda logs in CloudWatch:
   ```bash
   aws logs tail /aws/lambda/point-cloud-annotator-get-annotations --follow
   ```

2. Verify environment variables are set correctly in Terraform

3. Ensure Lambda functions have proper IAM permissions

### API Gateway CORS Issues

- Verify CORS headers are configured in API Gateway methods
- Check that Lambda functions return proper CORS headers
- Ensure the frontend is making requests to the correct API Gateway URL

### S3 Bucket Not Accessible

1. Verify bucket policy allows public read access
2. Check that static website hosting is enabled
3. Ensure `block_public_acls` is set to `false` in Terraform

### Frontend Can't Connect to API

1. Verify `VITE_API_GATEWAY_URL` is set correctly in `.env`
2. Rebuild the frontend after changing environment variables:
   ```bash
   npm run build
   ```
3. Check browser console for CORS or network errors

## Cost Estimation

Approximate monthly costs (varies by usage):

- **DynamoDB**: On-demand pricing - $1.25 per million write units, $0.25 per million read units
- **Lambda**: First 1M requests free, then $0.20 per 1M requests
- **API Gateway**: $3.50 per million API calls
- **S3**: ~$0.023 per GB storage, $0.005 per 1,000 GET requests
- **CloudFront** (optional): $0.085 per GB data transfer out

For low to moderate usage, expect costs under $10-20/month.

## Security Considerations

- The current implementation has no authentication (as per PRD requirements)
- All annotations are publicly accessible
- For production use, consider adding:
  - API authentication (API Keys, Cognito, etc.)
  - DynamoDB access controls
  - S3 bucket policies with IP restrictions
  - CloudFront with WAF

## Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)

## Local Development with SAM Local

This application supports local development using AWS SAM Local, which allows you to run Lambda functions locally without deploying to AWS. This is particularly useful for testing annotation functionality during development.

### SAM Local Setup

**Prerequisites:**
- AWS SAM CLI installed (`brew install aws-sam-cli` or see [AWS SAM CLI Installation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
- Docker Desktop running (required for SAM Local)

**Configuration Files:**
- `template.yaml`: SAM template defining Lambda functions for local execution
- `docker-compose.yml`: Runs DynamoDB Local on port 8000
- `env.json`: Environment variables for Lambda functions (points to DynamoDB Local)
- `scripts/start-local-api.sh`: Script to start SAM Local API
- `scripts/init-dynamodb-local.sh`: Script to initialize DynamoDB Local table

### Local Development Workflow

1. **Start DynamoDB Local:**
   ```bash
   docker-compose up -d dynamodb-local
   ```

2. **Initialize DynamoDB Local Table:**
   ```bash
   ./scripts/init-dynamodb-local.sh
   ```
   This creates the `point-cloud-annotator-annotations` table in DynamoDB Local.

3. **Start SAM Local API:**
   ```bash
   ./scripts/start-local-api.sh
   ```
   This starts the SAM Local API on `http://localhost:3000` with the following endpoints:
   - `GET http://localhost:3000/local/annotations`
   - `POST http://localhost:3000/local/annotations`
   - `DELETE http://localhost:3000/local/annotations/{id}`

4. **Configure Frontend for Local Development:**
   Create or update `.env` file in the project root:
   ```env
   VITE_API_GATEWAY_URL=http://localhost:3000/local
   ```

5. **Run Frontend Development Server:**
   ```bash
   npm run dev
   ```

The frontend will now use the local SAM Local API instead of the deployed AWS API Gateway.

### How It Works

The `annotationService.ts` uses the `VITE_API_GATEWAY_URL` environment variable to determine which API to use:

```typescript
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || '';
```

- **Local Development**: Set `VITE_API_GATEWAY_URL=http://localhost:3000/local` → Uses SAM Local
- **Production**: Set `VITE_API_GATEWAY_URL=<terraform-output-api-gateway-url>` → Uses real AWS API Gateway

The same Lambda function code in `lambda/` directories is used by both:
- **SAM Local**: Executes functions locally via `template.yaml`
- **Terraform**: Packages and deploys the same code to AWS Lambda

### Switching Between Local and Production

To switch between local and production environments, simply change the `VITE_API_GATEWAY_URL` in your `.env` file:

**For Local Development:**
```env
VITE_API_GATEWAY_URL=http://localhost:3000/local
```

**For Production:**
```env
VITE_API_GATEWAY_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

**Important**: After changing `.env`, you need to restart the development server (`npm run dev`) for the changes to take effect, as Vite reads environment variables at startup.

### Production Deployment Confirmation

When deploying to production:

1. **Infrastructure**: Terraform creates real AWS resources:
   - Lambda functions in AWS (using the same code from `lambda/` directories)
   - API Gateway REST API
   - DynamoDB table in AWS
   - IAM roles and policies

2. **Frontend**: The built frontend (via `npm run build`) embeds the `VITE_API_GATEWAY_URL` at build time, so the production build will use the AWS API Gateway URL you specify in `.env` before building.

3. **Same Codebase**: The application code works identically in both environments - only the API endpoint URL changes based on the environment variable.

This architecture ensures that:
- Local development uses SAM Local and DynamoDB Local (no AWS costs)
- Production deployment uses real AWS services (Lambda, API Gateway, DynamoDB)
- The same codebase works for both environments
- Lambda function code is tested locally before deployment

