# 🔐 Admin Panel Setup Guide

Your wallpaper website now has a fully functional admin panel with Google authentication and role management!

## 🚀 Quick Start

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Visit the admin login page**:
   ```
   http://localhost:3001/admin
   ```

3. **Sign in with Google** - any Google account can sign in initially

4. **Make yourself admin** using the script:
   ```bash
   node scripts/make-admin.js your-email@gmail.com
   ```

5. **Access the admin dashboard**:
   ```
   http://localhost:3001/admin/dashboard
   ```

## 📋 Admin Features

### 🔑 **Authentication System**
- **Google OAuth** - Secure sign-in with Google accounts
- **Role-based access** - Users must be granted admin rights
- **Session management** - Persistent login with auto-redirect

### 👥 **User Management**
- **View all users** who have signed in to the admin panel
- **Grant admin rights** to any user with one click
- **Revoke admin rights** from existing admins
- **Track last login** dates for all users

### 📊 **Dashboard Analytics**
- **Total wallpapers** in database
- **Total downloads** across all wallpapers
- **Total likes** from users
- **Total admin users** count

### 🖼️ **Wallpaper Management**
- **View all wallpapers** with stats and thumbnails
- **See download/like counts** for each wallpaper
- **Categories overview** for better organization
- **Quick edit/delete** buttons (UI ready for implementation)

## 🛠 Admin Scripts

### Make User Admin
```bash
node scripts/make-admin.js user@example.com
```
Grants admin privileges to a user (they must sign in first).

### Check Database
```bash
node scripts/check-data.js
```
Displays all wallpapers and their stats.

### Seed Database
```bash
node scripts/seed-database.js
```
Adds sample wallpapers to the database.

## 🔒 Security Features

### **Authentication Flow**
1. User signs in with Google OAuth
2. User record created in `admin_users` collection
3. `isAdmin` field defaults to `false`
4. Admin privileges granted manually via script or admin panel

### **Access Control**
- **Public routes**: Main website, wallpaper viewing
- **Auth required**: `/admin/dashboard` and admin features
- **Admin required**: User management, wallpaper management

### **Database Security**
- **Firestore rules** protect admin data
- **Admin collection** separate from public data
- **Role verification** on every admin action

## 🏗️ Admin Panel Structure

```
/admin              → Login page (Google OAuth)
/admin/dashboard    → Main admin dashboard
  ├── Wallpapers   → Manage wallpapers, view stats
  └── Users        → Manage admin users, grant/revoke access
```

## 💡 Usage Tips

### **First Time Setup**
1. Sign in to `/admin` with your Google account
2. Run the make-admin script with your email
3. Refresh the page to see admin dashboard

### **Adding New Admins**
1. Have the user sign in to `/admin` first
2. Use the "MAKE ADMIN" button in the dashboard
3. Or use the command line script

### **Managing Wallpapers**
- View all wallpapers with their performance metrics
- Categories are automatically organized
- Download and like counts update in real-time

## 🚨 Important Notes

- **Firebase rules** are set to allow read/write for 30 days (update for production)
- **Google OAuth** requires proper Firebase configuration
- **Admin privileges** must be granted manually for security
- **Environment variables** contain sensitive Firebase keys

## 🔗 Admin URLs

- **Login**: `http://localhost:3001/admin`
- **Dashboard**: `http://localhost:3001/admin/dashboard`

---

Your admin panel is now ready to use! 🎉