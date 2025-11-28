#!/bin/bash

# Script to start SAM Local API for local development
# This runs the Lambda functions locally and provides an API Gateway-like interface

set -e

echo "Starting local API development environment..."
echo ""

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "Error: AWS SAM CLI is not installed."
    echo "Install it with: brew install aws-sam-cli"
    echo "Or visit: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    exit 1
fi

# Check if Docker is running (required for SAM Local)
if ! docker info &> /dev/null; then
    echo "Error: Docker is not running."
    echo "Please start Docker Desktop and try again."
    exit 1
fi

# Check if DynamoDB Local is running (optional)
if docker ps | grep -q dynamodb-local; then
    echo "✓ DynamoDB Local is running"
    export AWS_ENDPOINT_URL=http://localhost:8000
    echo "  Using DynamoDB Local at http://localhost:8000"
else
    echo "⚠ DynamoDB Local is not running"
    echo "  To start it: docker-compose up -d dynamodb-local"
    echo "  Or use a real DynamoDB table with AWS credentials"
    echo ""
fi

# Set environment variables for local development
export TABLE_NAME=point-cloud-annotator-annotations

# Start SAM Local API
echo ""
echo "Starting SAM Local API on http://localhost:3000"
echo "API endpoints:"
echo "  GET    http://localhost:3000/local/annotations"
echo "  POST   http://localhost:3000/local/annotations"
echo "  DELETE http://localhost:3000/local/annotations/{id}"
echo ""
echo "Press Ctrl+C to stop"
echo ""

sam local start-api \
  --port 3000 \
  --template template.yaml \
  --env-vars env.json \
  --warm-containers EAGER \
  --debug


