# 🔐 Admin User Management Guide

## Creating Your First Admin User

### Option 1: Using PowerShell Script (Easiest)

```powershell
# From project root
.\create-admin.ps1
```

The script will prompt you for:
- Email address
- Password (min 6 characters)
- Display name

### Option 2: Using Node.js Script

```powershell
cd backend
node create-admin.js
```

### Option 3: Manual Creation via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/pja3d-fire)
2. Click **Authentication** → **Users** → **Add user**
3. Enter email and password
4. Copy the **UID** of the created user

5. Go to **Firestore Database** → **users** collection
6. Create a new document with the UID as document ID:
```json
{
  "uid": "<user-uid>",
  "email": "admin@example.com",
  "displayName": "Admin User",
  "role": "admin",
  "isActive": true,
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

7. In Authentication, set custom claims:
   - Go to **Cloud Shell** in GCP Console
   - Run:
   ```bash
   firebase functions:shell
   admin.auth().setCustomUserClaims('<user-uid>', {admin: true, role: 'admin'})
   ```

## Quick Start Example

```powershell
# Create admin user
.\create-admin.ps1

# When prompted, enter:
# Email: admin@pja3d.com
# Password: YourSecurePassword123
# Display Name: PJA Admin

# Output:
# ✅ Admin user created successfully!
# 📧 Email: admin@pja3d.com
# 🆔 UID: abc123xyz...
# 👤 Name: PJA Admin
# 🔐 You can now login at: https://pja3d-fire.web.app/admin
```

## Creating Additional Admin Users

Run the same script again to create more admin users:

```powershell
.\create-admin.ps1
```

Or use the Node script for batch creation:

```powershell
cd backend
node create-admin.js
```

## Default Admin Credentials (For Testing)

**⚠️ IMPORTANT: Change these immediately after first login!**

For your first setup, you can create:
- **Email**: `admin@pja3d.com`
- **Password**: Choose a strong password (min 6 chars)

## Login to Admin Panel

Once created, visit:
**https://pja3d-fire.web.app/admin**

## Troubleshooting

### Error: "Email already exists"
The script will automatically find and update the existing user with admin role.

### Error: "Permission denied"
Make sure you're authenticated with Firebase:
```powershell
firebase login
gcloud auth application-default login
```

### Can't login after creating user
1. Check Firestore → `users` collection → verify the user document exists
2. Check that `role` field is set to `"admin"`
3. Clear browser cache and try again

## User Roles

The system supports these roles:
- **admin**: Full access to admin panel
- **user**: Regular customer (default for signups)

## Managing Users

### Promote User to Admin

Via Firebase Console:
1. Firestore → `users` → Find user document
2. Edit document, change `role` to `"admin"`
3. In Cloud Shell:
```bash
firebase functions:shell
admin.auth().setCustomUserClaims('<uid>', {admin: true, role: 'admin'})
```

### Deactivate User

1. Firestore → `users` → Find user document
2. Set `isActive` to `false`

### Delete User

1. Firebase Console → Authentication → Users
2. Find user and click delete icon
3. Also delete from Firestore → `users` collection

## Security Best Practices

1. ✅ Use strong passwords (12+ characters, mixed case, numbers, symbols)
2. ✅ Don't share admin credentials
3. ✅ Create separate admin accounts for each admin user
4. ✅ Regularly review active admin users
5. ✅ Enable 2FA in Firebase Console (recommended)
6. ✅ Change default passwords immediately

## Quick Reference Commands

```powershell
# Create admin
.\create-admin.ps1

# Login to Firebase
firebase login

# Check existing users (via gcloud)
gcloud auth application-default login

# View Firestore users
firebase firestore:get users
```

---

**Need Help?** Check the deployment logs or Firebase Console for errors.
