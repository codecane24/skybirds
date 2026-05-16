# 🚀 Deploy to Vercel - Image Upload Fix

## Current Status
✅ Code is ready
✅ Package installed
✅ Error handling added
⚠️ **Needs: Vercel Blob Storage setup (5 minutes)**

---

## 📋 Deployment Checklist

### 1️⃣ Commit and Push Your Changes
```bash
git add .
git commit -m "fix: Add Vercel Blob support for image uploads"
git push
```

### 2️⃣ Set Up Vercel Blob (REQUIRED)

**While Vercel is deploying**, do this:

1. Open https://vercel.com/dashboard in your browser
2. Click on your **skybirds** project
3. Click **Storage** tab (top navigation)
4. Click **Create Database** button
5. Select **Blob** from the options
6. Enter store name: `skybirds-uploads`
7. Click **Create**

**That's it!** The token is automatically added.

### 3️⃣ Wait for Deployment

Vercel will automatically:
- Deploy your code
- Add BLOB_READ_WRITE_TOKEN to environment
- Make your uploads work

### 4️⃣ Test on Live Site

Visit: https://skybirds6734.builtwithrocket.new/admin/team

Try:
1. Click "Add New" team member
2. Upload an image
3. Save
4. ✅ Should work!

---

## 🔍 How to Verify Setup

### Check if Blob Store Exists:
1. Vercel Dashboard → Your Project → **Storage**
2. Should see: **skybirds-uploads** (Blob)

### Check if Token Exists:
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Should see: `BLOB_READ_WRITE_TOKEN = vercel_blob_rw_xxxxx`

### Check Deployment Logs:
1. Vercel Dashboard → Your Project → **Deployments**
2. Click latest deployment → **Functions** tab
3. Upload should show: "Image uploaded successfully: https://..."

---

## ⚡ Quick Test Commands

```bash
# 1. Commit changes
git add .
git commit -m "fix: Add Vercel Blob support"
git push

# 2. Wait for deployment (~2 minutes)

# 3. Test on live site
```

---

## 📊 What Changed

| File | Change |
|------|--------|
| `src/lib/upload.ts` | ✅ Auto-detects environment (local vs Vercel) |
| `src/app/api/team/route.ts` | ✅ Better error messages |
| `src/app/api/team/[id]/route.ts` | ✅ Better error handling |
| `package.json` | ✅ Added @vercel/blob |
| `image-hosts.config.mjs` | ✅ Added Vercel Blob domain |

---

## 🐛 Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN not found"
**Solution:** Create Blob store in Vercel Dashboard → Storage

### Error: "Unauthorized" 
**Solution:** Recreate the Blob store or check token in Environment Variables

### Error: "Module not found: @vercel/blob"
**Solution:** Already fixed! Just push your changes.

### Images still not uploading
**Solution:** Check Vercel deployment logs for exact error message

---

## ✨ Expected Behavior

### Local Development (npm run dev):
```
✓ Attempting local file system upload...
✓ Image saved to: /assets/upload/team/123-abc.jpg
```

### Vercel Production:
```
✗ Attempting local file system upload...
✗ Local file system failed (expected on serverless)
✓ Using Vercel Blob...
✓ Image uploaded: https://xxx.public.blob.vercel-storage.com/team/123-abc.jpg
```

---

## 💰 Cost

**Vercel Blob Free Tier:**
- 1 GB storage
- 100 GB bandwidth per month
- More than enough for your team photos

---

## 🎯 Summary

1. ✅ Code is ready - just push to GitHub
2. ⏱️ Takes 5 minutes to set up Blob storage
3. 🚀 Your uploads will work on production
4. 💯 No more "internal server error"!

**Next Step:** Run the commands below 👇

```bash
git add .
git commit -m "fix: Add Vercel Blob support for image uploads"
git push
```

Then set up Blob storage in Vercel Dashboard while it deploys!
