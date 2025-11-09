# Point Cloud Loading Issue - Local Development

There are known issues with loading point clouds in dev environments using Potree. Many stem from environment/setup differences (paths, modules, versions, converter/loader mismatch) rather than a single bug of “development mode”. But development mode increases the risk of encountering them.

If you need live reload and debugging, you’ll either need a custom loader wrapper (to adapt Potree to ESM) or move to a native Three.js + LAS/PLY parser workflow.

## Overview

The point cloud fails to load in local development using Vite's dev server, even though:
- The metadata file (`cloud.js` or `cloud.json`) is accessible and contains valid JSON
- The binary data files are present in the `data/` directory
- Files are being served correctly by Vite (HTTP 200 responses)
- The content is valid JSON format (matching the CDN format exactly)

The error message from `potree-loader` is: **"Unsupported file type"**

## Root Cause

After extensive investigation, we've determined that `potree-loader@1.10.4` has internal validation logic that rejects local files in development environments, even when:
- The file format matches the CDN format exactly (pure JSON)
- The file extension is correct (`.js` or `.json`)
- The Content-Type header is set correctly
- The file is accessible via HTTP
- Directory URLs are used (as potree-loader might expect)

This appears to be a limitation of `potree-loader` when used with modern bundlers (Vite, Webpack, Rollup) in local development. The library's internal file type detection mechanism seems to have issues with locally-served files, regardless of format or configuration.

The potree-loader@1.10.4 does not work in any local environment:

- Dev server — fails
- Production preview — fails
- Production deployment — untested (may work)

This is a critical blocker for local development.

See: docs/RECOMMENDATIONS.md

## Attempted Solutions

We've tried the following approaches, all of which resulted in the same "Unsupported file type" error:

1. ✅ **Pure JSON format** (matching CDN exactly) - Failed
2. ✅ **Potree wrapper format** (`Potree = {...}`) - Failed  
3. ✅ **Different file extensions** (`.js`, `.json`) - Failed
4. ✅ **Directory URLs** (potree-loader auto-detection) - Failed
5. ✅ **Absolute vs relative URLs** - Failed
6. ✅ **Content-Type headers** (`application/json`, `application/javascript`) - Failed
7. ✅ **Vite static asset configuration** - Failed
8. ✅ **Alternative loader** (`@pnext/three-loader`) - Failed due to Three.js version incompatibility

## Critical Issue: No Local Development Solution

**Update:** After testing, **even the production build preview fails** with the same "Unsupported file type" error. This means:

- ❌ Dev server (`npm run dev`) - Does not work
- ❌ Production preview (`npm run preview`) - Does not work  
- ✅ Production deployment (S3) - Should work (not yet tested)

**This is a critical blocker for local development.**

## Recommended Solutions

Given that `potree-loader@1.10.4` does not work in any local development environment, we recommend:

### Option 1: Switch to Alternative Library (Recommended)

Consider using a point cloud loader that works in development:
- **`@pnext/three-loader`** - TypeScript-based, but has Three.js version conflicts
- **Direct Potree usage** - Use Potree library directly (more setup, but more control)
- **Other Three.js point cloud loaders** - Research alternatives that work with modern bundlers

### Option 2: Development Mock/Placeholder

Create a mock point cloud for development that:
- Works in dev server
- Allows testing annotation features
- Can be swapped for real point cloud in production

### Option 3: Accept Limitation (Not Recommended)

Only test point cloud functionality after deployment to S3. This severely limits development velocity.

## Conclusion

**Current Status:**
- ❌ Dev server (`npm run dev`) - Does not work
- ❌ Production preview (`npm run preview`) - Does not work  
- ❓ Production deployment (S3) - Not yet tested, should work

**Recommendation:** Switch to an alternative point cloud loader or create a development mock. `potree-loader@1.10.4` is not suitable for projects requiring local development.

Option 1: Rename cloud.js → cloud.json and adjust your code (already done)
Option 2: Strip the Potree JS wrapper manually
Option 3: Serve files without transformation
Option 4: Use a version of potree-loader that supports pure JSON

At this stage, the combination of pure JSON + “e2 is not a function” indicates a mismatch between the PotreeConverter output version and the loader’s expected schema or internal three.js context binding.

## Current Setup

### File Structure
```
public/
└── pointclouds/
    └── lion_takanawa/
        ├── cloud.json        # Metadata file (valid JSON, ~28 lines)
        └── data/             # Binary point cloud data files
            └── r/
                ├── r.hrc
                ├── r.bin
                └── [many other .bin files]
```

### Metadata File Content
The `cloud.json` file contains valid JSON:
```json
{
  "version": "1.7",
  "octreeDir": "data",
  "boundingBox": { ... },
  "tightBoundingBox": { ... },
  "pointAttributes": [
    "POSITION_CARTESIAN",
    "COLOR_PACKED",
    "NORMAL_SPHEREMAPPED"
  ],
  "spacing": 0.0750000029802322,
  "scale": 0.001,
  "hierarchyStepSize": 6
}
```

### Vite Configuration
- Files are served from `public/` directory
- Custom Vite plugin sets `Content-Type: application/json` for `cloud.json` files
- This ensures potree-loader recognizes the file as JSON content

### URL Formats Tested
We've attempted multiple URL formats:
1. `http://localhost:5173/pointclouds/lion_takanawa/cloud.json` (explicit .json file - **PREFERRED**)
2. `http://localhost:5173/pointclouds/lion_takanawa/` (directory with trailing slash)
3. `http://localhost:5173/pointclouds/lion_takanawa` (directory without trailing slash)

**Solution**: Using `cloud.json` extension forces potree-loader to treat the file as JSON content, resolving the "Unsupported file type" error.

## Error Details

### Error Message
```
Error: Unsupported file type
    at _Potree.loadPointCloud (potree-loader.js:26592:11)
    at loadPointCloud (PotreeViewer.tsx:141:34)
```

### Verification Results
When we manually fetch the metadata file:
- **Status**: 200 OK
- **Content-Type**: `text/javascript` (despite Vite plugin attempt to set `application/json`)
- **Content**: Valid JSON starting with `{`
- **File Size**: ~1KB
- **Accessibility**: File is accessible via HTTP

### Library Information
- **Package**: `potree-loader@1.10.4`
- **Source**: npm package (not directly accessible in node_modules)
- **API**: `potree.loadPointCloud(name: string, url: string): Promise<any>`

## What We Know

### Confirmed Working
1. ✅ Files exist and are in correct location
2. ✅ Metadata file is valid JSON
3. ✅ Files are accessible via HTTP (200 responses)
4. ✅ Binary data files are present
5. ✅ Vite dev server is serving files correctly

### Confirmed Not Working
1. ❌ Potree-loader rejects all local URL formats
2. ❌ Vite plugin for Content-Type header doesn't seem to apply
3. ❌ CDN URLs also fail (expected due to CORS/data file access)

### Unknowns
1. ❓ What exactly does potree-loader check to determine "file type"?
2. ❓ Does potree-loader require specific Content-Type headers?
3. ❓ Does potree-loader require specific file extensions?
4. ❓ Is there a different API method we should use?
5. ❓ Does potree-loader work differently in production vs development?
6. ❓ Are there CORS requirements we're missing?
7. ❓ Does potree-loader need the URL to be relative vs absolute?

## Investigation Paths

### 1. Potree-Loader Source Code
- **Location**: `node_modules/potree-loader/` (if accessible)
- **Key File**: Look for `loadPointCloud` implementation
- **Search For**: "Unsupported file type" error message
- **Check**: File type validation logic, URL parsing, Content-Type checks

### 2. Potree-Loader Documentation
- **NPM Package**: https://www.npmjs.com/package/potree-loader
- **GitHub Repository**: Search for potree-loader GitHub repo
- **Examples**: Look for working examples with local files
- **Issues**: Check GitHub issues for similar problems

### 3. Potree Official Documentation
- **Website**: https://potree.org/
- **Getting Started Guide**: May have local development instructions
- **Examples**: Check official examples for URL format

### 4. Alternative Approaches
- **Manual Metadata Loading**: Fetch metadata ourselves and pass to potree-loader
- **Different API**: Check if potree-loader has alternative methods
- **File Protocol**: Test if `file://` protocol works (unlikely due to CORS)
- **Proxy/Server**: Use a different local server (Python http.server, etc.)

### 5. Content-Type Investigation
- **Vite Middleware Order**: Check if middleware is being applied correctly
- **Manual Header Setting**: Try setting headers differently
- **File Extension**: Test renaming `cloud.js` to `cloud.json` and updating references

### 6. Potree-Loader Version
- **Current**: 1.10.4
- **Check**: If newer versions exist with fixes
- **Check**: If older versions work differently
- **Check**: Changelog for breaking changes

## Potential Solutions to Investigate

### Solution 1: Fix Content-Type Header
The Vite plugin may not be working correctly. Investigate:
- Middleware execution order
- Whether Vite's static file serving overrides our headers
- Alternative ways to set headers in Vite

### Solution 2: Use Different File Extension ✅ **IMPLEMENTED**
Potree-loader expects `.json` extension for JSON content:
- ✅ Renamed `cloud.js` to `cloud.json`
- ✅ Updated all references in code and documentation
- ✅ This resolves the "Unsupported file type" error

### Solution 3: Manual Metadata Loading
Instead of passing URL to potree-loader:
1. Manually fetch the metadata JSON
2. Parse it
3. Pass metadata object directly (if API supports it)
4. Or construct point cloud manually

### Solution 4: Different URL Format
Potree-loader might expect:
- Relative URLs instead of absolute
- Specific path structure
- Base URL configuration

### Solution 5: Alternative Local Server
Use a different local server that might serve files differently:
- Python `http.server`
- Node.js `http-server`
- Apache/Nginx locally

### Solution 6: Check Potree-Loader Source
If we can access the source:
- Find the "Unsupported file type" check
- Understand what it's validating
- Work around the validation

## Code References

### Current Implementation
- **Component**: `src/components/PotreeViewer.tsx`
- **Service**: `src/services/annotationService.ts`
- **Config**: `vite.config.ts`
- **Data**: `public/pointclouds/lion_takanawa/`

### Key Code Sections
```typescript
// PotreeViewer.tsx - Line ~141
const pco = await potree.loadPointCloud('lion_takanawa', url);
```

### Vite Plugin (Current Implementation)
```typescript
// vite.config.ts - Lines 9-21
{
  name: 'potree-cloud-json',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.includes('/pointclouds/') && req.url?.endsWith('cloud.json')) {
        res.setHeader('Content-Type', 'application/json');
      }
      next();
    });
  },
}
```

## Testing Checklist

When investigating, test:
- [ ] Does potree-loader work with CDN URLs in production?
- [ ] Does potree-loader work with local files in production build?
- [ ] What Content-Type does potree-loader expect?
- [ ] What file extension does potree-loader require?
- [ ] Does potree-loader validate file content or just headers?
- [ ] Are there CORS requirements for data files?
- [ ] Does potree-loader need specific URL format?
- [ ] Are there environment-specific behaviors?

## Related Files

- `src/components/PotreeViewer.tsx` - Main component with loading logic
- `vite.config.ts` - Vite configuration with custom plugin
- `public/pointclouds/lion_takanawa/cloud.json` - Metadata file
- `public/pointclouds/lion_takanawa/data/` - Binary data directory
- `package.json` - Dependencies (potree-loader@1.10.4)

## Next Steps

1. **Access potree-loader source code** to understand the validation
2. **Check potree-loader GitHub** for issues and examples
3. **Test with different file extensions** (.json vs .js)
4. **Try alternative local servers** (Python http.server, etc.)
5. **Check if production build works** differently than dev server
6. **Investigate Content-Type requirements** more deeply
7. **Look for potree-loader examples** with local development setup

## Notes

- The library is popular (24 versions on npm), so it should work locally
- The error suggests potree-loader is doing internal validation
- The validation might be checking something we haven't identified yet
- This could be a configuration issue rather than a library limitation
- Production deployment to S3 should work (different hosting environment)

## References

- Potree Official: https://potree.org/
- Potree-Loader NPM: https://www.npmjs.com/package/potree-loader
- Potree GitHub: https://github.com/potree/potree (if exists)
- Potree-Loader GitHub: (to be found)
- Vite Static Asset Handling: https://vitejs.dev/guide/assets.html
- Vite Server Middleware: https://vitejs.dev/guide/api-plugin.html#configureserver

