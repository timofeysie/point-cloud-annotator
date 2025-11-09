# Point Cloud Data

This directory contains the point cloud data for local development.

## Lion Takanawa Point Cloud

The `lion_takanawa/` directory contains:
- `cloud.json` - Metadata file describing the point cloud (JSON format)
- `data/` - Binary data files organized in an octree structure

## Downloading Point Cloud Data

To download or update the point cloud data, run:

```bash
./scripts/download-pointcloud.sh
```

Or manually:
1. Download the metadata: `curl -L -o public/pointclouds/lion_takanawa/cloud.json https://cdn.jsdelivr.net/gh/potree/potree@develop/pointclouds/lion_takanawa/cloud.js`
   Note: The downloaded file should be renamed to `cloud.json` (potree-loader expects .json extension for JSON content)
2. Download the data directory from the potree repository

## Note

The `data/` directory is excluded from git (see `.gitignore`) as it contains binary files (~5MB).
Each developer should run the download script to get the point cloud data locally.

## Using Custom Point Clouds

To use a different point cloud:
1. Place the point cloud directory in `public/pointclouds/`
2. Set `VITE_POINT_CLOUD_URL` in your `.env` file to point to it
3. Or update the code to use a different default path

