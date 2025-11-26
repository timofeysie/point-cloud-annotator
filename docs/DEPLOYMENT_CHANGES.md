# Deployment Process Changes

## Summary

The deployment process for Lambda/Terraform infrastructure remains **unchanged**. However, the frontend deployment now includes Potree library files that are automatically handled by the existing build and deployment process.

## What Has Changed

### Frontend Deployment

**New Files Included:**
- `public/potree/` directory containing:
  - `potree.js` (2.2MB) - Main Potree library
  - `potree.css` - Potree styles
  - `libs/` - Dependencies (jQuery, BinaryHeap, TWEEN, proj4)
  - `resources/` - Potree resources (icons, images, translations)
  - `workers/` - Web workers for point cloud processing

**How It Works:**
1. Vite's `publicDir: 'public'` configuration automatically copies all files from `public/` to `dist/` during build
2. `npm run build` includes Potree files in `dist/potree/`
3. `aws s3 sync dist/` deploys everything, including Potree files

### No Changes Required

**Terraform Infrastructure:**
- ✅ No changes needed - S3 bucket configuration is unchanged
- ✅ Bucket policy already allows public read access
- ✅ Website hosting configuration is unchanged

**Lambda Functions:**
- ✅ No changes needed - annotation API endpoints are unchanged
- ✅ Lambda code and dependencies are unchanged

**Deployment Script:**
- ✅ `scripts/deploy-s3.sh` works as-is
- ✅ Potree JS files use default `text/javascript` Content-Type (correct)
- ✅ Only point cloud metadata files need Content-Type fixes (already handled)

## Deployment Process (Unchanged)

The deployment steps remain the same:

```bash
# 1. Deploy infrastructure (unchanged)
cd infrastructure
terraform init
terraform apply

# 2. Get API Gateway URL (unchanged)
terraform output api_gateway_url

# 3. Configure frontend environment (unchanged)
cd ..
echo "VITE_API_GATEWAY_URL=$(cd infrastructure && terraform output -raw api_gateway_url)" > .env

# 4. Build frontend (now includes Potree files automatically)
npm run build

# 5. Deploy to S3 (Potree files included automatically)
export S3_BUCKET_NAME=$(cd infrastructure && terraform output -raw s3_bucket_name)
aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete

# Or use the deployment script:
./scripts/deploy-s3.sh $S3_BUCKET_NAME
```

## File Sizes

**New Files Added to Deployment:**
- `dist/potree/potree.js`: ~2.2MB
- `dist/potree/potree.js.map`: ~5MB (source map, optional)
- `dist/potree/` total: ~8-10MB (including all dependencies and resources)

**Impact:**
- S3 storage: +8-10MB per deployment
- Initial page load: Potree.js loads asynchronously via script tag
- No impact on Lambda cold starts or API performance

## Content-Type Headers

**Potree Files:**
- `potree.js`: Default `text/javascript` ✅ (correct, no fix needed)
- `potree.css`: Default `text/css` ✅ (correct, no fix needed)
- Dependency JS files: Default `text/javascript` ✅ (correct, no fix needed)

**Point Cloud Files (already handled):**
- `cloud.js`: Fixed to `application/json` by `deploy-s3.sh` ✅
- `cloud.json`: Fixed to `application/json` by `deploy-s3.sh` ✅
- `.bin` files: Fixed to `application/octet-stream` by `deploy-s3.sh` ✅
- `.hrc` files: Fixed to `application/octet-stream` by `deploy-s3.sh` ✅

## Verification After Deployment

After deploying, verify:

1. **Potree Library Loads:**
   - Open browser console
   - Check for "Potree 1.8.0" message
   - Verify no "Potree is not defined" errors

2. **Dependencies Load:**
   - Check network tab for:
     - `/potree/libs/jquery/jquery-3.1.1.min.js` (200 OK)
     - `/potree/libs/other/BinaryHeap.js` (200 OK)
     - `/potree/libs/tween/tween.min.js` (200 OK)
     - `/potree/libs/proj4/proj4.js` (200 OK)
     - `/potree/potree.js` (200 OK)

3. **Point Cloud Loads:**
   - Point cloud should render in the viewer
   - No "Unsupported file type" errors
   - Camera automatically fits to point cloud

## Troubleshooting

### Potree Files Not Loading

**Check:**
1. Files exist in S3: `aws s3 ls s3://$BUCKET_NAME/potree/`
2. Files are publicly accessible (bucket policy allows GetObject)
3. Browser console for 404 errors

**Fix:**
- Re-run `aws s3 sync dist/ s3://$BUCKET_NAME --delete`
- Verify bucket policy allows public read access

### Content-Type Issues

**Potree JS files:**
- Should be `text/javascript` (default is correct)
- No manual fix needed

**Point cloud files:**
- Use `deploy-s3.sh` script which fixes Content-Type headers automatically
- Or manually fix using `aws s3 cp` with `--content-type` flag

## Migration Notes

**From Previous Implementation:**
- Previously used `potree-loader` npm package (bundled in React app)
- Now uses actual Potree library (loaded via script tags)
- Deployment process is simpler (no npm package bundling issues)
- File size is larger but more reliable

**Breaking Changes:**
- None - deployment process is backward compatible
- Existing Terraform infrastructure works without changes
- Lambda functions unchanged

## Recommendations

1. **Use Deployment Script:**
   - Always use `scripts/deploy-s3.sh` instead of raw `aws s3 sync`
   - Script handles Content-Type fixes automatically

2. **Monitor File Sizes:**
   - Potree files add ~8-10MB to deployment
   - Consider CloudFront for better performance (optional)

3. **Cache Headers:**
   - Potree files are large and rarely change
   - Consider adding longer cache headers (already in deploy script)

4. **Future Optimizations:**
   - Potree.js could be loaded from CDN (if available)
   - Consider code splitting if Potree becomes optional feature


