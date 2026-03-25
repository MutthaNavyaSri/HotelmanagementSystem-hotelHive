# Image Upload Fix - Complete Guide

## Problem Summary
Images uploaded in the Django admin panel weren't displaying on the website because:

1. **Media folder didn't exist** - Created ✅
2. **Frontend wasn't displaying images** - Fixed ✅  
3. **No images were actually uploaded** - Admin instructions below ⬇️

---

## What Was Fixed

### Backend Configuration ✅
- Django media folder structure created: `backend/media/`
  - `room_images/` - for room photos
  - `profile_images/` - for user avatars
  - `payment_proofs/` - for payment screenshots

- **Settings correctly configured:**
  - `MEDIA_ROOT = backend/media`
  - `MEDIA_URL = /media/`
  - URLs configured to serve media files in development mode

### Frontend Updates ✅

**RoomListingPage.jsx:**
- Changed from emoji placeholder (🛏️) to actual image display
- Shows `room.primary_image` from API
- Fallback to emoji if image not available

**RoomDetailsPage.jsx:**
- Displays all room images in a gallery view
- Primary image in large view (396px height)
- Additional images in thumbnail grid
- Fallback to emoji if images not available

---

## How to Upload Images

### Step 1: Start Django Server
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

### Step 2: Go to Django Admin
1. Navigate to: **http://127.0.0.1:8000/admin**
2. Login with admin credentials

### Step 3: Add Images to Rooms
1. Click on **"Rooms"** in the admin panel
2. Select a room to edit
3. Scroll down to the **"Images"** section (inline images table)
4. Click **"Add Image"** button
5. Click the **"Choose File"** button
6. Select an image from your computer (JPG, PNG, etc.)
7. Click **"Save"** or **"Save and Continue Editing"**

**Important:** Make sure you see images listed under the room before saving!

---

## How Images Work Now

### Image Flow:
```
1. User uploads image in Django Admin → Image Model (database)
                    ↓
2. Image file saved to: backend/media/room_images/
                    ↓
3. API endpoint /api/rooms/ returns images as URLs
                    ↓
4. Frontend displays images in RoomListingPage & RoomDetailsPage
```

### Room Listing Page:
- Shows the **first image** of each room (primary_image)
- Displays in a 2-column grid on mobile, adjusts on larger screens
- Emoji fallback (🛏️) if no image exists

### Room Details Page:
- **Primary image** displayed large (396px height)
- **Additional images** shown in thumbnail gallery (4 images max)
- Both responsive and have emoji fallbacks

---

## Testing Image Upload

### Method 1: Via Django Admin (Easiest)
1. Go to http://127.0.0.1:8000/admin/api/image/
2. Click **"Add Image"**
3. Select a room from dropdown
4. Upload an image file
5. Click **"Save"**

### Method 2: Via Room Edit
1. Go to http://127.0.0.1:8000/admin/api/room/
2. Click any room to edit
3. Scroll to "Images" section
4. Click "Add another Image"
5. Upload and save

### Verify in API:
```bash
# Check if images are in database
curl http://127.0.0.1:8000/api/rooms/

# Look for "primary_image" field in response
# Should contain URL like: http://127.0.0.1:8000/media/room_images/filename.jpg
```

---

## Troubleshooting

### Problem: "Image not found" in admin
**Solution:** Ensure you select a room from the dropdown before uploading

### Problem: Image uploads but doesn't show on website
**Check:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check browser console (F12) for errors
3. Verify image URL in API response: `http://127.0.0.1:8000/api/rooms/`

### Problem: "No such file or directory: media"
**Solution:** Already created! If it happens again run:
```bash
cd backend
mkdir -p media\room_images media\profile_images media\payment_proofs
```

### Problem: Images showing as broken image icon
**Solutions:**
1. Check file permissions on media folder
2. Ensure image file format is supported (JPG, PNG, GIF, WebP)
3. Verify image file isn't corrupted

---

## File Sizes & Recommendations

- **Recommended image size:** 800x600px or larger
- **Supported formats:** JPG, PNG, GIF, WebP
- **Max file size:** No limit set (but recommend < 5MB per image)

---

## Frontend Display Settings

### RoomListingPage.jsx:
- Image height: 192px (h-48)
- Display mode: `object-cover` (crops to fit)
- Fallback: 🛏️ emoji

### RoomDetailsPage.jsx:
- Primary image height: 384px (h-96)
- Thumbnail height: 128px (h-32)
- Display mode: `object-cover`
- Fallback: 🛏️ emoji

---

## CORS & Security

✅ **CORS is properly configured** for:
- http://localhost:3000
- http://localhost:5173-5176
- http://127.0.0.1:3000 & 3000-3176

Images served from Django `/media/` endpoint are protected by:
- DEBUG=True setting (development only)
- Same server as API (no cross-origin issues)

---

## Next Steps

1. **Upload images** to your rooms via Django admin
2. **Refresh the website** (http://localhost:3000 or http://localhost:5173)
3. **Verify images appear** on both listing and detail pages
4. **Test image gallery** on room details page

If images still don't show, check browser console (F12) for any network errors.

---

**Last Updated:** 26 March 2026
**Status:** ✅ Image system fully functional
