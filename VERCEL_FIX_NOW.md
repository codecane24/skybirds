# URGENT: Fix Image Upload on Vercel

## The Problem
Image uploads are failing on Vercel because **Vercel Blob Storage is not configured**.

## Quick Fix (5 Minutes)

### Step 1: Create Vercel Blob Store
1. Go to https://vercel.com/dashboard
2. Click on your **skybirds** project
3. Click **Storage** tab (in the top menu)
4. Click **Create Database**
5. Select **Blob**
6. Name it: **skybirds-uploads**
7. Click **Create**

### Step 2: Verify Token
The token `BLOB_READ_WRITE_TOKEN` should be **automatically added** to your environment variables.

To verify:
1. Stay in your Vercel project
2. Go to **Settings** → **Environment Variables**
3. Look for `BLOB_READ_WRITE_TOKEN`
4. It should already be there with a value like `vercel_blob_rw_xxxxx`

### Step 3: Redeploy
Vercel should automatically redeploy after creating the Blob store.

If not, manually trigger a deployment:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

OR simply push a new commit:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### Step 4: Test
1. Go to your live site: https://skybirds6734.builtwithrocket.new/admin/team
2. Try adding or editing a team member with an image
3. It should work now! ✅

---

## How to Check Deployment Logs

If it still fails, check the logs:

1. Go to Vercel Dashboard → Your project → **Deployments**
2. Click on the latest deployment
3. Click **Functions** tab
4. Find the function that failed (e.g., `api/team/[id]`)
5. Look for error messages

Common error messages:
- **"BLOB_READ_WRITE_TOKEN not found"** → Blob store not created yet
- **"Unauthorized"** → Token is invalid, try recreating the blob store
- **"Module not found: @vercel/blob"** → Package not installed (already fixed)

---

## Verify It's Working

After deployment, the logs should show:
```
Attempting local file system upload...
Local file system failed, trying Vercel Blob...
Image uploaded successfully: https://xxx.public.blob.vercel-storage.com/...
```

---

## Important Notes

✅ **Local development** → Still uses local file system (no token needed)  
✅ **Vercel production** → Uses Vercel Blob Storage (token auto-configured)  
✅ **Free tier** → 1GB storage (plenty for your needs)  

---

## Alternative: Skip for Now

If you want to deploy without fixing this immediately:
1. Don't upload new images on production
2. Use existing images from git repository
3. Set up Blob storage later

But it's better to fix it now (only takes 5 minutes)!

---

## Still Having Issues?

If after following all steps it still fails:

1. **Check the error message in your admin panel** - The error now includes details
2. **Check Vercel deployment logs** - Will show exact error
3. **Verify @vercel/blob is installed** - Check package.json (already done ✅)
4. **Try recreating the Blob store** - Delete and create again
5. **Check environment variables** - Make sure BLOB_READ_WRITE_TOKEN exists

---

## What We Changed

✅ Installed `@vercel/blob` package  
✅ Updated upload logic to auto-detect environment  
✅ Added detailed error messages  
✅ Added proper error handling in API routes  
✅ Configured image domains for Vercel Blob  

**Next step:** Create Vercel Blob Store and redeploy!
