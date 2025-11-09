#!/bin/bash

# Script to download the lion_takanawa point cloud data for local development
# This downloads the metadata file and the data directory structure

set -e

POINTCLOUD_DIR="public/pointclouds/lion_takanawa"
TEMP_DIR="/tmp/potree-download"

echo "Downloading point cloud metadata..."
mkdir -p "$POINTCLOUD_DIR"
# Download as cloud.json (potree-loader expects .json extension for JSON content)
curl -L -o "$POINTCLOUD_DIR/cloud.json" "https://cdn.jsdelivr.net/gh/potree/potree@develop/pointclouds/lion_takanawa/cloud.js"

echo "Downloading point cloud data directory from GitHub..."
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Download the repository as a zip and extract just the data directory
echo "Fetching potree repository..."
curl -L "https://api.github.com/repos/potree/potree/zipball/develop" -o potree.zip

echo "Extracting data directory..."
unzip -q potree.zip
POTREE_DIR=$(ls -d potree-potree-* | head -1)

if [ -d "$POTREE_DIR/pointclouds/lion_takanawa/data" ]; then
    echo "Copying data directory..."
    cp -r "$POTREE_DIR/pointclouds/lion_takanawa/data" "$POINTCLOUD_DIR/"
    echo "✓ Point cloud data downloaded successfully!"
    echo "  Metadata: $POINTCLOUD_DIR/cloud.json"
    echo "  Data: $POINTCLOUD_DIR/data/"
    du -sh "$POINTCLOUD_DIR/data"
else
    echo "✗ Error: Data directory not found in downloaded repository"
    exit 1
fi

# Cleanup
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo ""
echo "Point cloud is ready for local development!"

