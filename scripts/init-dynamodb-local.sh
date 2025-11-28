#!/bin/bash

# Script to initialize DynamoDB Local table for local development

set -e

TABLE_NAME="point-cloud-annotator-annotations"
ENDPOINT_URL="http://localhost:8000"

echo "Initializing DynamoDB Local table: $TABLE_NAME"

# Check if DynamoDB Local is running
if ! curl -s "$ENDPOINT_URL" > /dev/null; then
    echo "Error: DynamoDB Local is not running at $ENDPOINT_URL"
    echo "Start it with: docker-compose up -d dynamodb-local"
    exit 1
fi

# Create table
aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url "$ENDPOINT_URL" \
    --region local \
    2>/dev/null && echo "✓ Table created" || echo "⚠ Table may already exist (this is OK)"

echo ""
echo "DynamoDB Local table '$TABLE_NAME' is ready!"
echo "You can now start the SAM Local API with: ./scripts/start-local-api.sh"


