#!/bin/bash

# Deploy script that fixes Content-Type headers for point cloud files
# Usage: ./scripts/deploy-s3.sh <bucket-name>

set -e

BUCKET_NAME="${1:-${S3_BUCKET_NAME}}"

if [ -z "$BUCKET_NAME" ]; then
  echo "Error: S3 bucket name required"
  echo "Usage: ./scripts/deploy-s3.sh <bucket-name>"
  echo "   or: export S3_BUCKET_NAME=<bucket-name> && ./scripts/deploy-s3.sh"
  exit 1
fi

echo "Deploying to S3 bucket: $BUCKET_NAME"

# First, sync all files (this handles deletions and updates)
echo "Syncing files to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Fix Content-Type headers for point cloud metadata files
# These files are JSON but have .js extension, so S3 serves them as text/javascript
echo "Fixing Content-Type headers for point cloud files..."

# Fix cloud.js files (they're actually JSON)
if [ -f "dist/pointclouds/lion_takanawa/cloud.js" ]; then
  echo "  Fixing cloud.js Content-Type..."
  aws s3 cp dist/pointclouds/lion_takanawa/cloud.js \
    s3://$BUCKET_NAME/pointclouds/lion_takanawa/cloud.js \
    --content-type "application/json" \
    --cache-control "public, max-age=31536000" \
    --metadata-directive REPLACE
fi

# Fix cloud.json files
if [ -f "dist/pointclouds/lion_takanawa/cloud.json" ]; then
  echo "  Fixing cloud.json Content-Type..."
  aws s3 cp dist/pointclouds/lion_takanawa/cloud.json \
    s3://$BUCKET_NAME/pointclouds/lion_takanawa/cloud.json \
    --content-type "application/json" \
    --cache-control "public, max-age=31536000" \
    --metadata-directive REPLACE
fi

# Fix binary files (.bin, .hrc) to ensure they're served as octet-stream
echo "  Fixing binary file Content-Type headers..."
find dist/pointclouds -type f \( -name "*.bin" -o -name "*.hrc" \) | while read file; do
  rel_path="${file#dist/}"
  echo "    Fixing $rel_path..."
  aws s3 cp "$file" \
    s3://$BUCKET_NAME/$rel_path \
    --content-type "application/octet-stream" \
    --cache-control "public, max-age=31536000" \
    --metadata-directive REPLACE
done

echo "Deployment complete!"
echo "Visit: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"

