# Mock Point Cloud Implementation

When the `potree-loader` is used locally it throws an "Unsupported file type" error even when the files are valid and accessible.

A development mock point cloud has been implemented to unblock local development in this case to allow full testing of annotation features without needing the real point cloud.

Either when running `npm run dev`
OR explicitly enabled via VITE_USE_MOCK_POINT_CLOUD=true in the .env file.

## Mock Point Cloud Features

- **5,000 random points** within the same bounding box as the real lion_takanawa point cloud
- **Color variation** to simulate RGB point cloud data
- **Same coordinate system** as real point cloud (ensures annotations work correctly)
- **Clickable** - supports raycasting for annotation creation
- **Visual bounding box** (optional wireframe helper)

## Files

- `src/utils/mockPointCloud.ts` - Mock point cloud creation logic
- `src/components/PotreeViewer.tsx` - Updated to use mock in dev mode

### Force Mock in Production Build

If you want to test the mock in a production build:

```bash
VITE_USE_MOCK_POINT_CLOUD=true npm run build
npm run preview
```

### Production Mode (Real Point Cloud)

In production builds (when `import.meta.env.DEV` is false), the real `potree-loader` will be used.

## Benefits

1. **Unblocks Development** - Can develop and test locally
2. **Fast Iteration** - No need to wait for point cloud loading
3. **Full Feature Testing** - All annotation features work with mock
4. **Consistent Coordinates** - Uses same bounding box as real point cloud
5. **Easy to Disable** - Automatically switches to real point cloud in production

## Limitations

- Mock point cloud is a simple visualization (not the real point cloud data)
- Point distribution is random (not the actual point cloud structure)
- No LOD (Level of Detail) - all points are always visible
- Performance is different from real point cloud (simpler, faster)

## Testing Annotations

The mock point cloud fully supports:
- ✅ Clicking to create annotations
- ✅ Viewing existing annotations
- ✅ Deleting annotations
- ✅ Camera controls (orbit, zoom, pan)
- ✅ Annotation markers display correctly

## Future: Option 1 (Alternative Library)

When ready to implement Option 1 (alternative library), the mock can be easily removed or kept as a fallback. The code is structured to make this transition smooth.
