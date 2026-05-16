# Image Upload Fix for Server Deployment

## Problem
The current upload system uses local file system which doesn't work on Netlify/Vercel/other serverless platforms.

## Solutions Comparison

### Option 1: Cloudinary (Recommended)
**Pros:**
- Free tier: 25GB storage, 25GB bandwidth/month
- Easy to set up
- Automatic image optimization
- CDN included
- Works on any platform

**Setup:**
1. Sign up at https://cloudinary.com
2. Get your credentials from dashboard
3. Install: `npm install cloudinary`
4. Add to `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
5. Replace `src/lib/upload.ts` with `src/lib/upload-cloudinary.ts`
6. Update `next.config.mjs` to add Cloudinary domain:
   ```js
   images: {
     remotePatterns: [
       ...imageHosts,
       {
         protocol: 'https',
         hostname: 'res.cloudinary.com',
       },
     ],
   }
   ```

---

### Option 2: Netlify Blobs
**Pros:**
- Native Netlify integration
- Good for Netlify deployments
- Simple API

**Cons:**
- Only works on Netlify
- Limited to 1GB free

**Setup:**
1. Install: `npm install @netlify/blobs`
2. No credentials needed (auto-configured on Netlify)
3. Replace `src/lib/upload.ts` with `src/lib/upload-netlify-blobs.ts`

---

### Option 3: AWS S3
**Pros:**
- Industry standard
- Highly scalable
- 5GB free (12 months)

**Cons:**
- More complex setup
- Need AWS account
- Requires IAM user configuration

**Setup:**
1. Create AWS account and S3 bucket
2. Create IAM user with S3 permissions
3. Install: `npm install @aws-sdk/client-s3`
4. Add to `.env`:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET=your-bucket-name
   ```
5. Replace `src/lib/upload.ts` with `src/lib/upload-s3.ts`
6. Update `next.config.mjs` to add S3 domain

---

## Recommendation

**Use Cloudinary** - It's the easiest to set up, has a generous free tier, and includes automatic image optimization and CDN delivery.

## Implementation Steps (Cloudinary)

1. **Install package:**
   ```bash
   npm install cloudinary
   ```

2. **Backup current upload.ts:**
   ```bash
   mv src/lib/upload.ts src/lib/upload-local-backup.ts
   ```

3. **Rename the cloudinary version:**
   ```bash
   mv src/lib/upload-cloudinary.ts src/lib/upload.ts
   ```

4. **Add environment variables to `.env`:**
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Add to Netlify environment variables:**
   - Go to Netlify dashboard → Site settings → Environment variables
   - Add the same three variables

6. **Update `next.config.mjs`:**
   Add Cloudinary domain to image remotePatterns

7. **Test locally, then deploy**

---

## Testing

After implementing:
1. Test adding a new team member with image
2. Test editing an existing team member's image
3. Verify old image gets deleted when uploading new one
4. Check that images display correctly
5. Deploy and test on server

---

## Fallback Strategy

If you want to support both local and cloud:
- Check for `process.env.USE_CLOUD_STORAGE`
- Use cloud storage if true, local if false
- Good for development vs production
