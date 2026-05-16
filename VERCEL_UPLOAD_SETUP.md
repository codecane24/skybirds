# Vercel Blob Storage Setup Guide

## Quick Setup (5 minutes)

### Step 1: Install Vercel Blob
```bash
npm install @vercel/blob
```

### Step 2: Get Vercel Blob Token
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (skybirds)
3. Go to **Storage** tab
4. Click **Create Database** → Select **Blob**
5. Name it "skybirds-uploads" (or any name)
6. Copy the `BLOB_READ_WRITE_TOKEN` that appears

### Step 3: Add Environment Variable

**Local (.env):**
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

**Vercel Dashboard:**
- Go to Settings → Environment Variables
- The `BLOB_READ_WRITE_TOKEN` should already be there (auto-added)
- If not, add it manually

### Step 4: Replace Upload File
```bash
# Backup current version
mv src/lib/upload.ts src/lib/upload-local-backup.ts

# Use Vercel Blob version  
mv src/lib/upload-vercel-blob.ts src/lib/upload.ts
```

### Step 5: Test Locally
```bash
npm run dev
```

- Go to http://localhost:4028/admin/team
- Try adding a team member with an image
- It should upload successfully!

### Step 6: Deploy
```bash
git add .
git commit -m "Fix: Use Vercel Blob for image uploads"
git push
```

Vercel will auto-deploy and your uploads will work on production!

---

## How It Works

- **Local**: Uploads go to Vercel Blob Storage (cloud)
- **Production**: Same - Vercel Blob Storage
- **Storage**: Free tier includes **1GB storage** and **100GB bandwidth/month**
- **URLs**: Images get permanent URLs like `https://xxx.public.blob.vercel-storage.com/...`

---

## Benefits

✅ **No external services** - Native Vercel integration
✅ **Auto-configured** - Token added automatically when you create blob store
✅ **Free tier** - 1GB storage included
✅ **Fast** - CDN-backed
✅ **Simple API** - Just 2 functions: `put()` and `del()`
✅ **Works everywhere** - Same code for local & production

---

## Verification

After deploying, test these:
1. ✓ Add new team member with image
2. ✓ Edit team member and change image
3. ✓ Delete team member (old image should be deleted)
4. ✓ Check that images display correctly on frontend
5. ✓ Do same for Hero slides, Testimonials, Destinations

---

## Troubleshooting

**Error: "BLOB_READ_WRITE_TOKEN is not defined"**
- Make sure you created a Blob store in Vercel dashboard
- Check that the token is in your .env file
- Restart dev server after adding token

**Error: "Unauthorized"**
- Token might be invalid
- Regenerate token in Vercel dashboard

**Images not displaying**
- Check that `*.public.blob.vercel-storage.com` is in image-hosts.config.mjs
- Already added for you!

---

## Cost

- **Free tier**: 1GB storage + 100GB bandwidth/month
- **After free tier**: $0.15/GB storage + $0.15/GB bandwidth
- For your use case, free tier should be sufficient

---

## Alternative: If You Want Full Control

If you absolutely need files in your own server directory, you would need to:

1. **Switch to VPS hosting** (DigitalOcean, AWS EC2, Linode)
   - Not serverless
   - Full file system access
   - Requires server management
   - More expensive (~$5-10/month minimum)

2. **Keep Vercel for app + Separate file server**
   - Use Vercel for Next.js app
   - Set up separate server just for file storage
   - Complex architecture

**Recommendation: Stick with Vercel Blob** - It's the simplest solution that works perfectly with your current setup.
