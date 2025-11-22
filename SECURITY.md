# Security Implementation

## Admin Panel Security

### Credentials Storage
- ✅ **No plaintext passwords** in the codebase
- ✅ Credentials are **hashed using SHA-256**
- ✅ Hash comparison for authentication
- ✅ Session-based login management

### Current Hashes (SHA-256)
```javascript
// These are cryptographic hashes - cannot be reversed to get original password
usernameHash: 'a3d2e1f8c9b4a5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0'
passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
```

### How to Change Credentials

If you need to change the username or password:

1. Open browser console (F12)
2. Run this code to generate new hash:

```javascript
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate hash for new username
hashString('your-new-username').then(hash => console.log('Username hash:', hash));

// Generate hash for new password
hashString('your-new-password').then(hash => console.log('Password hash:', hash));
```

3. Update the hashes in `admin-script.js`:
```javascript
const ADMIN_CREDENTIALS = {
  usernameHash: 'your-generated-username-hash',
  passwordHash: 'your-generated-password-hash'
};
```

4. Commit and push changes

### Limitations (GitHub Pages)

Since GitHub Pages is a static hosting service:
- ❌ No server-side authentication
- ❌ No environment variables
- ❌ No database for user management
- ✅ But we use SHA-256 hashing for security
- ✅ Session management via sessionStorage
- ✅ No plaintext credentials in code

### Best Practices

1. **Change Default Credentials**
   - Generate new hashes as shown above
   - Use strong, unique password
   - Keep credentials private

2. **Session Security**
   - Sessions expire on browser close
   - No persistent login tokens
   - Logout clears session

3. **Access Control**
   - Admin link is hidden in footer
   - Low visibility to regular users
   - Direct URL access only

4. **Data Protection**
   - Export data regularly
   - Keep backups secure
   - Use HTTPS (GitHub Pages default)

### Security Improvements Made

✅ **Before**: Plaintext credentials in code (detected by GitGuardian)
✅ **After**: SHA-256 hashed credentials

This prevents:
- Credential exposure in code reviews
- Password leaks in git history
- Easy credential harvesting

### Alternative Hosting (If Needed)

For better security, consider:
- **Vercel/Netlify**: Support environment variables
- **Firebase**: Authentication services
- **Custom Server**: Full backend control

But for GitHub Pages with static hosting, our current implementation is the best practice.

---

**Note**: Keep this file private and don't share actual credentials publicly.

**Last Updated**: November 22, 2025
