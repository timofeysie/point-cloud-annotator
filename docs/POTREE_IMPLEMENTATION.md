# Potree Implementation Documentation

## Overview

This document describes the working implementation of the Potree point cloud viewer, based on the proven `lion.html` example from the Potree library. This implementation replaces the previous `potree-loader` npm package approach, which had compatibility issues.

## Architecture

### Key Decision: Using Actual Potree Library

Instead of using the `potree-loader` npm package (which had API mismatches and file type issues), we use the actual Potree library from the `potree/` directory. This ensures:

- **Correct API**: Uses `Potree.loadPointCloud(path, name, callback)` (static method with callback)
- **Proven Pattern**: Mirrors the working `potree/examples/lion.html` example exactly
- **Full Compatibility**: All Potree features work as expected

## File Structure

```
public/
  potree/                    # Built Potree files (served statically)
    potree.js               # Main Potree library
    potree.css              # Potree styles
    libs/                   # Dependencies
      jquery/               # jQuery (required by Potree)
      other/                # BinaryHeap (for visibility updates)
      tween/                # TWEEN.js (for camera animations)
      proj4/                # proj4 (for coordinate transformations)
    resources/              # Potree resources (icons, images, etc.)
    workers/                # Web workers for point cloud processing

src/
  components/
    PotreeViewer.tsx # Main component

potree/                     # Source directory (ignored by git)
  build/potree/             # Built files (source for public/potree/)
  examples/lion.html        # Reference implementation
```

## Dependencies

### Required Scripts (loaded in `index.html`)

The following scripts must be loaded in this exact order before Potree:

1. **jQuery** (`/potree/libs/jquery/jquery-3.1.1.min.js`)
   - Required by Potree for initialization
   - Must be loaded first

2. **BinaryHeap** (`/potree/libs/other/BinaryHeap.js`)
   - Used for visibility updates in point cloud rendering
   - Required for `Potree.updatePointClouds()`

3. **TWEEN** (`/potree/libs/tween/tween.min.js`)
   - Used for camera animations (e.g., `viewer.fitToScreen()`)
   - Exposes global `TWEEN` object

4. **proj4** (`/potree/libs/proj4/proj4.js`)
   - Used for coordinate transformations
   - Required for map features and geospatial operations

5. **Potree** (`/potree/potree.js`)
   - Main Potree library
   - Exposes global `Potree` object

### CSS

- **Potree CSS** (`/potree/potree.css`)
  - Required for proper styling of Potree UI elements

## Component Implementation

### PotreeViewer Component

Location: `src/components/PotreeViewer.tsx`

#### Key Features

1. **Waits for Potree to Load**
   - Uses retry logic to wait for Potree library to be available
   - Verifies `Potree.Viewer` exists before proceeding

2. **Creates Potree.Viewer**
   ```typescript
   const viewer = new Potree.Viewer(containerElement);
   viewer.setEDLEnabled(true);
   viewer.setFOV(60);
   viewer.setPointBudget(1_000_000);
   ```

3. **Loads Point Cloud**
   ```typescript
   Potree.loadPointCloud('/pointclouds/lion_takanawa/cloud.js', 'lion', function(e) {
     viewer.scene.addPointCloud(e.pointcloud);
     let material = e.pointcloud.material;
     material.size = 1;
     material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
     viewer.fitToScreen();
   });
   ```

#### Configuration

Matches the `lion.html` example exactly:
- **EDL Enabled**: Eye-Dome Lighting for better depth perception
- **FOV**: 60 degrees (matches working example)
- **Point Budget**: 1,000,000 points
- **Material Size**: 1
- **Point Size Type**: ADAPTIVE

## Loading Order

### Critical: Script Loading Sequence

The scripts in `index.html` must load in this exact order:

```html
<!-- 1. jQuery (required by Potree) -->
<script src="/potree/libs/jquery/jquery-3.1.1.min.js"></script>

<!-- 2. BinaryHeap (for visibility updates) -->
<script src="/potree/libs/other/BinaryHeap.js"></script>

<!-- 3. TWEEN (for camera animations) -->
<script src="/potree/libs/tween/tween.min.js"></script>

<!-- 4. proj4 (for coordinate transformations) -->
<script src="/potree/libs/proj4/proj4.js"></script>

<!-- 5. Potree (main library) -->
<script src="/potree/potree.js"></script>
```

**Why order matters:**
- Potree depends on jQuery being available
- Potree initialization checks for BinaryHeap, TWEEN, and proj4
- If dependencies load after Potree, you'll get "X is not defined" errors

## Point Cloud Data

### Location

Point cloud data is served from `public/pointclouds/lion_takanawa/`:

```
public/
  pointclouds/
    lion_takanawa/
      cloud.js              # Point cloud metadata (JSON format)
      cloud.json            # Alternative metadata format
      data/                 # Binary point cloud data
        r/                  # Octree nodes
          *.bin             # Binary point data
          *.hrc             # Hierarchy files
```

### File Format

- **cloud.js**: Contains JSON metadata (despite .js extension)
  - Defines bounding box, octree structure, point attributes
  - Served with `Content-Type: application/json` (configured in Vite)

- **data/r/**: Binary octree nodes
  - Organized in hierarchical structure
  - Loaded on-demand as user navigates

## Differences from Previous Implementation

### Previous Approach (potree-loader npm package)

**Problems:**
- Used `potree.loadPointCloud(name, url)` (instance method, wrong parameter order)
- Internal code checked `if (url === "cloud.js")` exactly, causing "Unsupported file type" errors
- API mismatch between npm package and actual Potree library
- Required complex URL fallback logic

### Current Approach (Actual Potree Library)

**Advantages:**
- Uses `Potree.loadPointCloud(path, name, callback)` (static method, correct API)
- Works with full path URLs (e.g., `/pointclouds/lion_takanawa/cloud.js`)
- Matches proven working example exactly
- No API compatibility issues

## Building Potree

If you need to rebuild Potree (e.g., after modifying source):

```bash
cd potree/
npm install
npm run build
```

This creates `potree/build/potree/potree.js` which should be copied to `public/potree/`.

**Note:** The `potree/` directory is in `.gitignore` and not committed to the repository. Only the built files in `public/potree/` are committed.

## Troubleshooting

### "Potree.Viewer is not a constructor"

**Cause:** Potree library hasn't loaded yet or dependencies are missing.

**Solution:**
1. Check browser console for missing dependency errors
2. Verify all scripts load in correct order
3. Check that `Potree` is available: `console.log(typeof Potree)`

### "BinaryHeap is not defined"

**Cause:** BinaryHeap.js not loaded before Potree.

**Solution:** Ensure BinaryHeap script tag comes before potree.js in index.html.

### "TWEEN is not defined"

**Cause:** TWEEN.js not loaded before Potree.

**Solution:** Ensure tween.min.js script tag comes before potree.js in index.html.

### "proj4 is not defined"

**Cause:** proj4.js not loaded before Potree.

**Solution:** Ensure proj4.js script tag comes before potree.js in index.html.

### "jQuery is not defined"

**Cause:** jQuery not loaded before Potree.

**Solution:** Ensure jQuery script tag is first, before all other dependencies.

### Point Cloud Not Loading

**Check:**
1. Point cloud files exist in `public/pointclouds/lion_takanawa/`
2. `cloud.js` is accessible at `/pointclouds/lion_takanawa/cloud.js`
3. Browser console for network errors (404, CORS, etc.)
4. Content-Type headers (should be `application/json` for cloud.js)

## Future Enhancements

### Adding Annotation Functionality

The current implementation is minimal and focused on loading the point cloud. To add annotations:

1. **Click Handlers**: Add raycasting to detect clicks on point cloud
2. **Marker Rendering**: Use Three.js objects to render annotation markers
3. **Annotation Storage**: Integrate with existing annotation service
4. **UI Controls**: Add annotation creation/editing UI

### Performance Optimization

- **Point Budget**: Adjust `viewer.setPointBudget()` based on device capabilities
- **LOD**: Potree automatically handles level-of-detail based on camera distance
- **Worker Threads**: Potree uses web workers for point cloud processing (already configured)

## References

- **Potree Source**: `potree/examples/lion.html` (working reference implementation)
- **Potree Documentation**: [Potree GitHub](https://github.com/potree/potree)
- **Three.js**: Used internally by Potree for 3D rendering

## License

Potree is licensed under BSD-2-Clause. See `public/potree/LICENSE` for details.

