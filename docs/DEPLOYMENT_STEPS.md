# Quick Deployment Steps

## Prerequisites Check

Before deploying, ensure you have:

   ```bash
brew install awscli
aws configure
brew install terraform
```

The AWS Account should have the appropriate permissions (DynamoDB, Lambda, API Gateway, S3, IAM)

### Deploy Infrastructure

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### Step 5: Get API Gateway URL
```bash
cd infrastructure
terraform output api_gateway_url
# Copy this URL - you'll need it for the next step
```

### Step 6: Configure Frontend Environment
```bash
cd ..  # Return to project root

# Create/update .env file with the API Gateway URL
echo "VITE_API_GATEWAY_URL=$(cd infrastructure && terraform output -raw api_gateway_url)" > .env
```

### Step 7: Build and Deploy Frontend
```bash
# Build the frontend
npm run build

# Deploy to S3
export S3_BUCKET_NAME=$(cd infrastructure && terraform output -raw s3_bucket_name)
aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete
```

### Step 8: Get Application URL
```bash
cd infrastructure
terraform output s3_website_endpoint
# Visit this URL in your browser to test the application
```

## Testing the Point Cloud

Once deployed, visit the S3 website endpoint and:
1. Check if the point cloud loads (this will confirm if potree-loader works in production)
2. Test annotation creation/editing/deletion
3. Verify the API Gateway is working correctly

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

