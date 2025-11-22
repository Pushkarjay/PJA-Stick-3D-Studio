# Admin Panel Documentation

## 🔐 Access Information

**URL**: https://pushkarjay.github.io/PJA-Stick-3D-Studio/admin.html

**Login Credentials**:
- Username: `pushkarjay`
- Password: `kiitprint`

**Security Note**: Credentials are hashed using SHA-256 and stored securely. No plaintext passwords in the codebase.

---

## ✨ Features

### 1. **Product Management**
- ➕ Add new products
- ✏️ Edit existing products
- 🗑️ Delete products
- 🔍 Filter products by category
- 📊 View product statistics

### 2. **Category Management**
- View all product categories
- Add new categories
- See product count per category

### 3. **Website Settings**
- Update WhatsApp number
- Update location/address
- Save configuration

### 4. **Data Management**
- 📤 Export all data (JSON backup)
- 📥 Import data (restore from backup)

---

## 📦 Product Fields

When adding/editing products, you can configure:

| Field | Description | Required |
|-------|-------------|----------|
| **Product Name** | Display name | ✅ Yes |
| **Category** | 3D Print, Stickers, Printing, Polaroid | ✅ Yes |
| **Sub-Category** | Trending, Anime, Documents, etc. | No |
| **Difficulty** | Easy, Moderate, Complex | ✅ Yes |
| **Time Required** | e.g., "2-3 Hours", "Instant" | No |
| **Material** | e.g., "PLA", "Vinyl", "Paper" | No |
| **Price** | Low, Medium, High, Custom | No |
| **Description** | Product details | ✅ Yes |
| **Icon Type** | Visual representation | No |
| **Trending** | Mark as Hot/Trending | No |

---

## 🎯 How to Use

### Adding a New Product

1. Click **"+ Add New Product"** button
2. Fill in all required fields (marked with *)
3. Select appropriate category and difficulty
4. Add description
5. Check "Mark as Trending" if it's a hot product
6. Click **"Save Product"**

### Editing a Product

1. Find the product in the table
2. Click **"Edit"** button
3. Modify any fields
4. Click **"Save Product"**

### Deleting a Product

1. Find the product in the table
2. Click **"Delete"** button
3. Confirm deletion

### Filtering Products

Use the dropdown at the top to filter by:
- All Categories
- 3D Print
- Stickers
- Printing
- Polaroid

---

## 💾 Data Persistence

### How It Works
- All data is stored in **browser's localStorage**
- Data persists across sessions
- Main website automatically loads updated products
- No server or database required

### Backup & Restore

#### Export Data
1. Go to **Settings** tab
2. Click **"Export Data"**
3. JSON file will download automatically
4. Keep this file safe as a backup

#### Import Data
1. Go to **Settings** tab
2. Click **"Import Data"**
3. Select your JSON backup file
4. Data will be restored immediately

---

## 🔄 Product Updates Flow

```
Admin Panel → localStorage → Main Website
```

1. Admin updates products in admin panel
2. Changes saved to localStorage
3. Main website reads from localStorage
4. Products automatically updated on website

---

## 📱 Available Categories

Current categories:
- **3D Print** - 3D printed items (Flip Names, Moon Lamps, etc.)
- **Stickers** - Laptop skins, mobile skins, decals
- **Printing** - Document printing, reports
- **Polaroid** - Polaroid printing services *(can add more)*

### Adding New Categories

1. Go to **Categories** tab
2. Click **"+ Add New Category"**
3. Enter category name
4. New category will be available in product form

---

## 🎨 Icon Types

Available product icons:
- lithophane
- flipName
- moonLamp
- idol
- pikachu
- naruto
- vase
- controllerStand
- namePlate
- sticker
- document
- datePlank

---

## ⚠️ Important Notes

### Security
- Admin panel uses SHA-256 hashed credentials
- No plaintext passwords in codebase
- Session-based authentication
- Session expires when browser is closed
- Client-side only (GitHub Pages limitation)

### Data Storage
- Data stored in browser localStorage
- Maximum ~5-10MB storage limit
- Clearing browser data will erase products
- **Always keep regular backups!**

### Limitations
- Works only in same browser where admin is accessed
- Different browsers = different data
- No user management (single admin only)
- No version control for data

---

## 🚨 Troubleshooting

### Products not showing on main site?
- Make sure you saved the product
- Refresh the main website (Ctrl+F5)
- Check if localStorage is enabled in browser

### Lost admin access?
- Session expires: Just login again
- Forgot password: Check this documentation

### Data disappeared?
- Browser cache cleared: Restore from backup
- Different browser: Export/Import data

### Can't login?
- Username: `pushkarjay` (lowercase)
- Password: `kiitprint` (lowercase)
- Clear browser cache and try again

---

## 📊 Best Practices

1. **Regular Backups**
   - Export data weekly
   - Keep multiple backup copies
   - Store in safe location

2. **Product Management**
   - Use clear, descriptive names
   - Keep descriptions concise
   - Mark trending items appropriately
   - Use consistent pricing (Low/Medium/High)

3. **Categories**
   - Don't create too many categories
   - Use sub-categories for variations
   - Keep naming consistent

4. **Testing**
   - Test products on main site after adding
   - Check mobile view
   - Verify WhatsApp links work

---

## 🔗 Quick Links

- **Admin Panel**: [admin.html](https://pushkarjay.github.io/PJA-Stick-3D-Studio/admin.html)
- **Main Website**: [index.html](https://pushkarjay.github.io/PJA-Stick-3D-Studio/)
- **GitHub Repo**: [PJA-Stick-3D-Studio](https://github.com/Pushkarjay/PJA-Stick-3D-Studio)

---

## 💡 Tips

- Use Chrome/Edge for best experience
- Keep admin panel bookmarked
- Export data before major changes
- Test changes on main site immediately
- Use descriptive product names for SEO

---

**Need Help?** Check the troubleshooting section or contact the developer.

**Last Updated**: November 22, 2025
