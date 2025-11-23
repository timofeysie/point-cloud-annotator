# Quick Deployment Steps

## Deployment Workflow

Build the frontend and deploy to S3.

```bash
npm run build
export S3_BUCKET_NAME=$(cd infrastructure && terraform output -raw s3_bucket_name)
./scripts/deploy-s3.sh $S3_BUCKET_NAME
cd infrastructure
terraform output s3_website_endpoint
```

## Initial Setup (One-Time Only)

These steps are only needed the first time you deploy, or if you're setting up a new environment.

### Prerequisites Check

Before deploying, ensure you have:

```bash
brew install awscli
aws configure
brew install terraform
```

**Note:** `aws configure` is only needed once per machine. After that, AWS CLI uses the stored credentials.

The AWS Account should have the appropriate permissions (DynamoDB, Lambda, API Gateway, S3, IAM)

### Step 1: Deploy Infrastructure

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

**Note:** `terraform init` is only needed once per infrastructure directory. After that, you can skip directly to `terraform apply` for updates.

### Step 2: Get API Gateway URL
```bash
cd infrastructure
terraform output api_gateway_url
# Copy this URL - you'll need it for the next step
```

### Step 3: Configure Frontend Environment
```bash
cd ..  # Return to project root

# Create/update .env file with the API Gateway URL
echo "VITE_API_GATEWAY_URL=$(cd infrastructure && terraform output -raw api_gateway_url)" > .env
```

**Note:** This only needs to be done once, or if the API Gateway URL changes (e.g., after `terraform destroy` and `terraform apply`).

## Testing the Point Cloud

Once deployed, visit the S3 website endpoint and:
1. Check if the point cloud loads (Potree library should load and display the point cloud)
2. Verify Potree dependencies loaded (check browser console for "Potree 1.8.0" message)
3. Test annotation creation/editing/deletion
4. Verify the API Gateway is working correctly

**Note:** The build process now automatically includes Potree library files from `public/potree/`. These are deployed along with the frontend build.

## Cleanup (When Done Testing)

To remove all AWS resources:
```bash
cd infrastructure
terraform destroy
# Type 'yes' when prompted
```

## Troubleshooting

- **Bucket name already exists**: Update `s3_bucket_name` in `terraform.tfvars` with a unique name
- **Permission errors**: Ensure your AWS credentials have the required permissions
- **Lambda deployment fails**: Check that Lambda dependencies are installed (already done)
- **CORS errors**: Verify API Gateway CORS configuration in Terraform

