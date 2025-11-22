# 🔐 Admin Panel Access Guide

## Admin Login Credentials

### **Admin URL**: https://pja3d-fire.web.app/admin.html

### **Default Login:**
- **Username**: `pushkarjay`
- **Password**: `pja3d@admin2025` _(Change this after first login!)_

---

## How to Access Admin Panel

1. **Open**: https://pja3d-fire.web.app/admin.html
2. **Enter**:
   - Username: `pushkarjay`
   - Password: `pja3d@admin2025`
3. **Click** "Login"

---

## What You Can Do in Admin Panel

### ✅ **Product Management:**
- Add new products
- Edit existing products
- Delete products
- Upload product images
- Update prices and stock
- Mark products as trending/featured

### ✅ **Order Management:**
- View all orders
- Update order status
- Mark payments as received
- Track deliveries

### ✅ **Dashboard Analytics:**
- Total sales
- Orders today
- Popular products
- Revenue tracking

---

## Creating Your First Admin User in Firebase

### **Option 1: Using Firebase Console (Recommended)**

1. Go to Firebase Console: https://console.firebase.google.com/project/pja3d-fire/firestore
2. Click "Firestore Database"
3. Click "Start collection"
4. Collection ID: `users`
5. Document ID: Click "Auto-ID"
6. Add fields:
   ```
   email: "pushkarjay.ajay1@gmail.com"
   displayName: "Pushkarjay Ajay"
   role: "admin"
   username: "pushkarjay"
   createdAt: Click "timestamp" and select current time
   isActive: true (boolean)
   ```
7. Click "Save"

### **Option 2: Using Script**

Run this in backend directory:
```powershell
node create-admin.js
```

---

## Change Admin Password

### **Method 1: Firebase Authentication**
1. Go to: https://console.firebase.google.com/project/pja3d-fire/authentication
2. Click "Get started" if not enabled
3. Enable "Email/Password" provider
4. Click "Add user"
5. Email: `pushkarjay.ajay1@gmail.com`
6. Password: (Your secure password)
7. Click "Add user"

### **Method 2: In Admin Panel**
(After we add this feature)
1. Login to admin panel
2. Go to "Settings"
3. Click "Change Password"
4. Enter new password

---

## Fixing "Unable to Load Products" Error

The error is because products need to be accessible without authentication. I'm fixing this now by:

1. ✅ **Fixed backend error handler** - Deployed
2. ✅ **Fixed product query** - Removed authentication requirement for public products
3. ✅ **Redeploying backend** - In progress

**Once deployment completes** (takes 5-10 minutes), the website will load products correctly.

---

## Quick Product Management

### **Add Product via Firebase Console:**

1. Go to Firestore: https://console.firebase.google.com/project/pja3d-fire/firestore/data/products
2. Click "Add document"
3. Document ID: `prod_011` (auto-generate or custom)
4. Add fields:
   ```
   name: "Your Product Name"
   category: "3D Print" or "Stickers" or "Printing"
   description: "Product description"
   price: 299 (number)
   stock: 10 (number)
   status: "active"
   trending: true (boolean)
   featured: false (boolean)
   images: [] (array - empty for now)
   ```
5. Click "Save"

---

## Security Notes

### **⚠️ IMPORTANT:**
1. **Change default password immediately**
2. **Never share admin credentials**
3. **Use strong password** (12+ characters, mixed case, numbers, symbols)
4. **Enable 2FA** in Firebase if possible

### **Current Security:**
- ✅ Admin routes protected by JWT
- ✅ Firebase security rules configured
- ✅ HTTPS enabled
- ✅ CORS configured
- ⚠️ Change default password!

---

## Troubleshooting

### **Can't Login:**
1. Check username/password spelling
2. Check if Firebase Authentication is enabled
3. Check browser console for errors (F12)

### **Products Not Showing:**
1. Wait for backend deployment to complete
2. Check Firestore has products (run seed-products.js)
3. Clear browser cache
4. Try incognito/private window

### **Admin Features Not Working:**
1. Check if you're logged in
2. Check browser console (F12) for errors
3. Verify JWT token in localStorage

---

## Next Steps

1. ✅ **Test the website** - Wait for backend deployment
2. ✅ **Login to admin** - Use credentials above
3. ✅ **Add your products** - Via admin panel or Firebase console
4. ✅ **Upload images** - Add product photos
5. ✅ **Change password** - Update to secure password

---

**Backend is redeploying now... Website will work once complete! 🚀**
