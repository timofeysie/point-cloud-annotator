# Potree Point Cloud Annotation Tool

This is a web application for viewing and annotating LAZ point clouds using Three.js and Potree. Create, view, and manage 3D annotations on interactive point cloud data with persistent storage using AWS serverless architecture.

The application is deployed [here](http://point-cloud-annotator-232723.s3-website-us-east-1.amazonaws.com/).

### Workflow

```bash
npm run dev
```

## Features

- **Interactive 3D Point Cloud Viewer**: Navigate and explore point cloud data using intuitive orbit controls
- **Annotation Creation**: Click anywhere on the point cloud to create annotations with custom text
- **Annotation Management**: View annotation details including 3D coordinates and delete annotations as needed
- **Persistent Storage**: All annotations are automatically saved to AWS DynamoDB and restored on page refresh
- **Real-time Visualization**: Red markers display annotation locations in 3D space
- **User-Friendly Interface**: Clean UI with instructions and annotation counter
- **Cloud-Native**: Fully serverless architecture deployed on AWS

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **3D Graphics**: Three.js for 3D rendering and scene management
- **Point Cloud**: Potree for loading and rendering LAZ point clouds
- **Camera Controls**: OrbitControls for intuitive 3D navigation
- **Styling**: Tailwind CSS for responsive design
- **Backend**: AWS serverless architecture
  - **API Gateway**: REST API for HTTP endpoints
  - **Lambda**: Serverless functions for CRUD operations
  - **DynamoDB**: NoSQL database for annotation storage
  - **S3**: Static website hosting for frontend
- **Infrastructure as Code**: Terraform for AWS resource management
- **Build Tool**: Vite for fast development and optimized builds
- **Icons**: Lucide React for UI icons

## Architecture overview

This application follows a serverless, cloud-native architecture with clear separation between frontend, backend, and infrastructure layers.

### Frontend Layer

- React: Single-page application built with React 18 and TypeScript
- Potree: Uses the Potree library (loaded via script tags) to render 3D point clouds
- Hosting: Deployed to S3 and served as a static website
- API: `annotationService.ts` handles HTTP requests to the backend API

### Backend Layer (Serverless)

- API Gateway: REST API that receives HTTP requests from the frontend
- Lambda Functions: Three serverless functions handle CRUD operations:
  - `get-annotations`: Retrieves all annotations from DynamoDB
  - `create-annotation`: Creates new annotations with 3D coordinates and text
  - `delete-annotation`: Removes annotations by ID
- DynamoDB: NoSQL database stores annotation data (id, coordinates, text, timestamps)

### Infrastructure Layer

- Terraform: Infrastructure as Code manages all AWS resources
- IAM Roles: Provides Lambda functions with permissions to access DynamoDB
- S3 Bucket: Hosts the frontend static files with website hosting enabled

## Deployment details

Terraform is an Infrastructure as Code tool that manages AWS infrastructure and provides configuration values used during deployment.  For this app, we have the following:

- DynamoDB Table — Stores annotations
- Lambda Functions (3):
   - get-annotations — GET /annotations
   - create-annotation — POST /annotations
   - delete-annotation — DELETE /annotations/{id}
- API Gateway — REST API that routes HTTP requests to Lambda functions
- IAM Roles & Policies — Permissions for Lambda to access DynamoDB
- S3 Bucket — Hosts the frontend static files
- S3 Bucket Configuration — Website hosting, public access, versioning
- CloudFront (optional) — CDN for the S3 bucket

In the regular deployment workflow, Terraform is only used to get configuration values:

Get the S3 bucket name (needed for deployment)terraform 
```output -raw s3_bucket_name```

Get the website URL (to visit
``` 
terraform output s3_website_endpoint
```

Terraform provides the bucket name and endpoint.
As a one-time setup `terraform apply` creates all AWS resources

For regular deployments `terraform output` is used.

For infrastructure updates (Lambda code, API Gateway config) `terraform apply` needs to be run.

Summary
Terraform = 
: Creates and manages AWS resources
Deployment script = Code deployment: Uploads frontend files to the S3 bucket Terraform created
Separation: Infrastructure (Terraform) vs. application code (deployment script)
In regular deployments, Terraform is read-only—you're just reading the bucket name it created, not

## Prerequisites

### For Local Development

- Node.js (v16 or higher)
- npm or yarn package manager
- AWS account (for deployment)

### For Deployment

- AWS account with appropriate permissions
- AWS CLI installed and configured
- Terraform (>= 1.0) installed
- Node.js and npm installed

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd point-cloud-annotator-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root with your API Gateway URL:
   ```env
   VITE_API_GATEWAY_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
   ```

   For local development, you can use a mock API or deploy the infrastructure first (see Deployment section).

## Usage

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

**Note**: For local development, you'll need to either:
- Deploy the AWS infrastructure first and use the API Gateway URL
- Use a local mock API server
- Use the deployed S3 website endpoint

### Building for Production

```bash
npm run build
```

This generates optimized production files in the `dist/` directory.

### Type Checking

```bash
npm run typecheck
```

Verify TypeScript types without building.

### Linting

```bash
npm run lint
```

Check code quality with ESLint.

## Deployment

This application is designed to be deployed as a full-stack, cloud-native solution on AWS. The infrastructure is managed using Terraform.

### Quick Start

1. **Deploy Infrastructure**
   ```bash
   cd infrastructure
   terraform init
   terraform apply
   ```

2. **Configure Frontend**
   - Get the API Gateway URL from Terraform outputs
   - Add it to your `.env` file as `VITE_API_GATEWAY_URL`

3. **Deploy Frontend**
   ```bash
   npm run build
   export S3_BUCKET_NAME=$(cd infrastructure && terraform output -raw s3_bucket_name)
   npm run deploy
   ```

For detailed deployment instructions, see [docs/deployment.md](docs/deployment.md).

## How to Use the Application

### Viewing the Point Cloud

1. The application loads the Lion Takanawa point cloud sample
2. Use your mouse to navigate:
   - **Left Click + Drag**: Rotate the view
   - **Right Click + Drag** or **Scroll**: Zoom in/out
   - **Middle Click + Drag**: Pan the view

### Creating Annotations

1. Click on any point in the 3D point cloud
2. An annotation dialog will appear
3. Enter your annotation text (up to 256 characters)
4. Click "Save" to create the annotation
5. A red marker will appear at the clicked location

### Viewing Annotations

- Click on any red marker to view the annotation details
- The details panel shows:
  - Annotation text
  - 3D coordinates (x, y, z)
  - Delete button

### Deleting Annotations

1. Click on a red marker to open the details panel
2. Click the "Delete Annotation" button
3. The annotation will be removed from the point cloud and database

## Project Structure

```
.
├── src/
│   ├── components/
│   │   └── PotreeViewer.tsx      # Main 3D viewer and annotation UI
│   ├── services/
│   │   └── annotationService.ts  # API Gateway HTTP client
│   ├── types/
│   │   ├── annotation.ts         # Annotation type definitions
│   │   └── potree-loader.d.ts   # Type definitions for Potree
│   ├── App.tsx                   # Application entry point
│   ├── main.tsx                  # React DOM rendering
│   └── index.css                 # Global styles
├── lambda/
│   ├── get-annotations/          # Lambda function: GET all annotations
│   ├── create-annotation/        # Lambda function: POST new annotation
│   └── delete-annotation/        # Lambda function: DELETE annotation
├── infrastructure/
│   ├── main.tf                   # Terraform main configuration
│   ├── variables.tf              # Terraform variables
│   ├── outputs.tf                # Terraform outputs
│   └── terraform.tfvars.example  # Example Terraform variables
├── docs/
│   ├── prd.md                    # Product requirements document
│   └── deployment.md             # Deployment guide
└── package.json
```

## Data Schema

### DynamoDB Table: annotations

The annotations are stored in a DynamoDB table with the following structure:

- **Partition Key**: `id` (String) - Unique identifier (UUID)
- **Attributes**:
  - `x` (Number) - X coordinate
  - `y` (Number) - Y coordinate
  - `z` (Number) - Z coordinate
  - `text` (String) - Annotation content (max 256 bytes)
  - `created_at` (String) - ISO 8601 timestamp
  - `updated_at` (String) - ISO 8601 timestamp

The table is created automatically by Terraform with on-demand billing mode.

## API Reference

### Annotation Service

The frontend uses the `annotationService` to interact with the API Gateway:

#### `getAll(): Promise<Annotation[]>`
Fetches all annotations from DynamoDB via API Gateway.

#### `create(x: number, y: number, z: number, text: string): Promise<Annotation>`
Creates a new annotation at the specified 3D coordinates with the given text.

#### `delete(id: string): Promise<void>`
Deletes an annotation by its ID.

### API Gateway Endpoints

- `GET /annotations` - Retrieve all annotations
- `POST /annotations` - Create a new annotation
- `DELETE /annotations/{id}` - Delete an annotation by ID

All endpoints support CORS and return JSON responses.

## Performance Considerations

- Point budget is set to 1,000,000 points for optimal performance
- Annotations are loaded once on component mount and updated when created/deleted
- Raycasting is used for efficient point cloud intersection detection
- Damping is enabled on camera controls for smooth interaction
- DynamoDB on-demand billing scales automatically with traffic
- Lambda functions are optimized for cold start performance

## Troubleshooting

### Point Cloud Not Loading
- Verify your internet connection (the point cloud is loaded from a CDN)
- Check browser console for error messages
- Ensure WebGL 2.0 is supported in your browser

### Annotations Not Persisting
- Verify that `VITE_API_GATEWAY_URL` is correctly configured in `.env`
- Check that the AWS infrastructure is deployed and running
- Verify API Gateway is accessible (check CORS configuration)
- Check browser console for API errors
- Review CloudWatch logs for Lambda function errors

### API Connection Issues
- Ensure the API Gateway URL in `.env` matches the Terraform output
- Rebuild the frontend after changing environment variables: `npm run build`
- Check that CORS is properly configured in API Gateway
- Verify Lambda functions have proper IAM permissions

### Deployment Issues
- Ensure AWS credentials are configured: `aws configure`
- Verify Terraform is initialized: `cd infrastructure && terraform init`
- Check that S3 bucket name is globally unique
- Review Terraform plan before applying: `terraform plan`

### Performance Issues
- Reduce the point budget if experiencing lag
- Close other browser tabs to free up system resources
- Try using a more powerful graphics card
- Check Lambda function timeout and memory settings

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires WebGL 2.0 support.

## Limitations

- Maximum annotation text length: 256 bytes
- Point cloud displayed is the Lion Takanawa sample
- Annotations are global (not user-specific in this version)
- No authentication required (as per PRD)
- **⚠️ CRITICAL: Point cloud loading**: `potree-loader@1.10.4` does not work in any local development environment (neither dev server nor production preview). This is a critical blocker. The point cloud may work in production deployment (S3), but cannot be tested locally. **Recommendation:** Consider switching to an alternative point cloud loader or using a development mock. See `docs/point-cloud-loading-issue.md` for details.

## Cost Estimation

Approximate monthly costs for low to moderate usage:

- **DynamoDB**: On-demand pricing (~$1-5/month)
- **Lambda**: First 1M requests free, then minimal cost
- **API Gateway**: ~$3.50 per million API calls
- **S3**: ~$0.023 per GB storage + minimal request costs
- **CloudFront** (optional): ~$0.085 per GB data transfer

Total estimated cost: **$10-20/month** for typical usage.

## Infrastructure Management

All AWS resources are managed using Terraform. Key resources include:

- DynamoDB table for annotation storage
- Three Lambda functions for CRUD operations
- API Gateway REST API
- S3 bucket for static website hosting
- IAM roles and policies
- Optional CloudFront distribution

See [docs/deployment.md](docs/deployment.md) for detailed infrastructure setup and management instructions.

## Development

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- React hooks for state management

### Contributing

1. Follow the existing code structure and conventions
2. Ensure TypeScript type checking passes: `npm run typecheck`
3. Run linting: `npm run lint`
4. Test new features in development mode
5. Run the build to verify production compatibility: `npm run build`

## License

This project is provided as-is for educational and development purposes.

## Support

For issues or questions, please check:

1. The application instructions panel (bottom-left of the screen)
2. Browser console for error messages
3. AWS CloudWatch logs for Lambda function errors
4. [Deployment Guide](docs/deployment.md) for deployment issues
5. Terraform outputs for infrastructure status
