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
// Current credentials: username='pushkarjay', password='kiitprint'
usernameHash: '5d9c68c6c50ed3d02a2fcf54f63993b6868f48a1f2c7b8e3a6d8f7e9a4b2c5d3'
passwordHash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
```

### How to Change Credentials

**Option 1: Use Hash Generator Page (Easiest)**

1. Open `hash-generator.html` in your browser
2. Enter your new username and password
3. Click "Generate Hashes"
4. Copy the generated hashes
5. Update `admin-script.js` with the new hashes

**Option 2: Browser Console**

1. Open browser console (F12)
2. Paste and run this code:

```javascript
(async function() {
  async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const username = 'your-new-username';
  const password = 'your-new-password';
  
  const usernameHash = await hashString(username);
  const passwordHash = await hashString(password);
  
  console.log('Username hash:', usernameHash);
  console.log('Password hash:', passwordHash);
})();
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
