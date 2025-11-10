# Image Upload Setup Guide - Cloudinary

## Quick Summary of Changes

✅ **Admin Map Dark Mode** - Now uses CartoDB dark tiles in dark mode
✅ **Removed Skeleton Loaders** - Kept only on maps and lists (when loading)
✅ **Cloudinary Integration** - Complete image upload service ready to use

---

## 1. Image Upload with Cloudinary ✅

Cloudinary is **perfect for beginners** because:
- **FREE tier**: 25GB storage, unlimited bandwidth
- **No credit card required** initially
- **Simple integration**: Just upload files directly from frontend
- **Auto optimization**: Images are compressed automatically
- **CDN delivery**: Fast global delivery

### Setup Steps:

#### Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com/
2. Click "Sign Up" (Free)
3. Verify your email
4. Go to Dashboard

#### Step 2: Get Your Cloud Name
1. On Dashboard, copy your **Cloud Name**
2. It looks like: `dxxxxxxxx` or `your-cloud-name`

#### Step 3: Create Upload Preset (Choose One)

**OPTION A: UNSIGNED UPLOAD (Recommended for Beginners) ✅**

Use this if you want simple, quick uploads directly from frontend.

1. Go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Fill in:
   - **Preset Name**: `civic_connect`
   - **Unsigned**: Toggle ON ✓
   - Click **Save**

Then use this in code:
```typescript
import { uploadImageToCloudinary } from '@/lib/cloudinary';

const response = await uploadImageToCloudinary(file, 'civic-connect/issues');
```

**When to use UNSIGNED:**
- ✅ Simple uploads from frontend
- ✅ Public images (no sensitive data)
- ✅ No backend server needed
- ✅ Works great for civic issue photos
- ⚠️ Anyone with upload preset can upload to your account

---

**OPTION B: SIGNED UPLOAD (Recommended for Security) 🔒**

Use this if you want to control who can upload (requires backend).

1. Go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Fill in:
   - **Preset Name**: `civic_connect_signed`
   - **Unsigned**: Toggle OFF ✗
   - Click **Save**

5. Go to **Account Settings** → **API Keys**
   - Copy your **API Secret** (keep this SECRET!)
   - Save to backend `.env` only:
     ```env
     CLOUDINARY_API_SECRET=your_api_secret_here
     ```

Then create a backend endpoint to generate signed uploads:
```typescript
// Backend endpoint (e.g., /api/cloudinary-signature)
import cloudinary from 'cloudinary';

export const getCloudinarySignature = (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.v2.utils.api_sign_request(
    { timestamp },
    process.env.CLOUDINARY_API_SECRET
  );
  
  res.json({
    timestamp,
    signature,
    cloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME
  });
};
```

Then in frontend:
```typescript
// Get signature from backend
const { signature, timestamp } = await fetch('/api/cloudinary-signature').then(r => r.json());

// Upload with signature
const formData = new FormData();
formData.append('file', file);
formData.append('api_key', VITE_CLOUDINARY_API_KEY);
formData.append('timestamp', timestamp);
formData.append('signature', signature);

await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
  method: 'POST',
  body: formData
});
```

**When to use SIGNED:**
- 🔒 Restrict uploads to authenticated users only
- 🔒 Prevent abuse and spam uploads
- 🔒 Track who uploaded what
- 🔒 Production apps with user authentication
- ⚠️ Requires backend server

---

**QUICK COMPARISON:**

| Feature | Unsigned | Signed |
|---------|----------|--------|
| Setup Time | 2 minutes | 10 minutes |
| Security | Basic | High |
| Backend Needed | No | Yes |
| Best For | Learning | Production |
| Risk of Abuse | Medium | Low |
| Perfect For | Civic App | ✅ YES |

**For CivicConnect**: Use **UNSIGNED** for quick start, then add **SIGNED** for production!

---

#### Step 4: Add to Your .env File
Create or update `.env` in your project root:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=civic_connect
```

Replace `your_cloud_name_here` with your actual cloud name!

### How to Use in Code:

```typescript
import { uploadImageToCloudinary, uploadMultipleImages } from '@/lib/cloudinary';

// Upload single image
const handleImageUpload = async (file: File) => {
  try {
    const response = await uploadImageToCloudinary(file, 'civic-connect/issues');
    console.log('Image uploaded:', response.secure_url);
    return response.secure_url; // Use this URL in your database
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Upload multiple images
const handleMultipleUpload = async (files: File[]) => {
  try {
    const responses = await uploadMultipleImages(files, 'civic-connect/issues');
    const imageUrls = responses.map(r => r.secure_url);
    return imageUrls;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Where to Store Images in Database:

In your `Issue` type (in `src/types/issue.ts`), add:
```typescript
export interface Issue {
  // ... existing fields ...
  photos?: string[];  // Array of Cloudinary URLs
}
```

When reporting an issue, store the returned `response.secure_url`:
```typescript
const issueData = {
  title: 'Road Pothole',
  description: 'Large pothole on main street',
  photos: [
    'https://res.cloudinary.com/your-cloud/image/upload/v123/abc.jpg',
    'https://res.cloudinary.com/your-cloud/image/upload/v123/def.jpg'
  ],
  // ... other fields ...
};
```

### Advanced: Optimize Images

```typescript
import { getOptimizedImageUrl } from '@/lib/cloudinary';

// Get thumbnail (200x200, optimized for web)
const thumbnail = getOptimizedImageUrl(publicId, {
  width: 200,
  height: 200,
  quality: 'auto',
  format: 'webp'
});

// Get full size (optimized)
const fullSize = getOptimizedImageUrl(publicId, {
  quality: 'good',
  format: 'auto'
});
```

---

## 2. Admin Map Now Has Dark Mode ✅

The admin dashboard map now automatically switches to dark tiles based on your theme setting.

**Light Mode**: Uses OpenStreetMap tiles
**Dark Mode**: Uses CartoDB dark tiles

No additional setup needed - it works automatically!

---

## 3. Skeleton Loaders - Cleaned Up ✅

### What Changed:
- ✅ **Kept**: Map loading placeholder (for slow map loads)
- ✅ **Kept**: Issue list skeleton (for slow data loads)
- ✅ **Removed**: Full page skeleton loaders
- ✅ **Removed**: Statistics skeleton loader
- ✅ **Removed**: Dashboard skeleton loader

### Where They Still Show:
1. **Portal Page**
   - Map loading (if map takes time)
   - Issue list loading (if data takes time)

2. **Admin Dashboard**
   - Issue list loading (if data takes time)
   - Map is always shown (uses dark mode tiles)

3. **Page Transitions** (Global)
   - Shows 1.5 second loader between pages

---

## 4. Integration Example - Report Issue with Images

Here's a complete example of how to integrate everything:

```tsx
import { useState } from 'react';
import { uploadMultipleImages } from '@/lib/cloudinary';

export default function ReportIssueForm() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleReportIssue = async (formData: any) => {
    setUploading(true);
    try {
      // Upload images first
      let photoUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const uploadedImages = await uploadMultipleImages(
          selectedFiles,
          'civic-connect/issues'
        );
        photoUrls = uploadedImages.map(img => img.secure_url);
      }

      // Save issue with image URLs to Firestore
      const issueData = {
        ...formData,
        photos: photoUrls,
        createdAt: new Date(),
      };

      // Save to Firestore (your existing code)
      // await addDoc(collection(db, 'issues'), issueData);

      alert('Issue reported with images!');
    } catch (error) {
      alert('Error uploading images: ' + error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleReportIssue({/* form data */});
    }}>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
      />
      {selectedFiles.length > 0 && (
        <p>{selectedFiles.length} image(s) selected</p>
      )}
      <button disabled={uploading}>
        {uploading ? 'Uploading...' : 'Report Issue'}
      </button>
    </form>
  );
}
```

---

## Build Status ✅

- **Modules**: 1714
- **Build Time**: 9.90 seconds (faster!)
- **Errors**: 0
- **Status**: ✅ Ready to deploy

---

## Next Steps:

1. **Setup Cloudinary** (5 minutes):
   - Create account and get Cloud Name
   - Create upload preset
   - Add to `.env`

2. **Test Image Upload** (10 minutes):
   - Try uploading an image using the service
   - Verify URL is stored correctly

3. **Integrate with ReportModal** (Optional):
   - Add image upload to the report issue modal
   - Store URLs in Firestore

---

## Troubleshooting:

**Error: "Cloudinary credentials not configured"**
- ✓ Check `.env` file has both variables
- ✓ Restart dev server after editing `.env`

**Images not uploading**
- ✓ Verify upload preset is set to "Unsigned"
- ✓ Check browser console for error details
- ✓ Ensure Cloud Name matches exactly

**Slow uploads**
- ✓ Normal for first upload (Cloudinary optimizes in background)
- ✓ Add loading indicator while uploading
- ✓ Consider showing progress bar for large files

---

## Free Tier Limits:

- **Storage**: 25 GB
- **Bandwidth**: Unlimited
- **API calls**: 7,500 per month
- **Max file size**: 100 MB

More than enough for a civic engagement app!

---

**All done! 🎉 Your image upload service is ready to use.**
