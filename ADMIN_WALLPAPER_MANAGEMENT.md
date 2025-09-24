# 🎨 Enhanced Admin Panel - Complete Wallpaper Management

Your admin panel now has **full wallpaper management** with R2 storage integration!

## ✅ **What's New:**

### 🔧 **Complete R2 Integration**
- **Upload to R2**: Wallpapers stored directly in your Cloudflare R2 bucket
- **Automatic URLs**: Public R2 URLs generated for each upload
- **File Management**: Delete from both database and R2 storage
- **Validation**: File type, size, and format checking

### 📱 **Wallpaper Upload System**
- **Drag & drop** or click to upload images
- **Live preview** before uploading
- **Auto-fill** title from filename
- **Multiple resolutions** (1080x1920, 1440x2560, custom)
- **Tag management** with easy add/remove
- **Category selection** from predefined list

### ✏️ **Edit & Delete Features**
- **Edit wallpaper** metadata (title, category, tags, resolution)
- **Delete wallpapers** with confirmation dialog
- **Real-time updates** in the admin dashboard
- **Bulk operations** ready for future expansion

## 🚀 **How to Use:**

### **1. Access Admin Dashboard**
```
http://localhost:3001/admin/dashboard
```

### **2. Upload New Wallpapers**
1. Click **"ADD WALLPAPER"** button
2. **Select image** (JPEG, PNG, WebP up to 50MB)
3. **Fill in details**:
   - Title (auto-filled from filename)
   - Category (dropdown selection)
   - Resolution (common sizes + custom)
   - Tags (comma-separated, press Enter to add)
4. Click **"UPLOAD WALLPAPER"**

### **3. Manage Existing Wallpapers**
- **Edit**: Click "EDIT" → Update details → "UPDATE WALLPAPER"
- **Delete**: Click "DELETE" → Confirm → Permanently removed from R2 + database
- **View Stats**: Downloads and likes displayed for each wallpaper

## 🗂️ **File Structure:**

### **R2 Storage Path**
```
/wallpapers/sanitized-title-timestamp.jpg
```
Example: `/wallpapers/neon-city-1637123456789.jpg`

### **Database Schema**
```javascript
{
  id: "auto-generated",
  title: "NEON CITY",
  category: "abstract",
  tags: ["neon", "city", "lights"],
  resolution: "1080x1920",
  fileSize: "2.4 MB",
  imageUrl: "https://pub-xyz.r2.dev/wallpapers/neon-city-123.jpg",
  r2Key: "wallpapers/neon-city-123.jpg",
  downloads: 0,
  likes: 0,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎛️ **Admin Panel Features:**

### **Dashboard Overview**
- **Total Wallpapers**: Live count from database
- **Total Downloads**: Aggregated across all wallpapers
- **Total Likes**: Sum of all wallpaper likes
- **Admin Users**: Count of users with admin privileges

### **Wallpaper Management Tab**
- **Grid View**: Thumbnails with stats and actions
- **Quick Actions**: Edit/Delete buttons on each wallpaper
- **Upload Form**: Comprehensive form with validation
- **Real-time Updates**: Changes reflect immediately

### **User Management Tab**
- **View All Users**: Everyone who signed in to admin
- **Grant Admin**: Make any user an admin
- **Revoke Admin**: Remove admin privileges
- **Activity Tracking**: Last login dates

## 🔒 **Security & Validation:**

### **File Upload Security**
- **Type Validation**: Only JPEG, PNG, WebP allowed
- **Size Limits**: Maximum 50MB per file
- **Sanitized Names**: Clean filenames for R2 storage
- **Unique Keys**: Timestamp-based naming prevents conflicts

### **Admin Permissions**
- **Route Protection**: `/admin/dashboard` requires admin rights
- **API Security**: All admin endpoints check authentication
- **Role Management**: Only admins can manage other admins

## 📊 **Environment Variables Used:**
```bash
# R2 Storage (already in your .env.local)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=imgtourl
R2_PUBLIC_URL=https://pub-xyz.r2.dev

# Firebase (added for you)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase keys
```

## 🛠️ **API Endpoints:**

### **Upload Wallpaper**
```
POST /api/admin/wallpapers/upload
- Uploads file to R2
- Creates database entry
- Returns wallpaper data
```

### **Update Wallpaper**
```
PUT /api/admin/wallpapers/[id]
- Updates metadata only
- Preserves R2 file
- Returns updated data
```

### **Delete Wallpaper**
```
DELETE /api/admin/wallpapers/[id]
- Removes from R2 storage
- Deletes database entry
- Returns success confirmation
```

## 💡 **Usage Tips:**

### **Best Practices**
- **High-quality images** perform better (downloads/likes)
- **Descriptive titles** help users find wallpapers
- **Relevant tags** improve searchability
- **Proper categories** organize your collection

### **File Naming**
- Original filename becomes title suggestion
- Use descriptive filenames for auto-fill
- System generates unique R2 keys automatically

### **Performance**
- Images are served directly from R2 CDN
- Database queries are optimized
- Real-time updates use efficient state management

## 🎯 **Ready Features:**

- ✅ Upload wallpapers to R2
- ✅ Edit wallpaper metadata
- ✅ Delete wallpapers completely
- ✅ Real-time dashboard stats
- ✅ User role management
- ✅ Form validation
- ✅ File type checking
- ✅ Responsive design

Your admin panel is now a **complete wallpaper management system** with professional R2 storage integration! 🚀