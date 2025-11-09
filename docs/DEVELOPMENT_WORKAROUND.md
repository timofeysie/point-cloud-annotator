# Development Workaround for Point Cloud Loading

## Problem

`potree-loader@1.10.4` does not work with Vite's dev server in local development, even though files are correctly served and formatted. This makes it impossible to develop and test the point cloud visualization locally.

## Solution: Use Production Build for Point Cloud Testing

While the dev server (`npm run dev`) doesn't work for point cloud loading, **the production build works correctly**. You can test the point cloud locally using the production build.

### Steps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Preview the production build:**
   ```bash
   npm run preview
   ```

3. **Open in browser:**
   - The preview server will show you the URL (typically `http://localhost:4173`)
   - The point cloud should load correctly in the preview server

### Why This Works

The production build serves static files differently than the dev server, and potree-loader works correctly with the production build's file serving mechanism.

## Development Workflow

### For Annotation Development (No Point Cloud Needed)
- Use `npm run dev` - Fast hot-reload, works for all annotation features
- Point cloud won't load, but all annotation functionality works

### For Point Cloud Testing
- Use `npm run build && npm run preview` - Slower, but point cloud loads correctly
- Full functionality including point cloud visualization

## Alternative: Mock Point Cloud for Development

If you need faster iteration on point cloud features, consider creating a mock/placeholder point cloud that works in dev mode. This would allow you to:
- Test point cloud interaction logic
- Develop annotation features
- Iterate quickly with hot-reload

The mock would be replaced with the real point cloud in production.

## Long-term Solution

Consider:
1. **Fork and fix potree-loader** - Fix the local development issue and contribute back
2. **Switch to alternative library** - Find a point cloud loader that works in development
3. **Use Potree directly** - Use the original Potree library instead of potree-loader (more setup required)

## Recommendation

For now, use the production build (`npm run preview`) when you need to test point cloud functionality. For annotation development, the dev server is sufficient.

