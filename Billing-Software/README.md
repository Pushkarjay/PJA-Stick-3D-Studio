# KIIT-PRINT Billing & Expense Tracker

A complete offline-first web application for managing print shop billing and expense tracking. Built with pure HTML, CSS, and JavaScript - no frameworks, no build tools, no dependencies (except SheetJS for Excel export).

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### 📄 Billing / Invoice Generator
- **Customizable Product Pricing** - Pre-configured items with editable prices
- **Dynamic Discounts** - Apply percentage or fixed amount discounts
- **Smart Calculations** - Auto-calculated discounted prices and totals
- **Flexible Rows** - Add/delete custom items as needed
- **Customer Management** - Optional customer name field
- **Editable Date & Time** - Set custom invoice date/time
- **Professional Bills** - A5-sized printable invoices with logo and QR code
- **Multiple Output Options**:
  - Print-ready bill with company branding
  - Copy to clipboard as text
  - Auto-save to expense tracker

### 💰 Expense Tracker
- **Complete Financial Dashboard**:
  - Total Earned (from sales)
  - Total Invested (expenses + investments)
  - Total Due (pending payments)
  - Net Profit/Loss with percentage
  
- **Smart Entry Management**:
  - Date & time stamped entries
  - Categorization (Sale/Investment/Expense)
  - Status tracking (Paid/Earned/Due)
  - Search and filter capabilities
  - Sortable columns (click headers to sort)
  
- **Easy Editing**:
  - ✏️ Edit any entry (loads into form)
  - 🗑️ Delete entries with confirmation
  - Inline status updates

### 💾 Auto-Backup System
- **Smart Backup Features**:
  - ⚠️ Unsaved changes indicator
  - 🕐 Last saved timestamp
  - 💾 Quick Save button
  - 🔄 Auto-backup on every change (toggle on/off)
  
- **Intelligent File Naming**:
  ```
  KIIT-PRINT-Backup-0001-2025-11-03T15-30-45.xlsx
  ```
  - Serial number increments automatically
  - Full timestamp for version tracking
  - Easy to identify latest backup

### 📊 Excel Integration
- Export all expense data to Excel format
- Timestamped backup files
- Preserves all transaction details
- Compatible with Microsoft Excel and Google Sheets

## 🎨 User Interface

- **Clean, Modern Design** - Professional green and white color scheme
- **Responsive Layout** - Works on desktop and tablets
- **Visual Feedback** - Hover effects, icons, and status indicators
- **Easy Navigation** - Tab-based interface (Billing / Expense Tracker)
- **Sortable Tables** - Click column headers to sort (↕ ↑ ↓)
- **Icon-Based Actions** - ✏️ Edit, 🗑️ Delete for clarity

## 📥 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pushkarjay/KII-PRINT-BILLING.git
   cd KII-PRINT-BILLING
   ```

2. **Open the app:**
   - Simply double-click `index.html`
   - Or right-click → Open with → Your browser
   - Or use Live Server in VS Code

3. **Configure Browser for Auto-Backup:**
   - See `BACKUP-SETUP-GUIDE.md` for detailed instructions
   - Set download folder to: `Backup/`

## 🛠️ Usage

### Creating an Invoice

1. Open the **Billing / Invoice** tab
2. Enter customer name (optional)
3. Set date and time (defaults to current)
4. Edit quantities and discounts for items
5. Click "Generate Bill" to print
6. Or "Copy Bill Text" for plain text
7. Or "Save to Expenses" to log the sale

### Managing Expenses

1. Open the **Expense Tracker** tab
2. Fill in the form:
   - Date & Time (editable)
   - Description
   - Category (Sale/Investment/Expense)
   - Amount
   - Type (Paid/Earned/Due)
3. Click "Add Entry"
4. View summary dashboard for financial overview

### Editing Entries

- Click ✏️ to edit an entry (loads into form)
- Click 🗑️ to delete an entry
- Click column headers to sort

### Backup & Recovery

1. **Enable Auto-Backup:**
   - Check "Auto-backup on changes" in Expense Tracker
   - Backups download automatically after each change

2. **Manual Backup:**
   - Click "💾 Quick Save Backup" anytime
   - Or "📊 Export to Excel" for standard export

3. **Recovery:**
   - Open any backup Excel file
   - Data is also stored in browser's localStorage

## 📁 Project Structure

```
KII-PRINT-BILLING/
├── index.html              # Main HTML structure
├── style.css               # All styling
├── script.js               # Application logic
├── LOGO.jpg               # Company logo
├── UPI-QR.jpeg            # UPI payment QR code
├── records.xlsx           # Excel template
├── Backup/                # Auto-backup folder
├── BACKUP-SETUP-GUIDE.md  # Detailed backup instructions
└── README.md              # This file
```

## 💾 Data Storage

### LocalStorage (Automatic)
- `kiitprintExpenses` - All expense entries
- `kiitprintBilling` - Billing items and prices
- `autoBackupEnabled` - Auto-backup preference
- `backupCounter` - Backup serial number

### Excel Backups
- Manual exports: `records.xlsx`
- Auto-backups: `KIIT-PRINT-Backup-####-timestamp.xlsx`

## 🎯 Default Pricing

| Product | Price (₹) |
|---------|-----------|
| One-sided Black & White | ₹3.00 |
| Double-sided Black & White | ₹5.00 |
| One-sided Colour | ₹10.00 |
| Double-sided Colour | ₹20.00 |
| A4 Size Sticker | ₹30.00 |
| A4 Size Photo | ₹70.00 |

*Prices are editable directly in the billing table*

## 🔒 Data Security

- ✅ All data stored locally (no cloud)
- ✅ Auto-save to browser's localStorage
- ✅ Optional auto-backup to Excel files
- ✅ No internet connection required
- ⚠️ Clearing browser data will erase localStorage (use Excel backups!)

## 🌐 Browser Compatibility

- ✅ Google Chrome (Recommended)
- ✅ Microsoft Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera

**Minimum Requirements:**
- Modern browser with ES6 support
- JavaScript enabled
- LocalStorage enabled

## 🛡️ Privacy

- **100% Offline** - No data sent to any server
- **No Analytics** - No tracking, no cookies
- **Local Storage Only** - Data never leaves your computer
- **No Login Required** - No accounts, no passwords

## 📚 Documentation

- `README.md` - This file (overview and usage)
- `BACKUP-SETUP-GUIDE.md` - Detailed backup configuration and troubleshooting

## 🤝 Contributing

This is a personal project for KIIT-PRINT, but suggestions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - Feel free to use and modify for your own business!

## 📞 Contact

**KIIT-PRINT**
- Phone: 6372362313
- UPI: pushkarjay2@ybl
- GitHub: [@Pushkarjay](https://github.com/Pushkarjay)

## 🙏 Acknowledgments

- [SheetJS (XLSX)](https://sheetjs.com/) - Excel file generation
- [CDN](https://cdnjs.com/) - For hosting SheetJS library

## 📅 Version History

### v1.0.0 (November 3, 2025)
- ✨ Initial release
- 📄 Complete billing system with discounts
- 💰 Expense tracker with dashboard
- 💾 Auto-backup system
- 📊 Excel export functionality
- 🎨 Professional UI with sortable tables
- ✏️ Edit/delete functionality for expenses

---

**Built with ❤️ for KIIT-PRINT**

*Simple. Offline. Powerful.*
