# 🚀 Quick Start - Cloudinary Integration

## TL;DR - Just Want It Working? (5 Minutes)

### Step 1: Create Cloudinary Account
- Go to https://cloudinary.com/
- Sign up (FREE)
- Verify email

### Step 2: Create Unsigned Preset
1. Dashboard → Settings → Upload
2. "Add upload preset"
3. Name: `civic_connect`
4. Unsigned: **ON** ✓
5. Save

### Step 3: Copy Cloud Name
1. Dashboard → Look for "Cloud Name"
2. Copy it (looks like: `dXXXXXXX`)

### Step 4: Update .env
```env
VITE_CLOUDINARY_CLOUD_NAME=paste_your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=civic_connect
```

### Step 5: Use in Code
```typescript
import { uploadImageToCloudinary } from '@/lib/cloudinary';

// Upload single image
const result = await uploadImageToCloudinary(file);
console.log(result.secure_url);  // Use this URL!

// Upload multiple
const results = await uploadMultipleImages([file1, file2]);
const urls = results.map(r => r.secure_url);
```

**Done! ✅ Upload images in 5 minutes!**

---

## Integration Examples

### Example 1: Add to Issue Report
```typescript
const [photos, setPhotos] = useState<string[]>([]);

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  
  try {
    const results = await uploadMultipleImages(files, 'civic-connect/issues');
    const newPhotos = results.map(r => r.secure_url);
    setPhotos([...photos, ...newPhotos]);
  } catch (error) {
    alert('Upload failed: ' + error);
  }
};

// In form:
<input type="file" multiple accept="image/*" onChange={handleImageUpload} />
<div>
  {photos.map(url => <img src={url} alt="Issue" key={url} />)}
</div>
```

### Example 2: Display Issue Photos
```typescript
// Assuming issue.photos is array of URLs from Cloudinary
{issue.photos && issue.photos.length > 0 && (
  <div className="grid grid-cols-2 gap-2">
    {issue.photos.map(photoUrl => (
      <img 
        key={photoUrl}
        src={photoUrl} 
        alt="Issue photo"
        className="w-full h-32 object-cover rounded"
      />
    ))}
  </div>
)}
```

### Example 3: Optimize Images for Thumbnail
```typescript
import { getOptimizedImageUrl } from '@/lib/cloudinary';

// Get thumbnail (200x200, WebP)
const thumbnail = getOptimizedImageUrl(publicId, {
  width: 200,
  height: 200,
  quality: 'auto',
  format: 'webp'
});

<img src={thumbnail} alt="Thumbnail" />
```

---

## Common Questions

**Q: Where are my images stored?**
A: In Cloudinary's cloud servers (global CDN). They're automatically optimized for web.

**Q: How much storage do I get?**
A: 25 GB free (more than enough for a civic app).

**Q: Can I delete images?**
A: Yes, from Cloudinary dashboard. Or use their API with backend.

**Q: How fast are uploads?**
A: Instant on fast connections. Shows progress bar for large files.

**Q: Can I use signed uploads later?**
A: Yes! Just switch your preset to signed when you're ready.

**Q: What if upload fails?**
A: The service returns an error. Check internet connection and browser console.

---

## Troubleshooting

**Error: "Cloudinary credentials not configured"**
```
✓ Add both vars to .env:
  VITE_CLOUDINARY_CLOUD_NAME=xxx
  VITE_CLOUDINARY_UPLOAD_PRESET=yyy
✓ Restart dev server (npm run dev)
✓ Clear browser cache
```

**Images won't upload**
```
✓ Check preset is "Unsigned"
✓ Verify cloud name is correct
✓ Check browser console for errors
✓ Try a different image file
```

**Images show broken in app**
```
✓ Verify secure_url was stored in database
✓ Check image still exists in Cloudinary
✓ Ensure CORS is enabled (it is by default)
```

---

## Dark Mode Map - Now Works! ✅

When you toggle dark/light mode:
- ✅ Admin map switches tiles automatically
- ✅ Portal map switches tiles automatically
- ✅ Colored markers stay visible (yellow/red/green)
- ✅ No manual refresh needed
- ✅ Instant switch (MutationObserver watches theme)

---

## What's Ready to Use

✅ `uploadImageToCloudinary()` - Single image
✅ `uploadMultipleImages()` - Multiple images
✅ `getOptimizedImageUrl()` - Resize/compress
✅ Dark mode observer on both maps
✅ CartoDB dark tiles for dark mode
✅ OpenStreetMap tiles for light mode

---

## Next Steps

1. **Setup Cloudinary** (follow TL;DR above)
2. **Add to Issue Report Modal** (use Example 1 above)
3. **Test Upload** (pick an image file)
4. **Save to Database** (store returned `secure_url`)
5. **Display in Issue Details** (use Example 2 above)

**That's it! You're ready to go! 🚀**

---

**Questions? See CLOUDINARY_SETUP.md for detailed guide!**
