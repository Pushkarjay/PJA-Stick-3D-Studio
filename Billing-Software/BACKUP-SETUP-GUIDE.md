# 📁 Auto-Backup Setup Guide for KIIT-PRINT

## ✅ What's Been Implemented:

Your app now has a complete auto-backup system with:
- ⚠️ **Unsaved changes indicator**
- 💾 **Quick Save button** 
- 🕐 **Last saved timestamp**
- 🔄 **Auto-backup on every change** (enable/disable)
- 📊 **Timestamped backup files**

## 📥 Configure Browser to Auto-Save Backups

Since browsers cannot directly save to specific folders, you need to configure your browser's download settings:

### **For Google Chrome:**

1. Open Chrome Settings (chrome://settings/)
2. Search for "Downloads"
3. Find "Location" setting
4. Click "Change"
5. Navigate to: `E:\Projects\Working\KII-PRINT-BILLING\Backup`
6. ✅ **IMPORTANT:** Enable "Ask where to save each file before downloading" = **OFF**

### **For Microsoft Edge:**

1. Open Edge Settings (edge://settings/)
2. Click "Downloads" in the sidebar
3. Under "Location", click "Change"
4. Navigate to: `E:\Projects\Working\KII-PRINT-BILLING\Backup`
5. ✅ **IMPORTANT:** Turn OFF "Ask me what to do with each download"

### **For Firefox:**

1. Open Firefox Settings (about:preferences)
2. Scroll to "Files and Applications"
3. Under "Downloads", select "Save files to"
4. Click "Browse" and select: `E:\Projects\Working\KII-PRINT-BILLING\Backup`

---

## 🎯 How the Auto-Backup Works:

### **Backup Filename Format:**
```
KIIT-PRINT-Backup-0001-2025-11-03T15-30-45.xlsx
                  ↑    ↑
            Serial No  Timestamp
```

- **Serial Number**: Increments with each backup (0001, 0002, 0003...)
- **Timestamp**: Date and time of backup (YYYY-MM-DDTHH-MM-SS)

### **When Auto-Backup Triggers:**
✅ When you **add** a new expense entry  
✅ When you **edit** an existing entry  
✅ When you **delete** an entry  
✅ After any change (if auto-backup is enabled)

---

## 🖥️ Using the Backup Features:

### **1. Enable Auto-Backup:**
- Go to **Expense Tracker** tab
- In the summary panel, check "**Auto-backup on changes**"
- Every change will now auto-download a backup

### **2. Manual Quick Save:**
- Click "**💾 Quick Save Backup**" button anytime
- Instantly downloads a backup file

### **3. Regular Export:**
- Click "**📊 Export to Excel**" for standard export
- File named: `records.xlsx`

### **4. Monitor Status:**
- **⚠️ Unsaved changes**: Shows when you have changes not backed up
- **Last saved**: Shows timestamp of last backup
- Green text = Recently saved ✅
- Red text = Never saved ⚠️

---

## 🗂️ Managing Backup Files:

### **Recommended Workflow:**

1. **Daily:** Keep all backups from current day
2. **Weekly:** Delete older backups, keep latest from each day
3. **Monthly:** Keep one backup from end of each week

### **Quick Cleanup Script (PowerShell):**

Save this as `cleanup-old-backups.ps1` in your Backup folder:

```powershell
# Keep only the 10 most recent backup files
Get-ChildItem "E:\Projects\Working\KII-PRINT-BILLING\Backup\KIIT-PRINT-Backup-*.xlsx" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -Skip 10 |
    Remove-Item -Force

Write-Host "Cleanup complete. Kept 10 most recent backups."
```

Run it periodically to keep only recent backups.

---

## 💡 Pro Tips:

1. **First Time Setup:**
   - Enable auto-backup
   - Add a test entry
   - Check your Backup folder to confirm it's working

2. **Backup Counter:**
   - Counter is stored in browser's localStorage
   - Resets if you clear browser data
   - You can manually delete higher-numbered files to clean up

3. **File Size:**
   - Each backup is typically 5-50 KB
   - 1000 backups ≈ 5-50 MB (very small!)
   - Safe to keep many backups

4. **Recovery:**
   - Open any backup Excel file directly
   - Copy data back into the app if needed
   - Latest serial number = most recent backup

---

## ⚠️ Important Notes:

- ✅ Backups save to **Downloads folder** or configured folder
- ✅ Browser must allow automatic downloads
- ✅ Data is also saved in browser's localStorage (always available)
- ⚠️ If you change browsers, backups won't auto-load (use Excel files)
- ⚠️ Clearing browser data will reset backup counter

---

## 🆘 Troubleshooting:

**Problem:** Auto-backup not working  
**Solution:** Check browser download settings, disable "Ask where to save"

**Problem:** Files going to Downloads instead of Backup folder  
**Solution:** Change browser's default download location

**Problem:** Too many backup files  
**Solution:** Run cleanup script or manually delete old numbered files

**Problem:** Lost backup counter (starts from 0001 again)  
**Solution:** Rename newest backup to have highest number

---

## 📞 Need Help?

Your data is safe! All information is stored in:
1. Browser's localStorage (automatic)
2. Backup Excel files (with timestamps)

You can never lose data as long as you:
- Don't clear browser data without backing up first
- Keep some backup Excel files

---

**Enjoy stress-free data management! 🎉**
