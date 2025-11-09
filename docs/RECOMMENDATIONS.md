# Recommendations: Point Cloud Loading Issue

## Problem Summary

`potree-loader@1.10.4` does not work in any local development environment:
- ❌ Dev server (`npm run dev`)
- ❌ Production preview (`npm run preview`)
- ❓ Production deployment (untested, may work)

This is a **critical blocker** for development.

## Recommended Actions

### Option 1: Switch to Alternative Library (Strongly Recommended)

**Best Option:** Replace `potree-loader` with a library that works in development.

#### Candidates:
1. **`@pnext/three-loader`**
   - TypeScript-based Potree loader
   - Issue: Requires Three.js ~0.160.0 (we have 0.181.0)
   - Solution: Downgrade Three.js or wait for compatibility update

2. **Direct Potree Usage**
   - Use Potree library directly (not potree-loader)
   - More setup required, but more control
   - May work better with modern bundlers

3. **Other Three.js Point Cloud Loaders**
   - Research alternatives that work with Vite
   - Check npm for "point cloud" + "three.js" + "loader"

### Option 2: Development Mock (Quick Fix)

Create a mock point cloud for development:

```typescript
// Development mode: Use mock point cloud
// Production: Use real potree-loader
const useMockPointCloud = import.meta.env.DEV;

if (useMockPointCloud) {
  // Create a simple Three.js scene with placeholder geometry
  // Allows testing annotation features without point cloud
} else {
  // Use potree-loader
}
```

**Pros:**
- Fast development iteration
- Can test all annotation features
- No library changes needed

**Cons:**
- Doesn't test actual point cloud loading
- Need to test in production for real behavior

### Option 3: Fork and Fix potree-loader

If you need to stick with potree-loader:
1. Fork the repository
2. Fix the local development issue
3. Use your fork
4. Consider contributing fix back upstream

## Decision Matrix

| Option | Development Speed | Production Risk | Maintenance |
|--------|------------------|-----------------|-------------|
| Switch Library | Medium (setup time) | Low | Medium |
| Development Mock | High | Medium | Low |
| Fork & Fix | Low (fix time) | Low | High |

## Recommendation

**For immediate development:** Use Option 2 (Development Mock) to unblock development.

**For long-term:** Switch to Option 1 (Alternative Library) - prefer `@pnext/three-loader` if Three.js compatibility can be resolved, or find another working alternative.

## Next Steps

1. **Short-term:** Implement development mock to unblock annotation development
2. **Medium-term:** Research and test alternative point cloud loaders
3. **Long-term:** Switch to working alternative or contribute fix to potree-loader

