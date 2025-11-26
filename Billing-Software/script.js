document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const billingTabBtn = document.getElementById('billing-tab-btn');
    const expenseTabBtn = document.getElementById('expense-tab-btn');
    const billingPage = document.getElementById('billing-page');
    const expensePage = document.getElementById('expense-page');

    // Billing Page Elements
    const billingTableBody = document.querySelector('#billing-table tbody');
    const billingTotalEl = document.getElementById('billing-total');
    const customerNameInput = document.getElementById('customer-name');
    const billDateInput = document.getElementById('bill-date');
    const billTimeInput = document.getElementById('bill-time');
    const generateBillBtn = document.getElementById('generate-bill-btn');
    const copyBillBtn = document.getElementById('copy-bill-btn');
    const saveToExpensesBtn = document.getElementById('save-to-expenses-btn');
    const addRowBtn = document.getElementById('add-row-btn');
    const addStockRowBtn = document.getElementById('add-stock-row-btn');

    // Expense Page Elements
    const expenseForm = document.getElementById('expense-form');
    const expenseDateInput = document.getElementById('expense-date');
    const expenseTimeInput = document.getElementById('expense-time');
    const expenseDescInput = document.getElementById('expense-desc');
    const expenseCategoryInput = document.getElementById('expense-category');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseTypeInput = document.getElementById('expense-type');
    const expenseTableBody = document.querySelector('#expense-table tbody');
    const totalEarnedEl = document.getElementById('total-earned');
    const totalInvestedEl = document.getElementById('total-invested');
    const totalDueEl = document.getElementById('total-due');
    const netProfitEl = document.getElementById('net-profit');
    const netProfitPercentEl = document.getElementById('net-profit-percent');
    const searchExpensesInput = document.getElementById('search-expenses');
    const filterCategorySelect = document.getElementById('filter-category');
    const resetDataBtn = document.getElementById('reset-data-btn');
    const exportExcelBtn = document.getElementById('export-excel-btn');
    const quickSaveBtn = document.getElementById('quick-save-btn');
    const autoBackupCheckbox = document.getElementById('auto-backup-checkbox');
    const unsavedIndicator = document.getElementById('unsaved-indicator');
    const lastSaveTimeEl = document.getElementById('last-save-time');
    const stockTableBody = document.getElementById('stock-table-body');
    const dailySummaryBody = document.getElementById('daily-summary-body');
    const dailyEntryForm = document.getElementById('daily-entry-form');
    const dailyEntryDateInput = document.getElementById('daily-entry-date');
    const dailyEntryPapersInput = document.getElementById('daily-entry-papers');
    const dailyEntryAmountInput = document.getElementById('daily-entry-amount');
    const faqBtn = document.getElementById('faq-btn');
    const faqModal = document.getElementById('faq-modal');
    const modalClose = document.querySelector('.modal-close');

    // --- STATE MANAGEMENT ---
    const defaultBillingItems = [
        { name: 'One-sided Black & White', price: 3.00, discountRupees: 1.00, discountPercent: 33.33, extraDiscountPercent: 0.00, quantity: 0 },
        { name: 'Double-sided Black & White', price: 5.00, discountRupees: 1.00, discountPercent: 20.00, extraDiscountPercent: 0.00, quantity: 0 },
        { name: 'One-sided Colour', price: 10.00, discountRupees: 3.00, discountPercent: 30.00, extraDiscountPercent: 0.00, quantity: 0 },
        { name: 'Double-sided Colour', price: 20.00, discountRupees: 6.00, discountPercent: 30.00, extraDiscountPercent: 0.00, quantity: 0 },
        { name: 'A4 Size Sticker', price: 30.00, discountRupees: 0.00, discountPercent: 0.00, extraDiscountPercent: 0.00, quantity: 0 },
        { name: 'A4 Size Photo', price: 70.00, discountRupees: 20.00, discountPercent: 28.57, extraDiscountPercent: 0.00, quantity: 0 },
        { name: 'Stick File', price: 15.00, discountRupees: 3.00, discountPercent: 20.00, extraDiscountPercent: 0.00, quantity: 0 },
        { name: '', price: 0.00, discountRupees: 0.00, discountPercent: 0.00, extraDiscountPercent: 0.00, quantity: 0 },
    ];
    
    const defaultStockItems = [
        { type: 'Plain', invested: 0, earned: 0, bought: 0, sold: 0 },
        { type: 'Sticker', invested: 0, earned: 0, bought: 0, sold: 0 },
        { type: 'Photo', invested: 0, earned: 0, bought: 0, sold: 0 },
        { type: 'Stick File', invested: 0, earned: 0, bought: 0, sold: 0 },
        { type: 'Label', invested: 0, earned: 0, bought: 0, sold: 0 },
    ];
    
    let billingItems = JSON.parse(JSON.stringify(defaultBillingItems)); // Deep copy of defaults
    let stockItems = JSON.parse(JSON.stringify(defaultStockItems)); // Deep copy of defaults
    let expenses = [];
    let manualDailySummary = []; // Array to store manually added daily entries
    
    // Sorting state for expense table
    let currentSortColumn = 'date';
    let currentSortOrder = 'desc'; // 'asc' or 'desc'
    
    // Auto-backup state
    let hasUnsavedChanges = false;
    let lastSaveTime = null;
    let autoBackupEnabled = localStorage.getItem('autoBackupEnabled') === 'true';
    let backupCounter = parseInt(localStorage.getItem('backupCounter') || '1');

    // --- INITIALIZATION ---
    function initializeApp() {
        loadFromLocalStorage();
        setCurrentDateTime(); // Set current date and time by default
        renderBillingTable();
        renderStockTable();
        renderExpenseTable();
        renderDailySummary();
        updateSummary();
        updateBackupStatus();
        addEventListeners();
        
        // Log to console
        console.log('KIIT-PRINT initialized with default discounts:');
        console.log('B&W one-sided: ₹3 → ₹2 (₹1 off, 33.33%)');
        console.log('B&W double: ₹5 → ₹4 (₹1 off, 20%)');
        console.log('Color one: ₹10 → ₹7 (₹3 off, 30%)');
        console.log('Color double: ₹20 → ₹14 (₹6 off, 30%)');
        console.log('Sticker: ₹30 → ₹30 (no discount)');
        console.log('Photo: ₹70 → ₹50 (₹20 off, 28.57%)');
        console.log('Stick File: ₹15 → ₹12 (₹3 off, 20%)');
    }

    // --- SET CURRENT DATE AND TIME ---
    function setCurrentDateTime() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        const timeStr = now.toTimeString().slice(0, 5); // HH:MM format
        billDateInput.value = dateStr;
        billTimeInput.value = timeStr;
        expenseDateInput.value = dateStr;
        expenseTimeInput.value = timeStr;
    }

    // --- LOCAL STORAGE ---
    function loadFromLocalStorage() {
        const savedExpenses = localStorage.getItem('kiitprintExpenses');
        if (savedExpenses) {
            expenses = JSON.parse(savedExpenses);
        }
        const savedBilling = localStorage.getItem('kiitprintBilling');
        if (savedBilling) {
            const loadedItems = JSON.parse(savedBilling);
            
            // Migrate old data structure to new one with discount values
            billingItems = loadedItems.map((item, index) => {
                // If item doesn't have discount properties, add them from defaults
                if (item.discountRupees === undefined || item.discountPercent === undefined) {
                    const defaultItem = defaultBillingItems[index] || { discountRupees: 0.00, discountPercent: 0.00, extraDiscountPercent: 0.00, quantity: 0 };
                    return {
                        ...item,
                        discountRupees: defaultItem.discountRupees,
                        discountPercent: defaultItem.discountPercent,
                        extraDiscountPercent: item.extraDiscountPercent !== undefined ? item.extraDiscountPercent : defaultItem.extraDiscountPercent,
                        quantity: item.quantity !== undefined ? item.quantity : defaultItem.quantity
                    };
                }
                // Add extraDiscountPercent if missing
                if (item.extraDiscountPercent === undefined) {
                    return {
                        ...item,
                        extraDiscountPercent: 0.00
                    };
                }
                return item;
            });
            
            // Save the migrated data
            saveBillingToLocalStorage();
        }
        const savedStock = localStorage.getItem('kiitprintStock');
        if (savedStock) {
            stockItems = JSON.parse(savedStock);
            
            // Migrate old stock data - add Stick File if missing
            if (stockItems.length === 4 && stockItems[3].type === 'Label') {
                // Old structure: Plain, Sticker, Photo, Label
                // Insert Stick File before Label
                stockItems.splice(3, 0, { type: 'Stick File', invested: 0, earned: 0, bought: 0, sold: 0 });
                saveStockToLocalStorage();
                console.log('Stock migrated: Added Stick File row');
            }
        }
        const savedManualDaily = localStorage.getItem('kiitprintManualDaily');
        if (savedManualDaily) {
            manualDailySummary = JSON.parse(savedManualDaily);
        }
    }

    function saveExpensesToLocalStorage() {
        localStorage.setItem('kiitprintExpenses', JSON.stringify(expenses));
    }

    function saveBillingToLocalStorage() {
        localStorage.setItem('kiitprintBilling', JSON.stringify(billingItems));
    }

    function saveStockToLocalStorage() {
        localStorage.setItem('kiitprintStock', JSON.stringify(stockItems));
    }

    function saveManualDailyToLocalStorage() {
        localStorage.setItem('kiitprintManualDaily', JSON.stringify(manualDailySummary));
    }

    // --- TAB SWITCHING ---
    function switchTab(tab) {
        if (tab === 'billing') {
            billingPage.classList.remove('hidden');
            expensePage.classList.add('hidden');
            billingTabBtn.classList.add('active');
            expenseTabBtn.classList.remove('active');
        } else {
            billingPage.classList.add('hidden');
            expensePage.classList.remove('hidden');
            billingTabBtn.classList.remove('active');
            expenseTabBtn.classList.add('active');
        }
    }

    // --- BILLING PAGE LOGIC ---
    function renderBillingTable() {
        billingTableBody.innerHTML = '';
        billingItems.forEach((item, index) => {
            const discountRs = item.discountRupees !== undefined ? item.discountRupees : 0.00;
            const discountPercent = item.discountPercent !== undefined ? item.discountPercent : 0.00;
            const extraDiscountPercent = item.extraDiscountPercent !== undefined ? item.extraDiscountPercent : 0.00;
            const quantity = item.quantity !== undefined ? item.quantity : 0;
            const discountedPrice = item.price - discountRs;
            const finalPrice = discountedPrice * quantity;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" class="product-name" value="${item.name}" placeholder="Product name"></td>
                <td><input type="number" class="actual-price" value="${item.price.toFixed(2)}" min="0" step="0.01"></td>
                <td><input type="number" class="discount-rs" value="${discountRs.toFixed(2)}" min="0" step="0.01"></td>
                <td><input type="number" class="discount-percent" value="${discountPercent.toFixed(2)}" min="0" step="0.01" placeholder="Base %"></td>
                <td><input type="number" class="extra-discount-percent" value="${extraDiscountPercent.toFixed(2)}" min="0" step="0.01" placeholder="Extra %"></td>
                <td><input type="number" class="quantity" value="${quantity}" min="0"></td>
                <td><input type="number" class="discounted-price" value="${discountedPrice.toFixed(2)}" min="0" step="0.01"></td>
                <td class="final-price">₹${finalPrice.toFixed(2)}</td>
                ${index >= 7 ? '<td><button class="delete-row-btn" data-index="' + index + '">Delete</button></td>' : '<td></td>'}
            `;
            billingTableBody.appendChild(row);
        });
        updateBillingTotal();
    }

    function updateBillingRow(row) {
        const actualPriceInput = row.querySelector('.actual-price');
        const discountRsInput = row.querySelector('.discount-rs');
        const discountPercentInput = row.querySelector('.discount-percent');
        const extraDiscountPercentInput = row.querySelector('.extra-discount-percent');
        const quantityInput = row.querySelector('.quantity');
        const discountedPriceInput = row.querySelector('.discounted-price');
        const productNameInput = row.querySelector('.product-name');

        const actualPrice = parseFloat(actualPriceInput.value) || 0;
        let discountRs = parseFloat(discountRsInput.value) || 0;
        let discountPercent = parseFloat(discountPercentInput.value) || 0;
        let extraDiscountPercent = parseFloat(extraDiscountPercentInput.value) || 0;
        let discountedPrice = parseFloat(discountedPriceInput.value) || 0;
        const quantity = parseInt(quantityInput.value) || 0;

        // Determine which field was just changed
        const activeElement = document.activeElement;

        // If base discount % is changed, calculate discount ₹ and discounted price
        if (activeElement === discountPercentInput) {
            // Calculate total discount percentage (base + extra)
            const totalDiscountPercent = discountPercent + extraDiscountPercent;
            discountRs = (actualPrice * totalDiscountPercent) / 100;
            discountRsInput.value = discountRs.toFixed(2);
            discountedPrice = actualPrice - discountRs;
            discountedPriceInput.value = discountedPrice.toFixed(2);
        }
        // If extra discount % is changed, calculate discount ₹ and discounted price
        else if (activeElement === extraDiscountPercentInput) {
            // Calculate total discount percentage (base + extra)
            const totalDiscountPercent = discountPercent + extraDiscountPercent;
            discountRs = (actualPrice * totalDiscountPercent) / 100;
            discountRsInput.value = discountRs.toFixed(2);
            discountedPrice = actualPrice - discountRs;
            discountedPriceInput.value = discountedPrice.toFixed(2);
        }
        // If discount ₹ is changed, calculate total discount % (split into base, extra stays same)
        else if (activeElement === discountRsInput) {
            const totalDiscountPercent = actualPrice > 0 ? (discountRs / actualPrice) * 100 : 0;
            // Keep extra discount same, adjust base discount
            discountPercent = totalDiscountPercent - extraDiscountPercent;
            discountPercentInput.value = discountPercent.toFixed(2);
            discountedPrice = actualPrice - discountRs;
            discountedPriceInput.value = discountedPrice.toFixed(2);
        }
        // If discounted price is changed directly, calculate discount ₹ and %
        else if (activeElement === discountedPriceInput) {
            discountRs = actualPrice - discountedPrice;
            discountRsInput.value = discountRs.toFixed(2);
            const totalDiscountPercent = actualPrice > 0 ? (discountRs / actualPrice) * 100 : 0;
            // Keep extra discount same, adjust base discount
            discountPercent = totalDiscountPercent - extraDiscountPercent;
            discountPercentInput.value = discountPercent.toFixed(2);
        }
        // If actual price is changed, recalculate based on existing discount
        else if (activeElement === actualPriceInput) {
            // Keep the discount percentages and recalculate discount Rs and discounted price
            const totalDiscountPercent = discountPercent + extraDiscountPercent;
            discountRs = (actualPrice * totalDiscountPercent) / 100;
            discountRsInput.value = discountRs.toFixed(2);
            discountedPrice = actualPrice - discountRs;
            discountedPriceInput.value = discountedPrice.toFixed(2);
        }
        
        // Calculate final = discounted price × quantity
        const finalPrice = discountedPrice * quantity;
        row.querySelector('.final-price').textContent = `₹${finalPrice.toFixed(2)}`;

        // Update the state for localStorage
        const rowIndex = Array.from(billingTableBody.children).indexOf(row);
        if (billingItems[rowIndex]) {
            billingItems[rowIndex].price = actualPrice;
            billingItems[rowIndex].name = productNameInput.value;
            billingItems[rowIndex].discountRupees = discountRs;
            billingItems[rowIndex].discountPercent = discountPercent;
            billingItems[rowIndex].extraDiscountPercent = extraDiscountPercent;
            billingItems[rowIndex].quantity = quantity;
        }

        updateBillingTotal();
    }

    function addNewRow() {
        billingItems.push({ name: '', price: 0.00, discountRupees: 0.00, discountPercent: 0.00, extraDiscountPercent: 0.00, quantity: 0 });
        renderBillingTable();
        saveBillingToLocalStorage();
    }

    function deleteRow(index) {
        if (index < 7) {
            alert('Cannot delete default rows (1-7). You can only delete extra rows.');
            return;
        }
        if (confirm('Are you sure you want to delete this row?')) {
            billingItems.splice(index, 1);
            renderBillingTable();
            saveBillingToLocalStorage();
        }
    }

    function updateBillingTotal() {
        let total = 0;
        billingTableBody.querySelectorAll('tr').forEach(row => {
            const finalPriceText = row.querySelector('.final-price').textContent;
            total += parseFloat(finalPriceText.replace('₹', '')) || 0;
        });
        billingTotalEl.textContent = `₹${total.toFixed(2)}`;
    }

    function generateBillHTML() {
        const customerName = customerNameInput.value || 'Walk-in Customer';
        
        // Get date and time from inputs
        const billDate = billDateInput.value;
        const billTime = billTimeInput.value;
        
        // Format date and time for display
        let displayDate = 'N/A';
        let displayTime = 'N/A';
        
        if (billDate) {
            const dateObj = new Date(billDate);
            displayDate = dateObj.toLocaleDateString();
        }
        
        if (billTime) {
            // Convert 24-hour time to 12-hour format with AM/PM
            const [hours, minutes] = billTime.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            displayTime = `${displayHour}:${minutes}:00 ${ampm}`;
        }
        
        let billContent = `
            <style>
                @media print {
                    @page {
                        size: A5;
                        margin: 10mm;
                    }
                }
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0;
                    padding: 10px;
                    width: 148mm;
                    height: 210mm;
                    box-sizing: border-box;
                }
                .bill-header { 
                    margin-bottom: 15px;
                    border-bottom: 2px solid #2E7D32;
                    padding-bottom: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .bill-header .logo {
                    flex-shrink: 0;
                }
                .bill-header .logo img {
                    width: 80px;
                    height: 80px;
                    object-fit: contain;
                }
                .bill-header .header-content {
                    flex: 1;
                    text-align: center;
                }
                .bill-header h1 { 
                    color: #2E7D32; 
                    margin: 0 0 5px 0;
                    font-size: 24px;
                }
                .bill-header .bill-type {
                    font-size: 14px;
                    font-weight: bold;
                    color: #FF9800;
                    margin: 5px 0;
                }
                .bill-header p {
                    margin: 3px 0;
                    font-size: 11px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 10px; 
                    font-size: 10px;
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 4px; 
                    text-align: left; 
                }
                th { 
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                .total { 
                    font-weight: bold; 
                    font-size: 12px; 
                }
                .footer { 
                    margin-top: 15px; 
                    text-align: center; 
                    font-size: 10px;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .footer-text {
                    flex: 1;
                    text-align: left;
                }
                .footer-qr {
                    flex-shrink: 0;
                    margin-left: 10px;
                }
                .footer-qr img {
                    width: 80px;
                    height: 80px;
                    border: 1px solid #ddd;
                }
            </style>
            <div class="bill-header">
                <div class="logo">
                    <img src="LOGO.jpg" alt="KIIT-PRINT Logo">
                </div>
                <div class="header-content">
                    <h1>KIIT-PRINT</h1>
                    <div class="bill-type">Bill / Invoice</div>
                    <p>Date: ${displayDate} | Time: ${displayTime}</p>
                    <p><strong>Customer:</strong> ${customerName}</p>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Product</th>
                        <th>Price (₹)</th>
                        <th>Disc (₹)</th>
                        <th>Base %</th>
                        <th>Extra %</th>
                        <th>Qty</th>
                        <th>Rate (₹)</th>
                        <th>Final (₹)</th>
                    </tr>
                </thead>
                <tbody>`;

        let hasItems = false;
        let hasExtraDiscount = false;
        
        // First pass: check if any item has extra discount and build items array
        const billItems = [];
        billingTableBody.querySelectorAll('tr').forEach((row, index) => {
            const quantity = parseInt(row.querySelector('.quantity').value) || 0;
            if (quantity > 0) {
                hasItems = true;
                const extraDiscountPercent = row.querySelector('.extra-discount-percent').value;
                const extraDisc = parseFloat(extraDiscountPercent) || 0;
                if (extraDisc > 0) hasExtraDiscount = true;
                
                billItems.push({
                    sno: index + 1,
                    product: row.querySelector('.product-name').value || 'Item',
                    actualPrice: row.querySelector('.actual-price').value,
                    discountRs: row.querySelector('.discount-rs').value,
                    discountPercent: row.querySelector('.discount-percent').value,
                    extraDiscountPercent: extraDiscountPercent,
                    discountedPrice: row.querySelector('.discounted-price').value,
                    finalPrice: row.querySelector('.final-price').textContent,
                    quantity: quantity
                });
            }
        });

        if (!hasItems) return '<p>No items were added to the bill.</p>';
        
        // Rebuild table header based on whether extra discount exists
        let tableHeader = `
            </div>
            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Product</th>
                        <th>Price (₹)</th>
                        <th>Disc (₹)</th>
                        <th>${hasExtraDiscount ? 'Base %' : 'Disc (%)'}</th>`;
        
        if (hasExtraDiscount) {
            tableHeader += `
                        <th>Extra %</th>`;
        }
        
        tableHeader += `
                        <th>Qty</th>
                        <th>Rate (₹)</th>
                        <th>Final (₹)</th>
                    </tr>
                </thead>
                <tbody>`;
        
        billContent = billContent.substring(0, billContent.lastIndexOf('</div>') + 6) + tableHeader;
        
        // Second pass: render items
        billItems.forEach(item => {
            const baseDisc = parseFloat(item.discountPercent) || 0;
            const extraDisc = parseFloat(item.extraDiscountPercent) || 0;
            
            billContent += `
                    <tr>
                        <td>${item.sno}</td>
                        <td>${item.product}</td>
                        <td>₹${parseFloat(item.actualPrice).toFixed(2)}</td>
                        <td>₹${parseFloat(item.discountRs).toFixed(2)}</td>
                        <td>${baseDisc.toFixed(1)}%</td>`;
            
            if (hasExtraDiscount) {
                billContent += `
                        <td>${extraDisc > 0 ? extraDisc.toFixed(1) + '%' : '-'}</td>`;
            }
            
            billContent += `
                        <td>${item.quantity}</td>
                        <td>₹${parseFloat(item.discountedPrice).toFixed(2)}</td>
                        <td>${item.finalPrice}</td>
                    </tr>`;
        });

        const totalColspan = hasExtraDiscount ? 8 : 7;

        billContent += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="${totalColspan}" style="text-align:right;" class="total">Total</td>
                        <td class="total">${billingTotalEl.textContent}</td>
                    </tr>
                </tfoot>
            </table>
            <div class="footer">
                <div class="footer-text">
                    <p><strong>Thank you for contacting KIIT-PRINT!</strong></p>
                    <p>Contact: 6372362313 | UPI: pushkarjay2@ybl</p>
                </div>
                <div class="footer-qr">
                    <img src="UPI-QR.jpeg" alt="UPI QR Code">
                </div>
            </div>
        `;
        return billContent;
    }

    function copyBillText() {
        const customerName = customerNameInput.value || 'Walk-in Customer';
        
        // Get date and time from inputs
        const billDate = billDateInput.value;
        const billTime = billTimeInput.value;
        
        // Format date and time for display
        let displayDate = 'N/A';
        let displayTime = 'N/A';
        
        if (billDate) {
            const dateObj = new Date(billDate);
            displayDate = dateObj.toLocaleDateString();
        }
        
        if (billTime) {
            const [hours, minutes] = billTime.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            displayTime = `${displayHour}:${minutes}:00 ${ampm}`;
        }
        
        let text = `** KIIT-PRINT - BILL / INVOICE **\n`;
        text += `Date: ${displayDate} | Time: ${displayTime}\n`;
        text += `Customer: ${customerName}\n\n`;
        text += `--------------------------------\n`;

        billingTableBody.querySelectorAll('tr').forEach(row => {
            const quantity = parseInt(row.querySelector('.quantity').value) || 0;
            if (quantity > 0) {
                const product = row.querySelector('.product-name').value || 'Item';
                const finalPrice = row.querySelector('.final-price').textContent;
                text += `${product} (Qty: ${quantity}) - ${finalPrice}\n`;
            }
        });

        text += `--------------------------------\n`;
        text += `TOTAL: ${billingTotalEl.textContent}\n\n`;
        text += `Thank you!\nContact: 6372362313 | UPI: pushkarjay2@ybl`;

        navigator.clipboard.writeText(text).then(() => {
            copyBillBtn.textContent = 'Copied!';
            setTimeout(() => { copyBillBtn.textContent = 'Copy Bill Text'; }, 2000);
        });
    }

    function saveBillToExpenses() {
        const total = parseFloat(billingTotalEl.textContent.replace('₹', '')) || 0;
        if (total <= 0) {
            alert('Cannot save an empty bill.');
            return;
        }
        const customerName = customerNameInput.value.trim();
        const description = customerName ? `Sale to ${customerName}` : 'Walk-in Sale';

        // Calculate total quantity of papers sold
        let totalQuantity = 0;
        billingTableBody.querySelectorAll('tr').forEach((row) => {
            const quantity = parseInt(row.querySelector('.quantity').value) || 0;
            totalQuantity += quantity;
        });

        // Update paper stock based on quantities sold
        console.log('Updating paper stock...');
        updatePaperStock();
        console.log('Paper stock updated:', stockItems);

        // Get the custom date and time from bill inputs
        const customDate = billDateInput.value;
        const customTime = billTimeInput.value;

        addExpenseEntry({
            description,
            category: 'Sale',
            amount: total,
            type: 'Earned',
            customDate: customDate,
            customTime: customTime,
            quantity: totalQuantity
        });

        alert('Bill saved to Expense Tracker and Paper Stock updated.');
        switchTab('expense');
    }

    // --- PAPER STOCK MANAGEMENT ---
    function updatePaperStock() {
        // Mapping: Bill rows 0-3 → Plain paper, Row 4 → Sticker, Row 5 → Photo, Row 6 → Stick File
        billingTableBody.querySelectorAll('tr').forEach((row, index) => {
            const quantity = parseInt(row.querySelector('.quantity').value) || 0;
            const finalPriceText = row.querySelector('.final-price').textContent;
            const finalAmount = parseFloat(finalPriceText.replace('₹', '')) || 0;
            
            if (quantity > 0) {
                if (index <= 3) {
                    // Rows 1-4 (index 0-3): Plain paper
                    stockItems[0].sold += quantity;
                    stockItems[0].earned += finalAmount;
                } else if (index === 4) {
                    // Row 5 (index 4): Sticker paper
                    stockItems[1].sold += quantity;
                    stockItems[1].earned += finalAmount;
                } else if (index === 5) {
                    // Row 6 (index 5): Photo paper
                    stockItems[2].sold += quantity;
                    stockItems[2].earned += finalAmount;
                } else if (index === 6) {
                    // Row 7 (index 6): Stick File
                    stockItems[3].sold += quantity;
                    stockItems[3].earned += finalAmount;
                }
                // Label paper (index 4) is manually updated only
            }
        });
        
        saveStockToLocalStorage();
        renderStockTable();
        markUnsavedChanges();
    }
    
    function renderStockTable() {
        stockTableBody.innerHTML = '';
        
        // Initialize totals
        let totalInvested = 0;
        let totalEarned = 0;
        let totalBought = 0;
        let totalSold = 0;
        let totalStock = 0;
        
        stockItems.forEach((item, index) => {
            const stock = item.bought - item.sold;
            
            // Add to totals
            totalInvested += item.invested;
            totalEarned += item.earned;
            totalBought += item.bought;
            totalSold += item.sold;
            totalStock += stock;
            
            // First 5 are default stock types (Plain, Sticker, Photo, Stick File, Label)
            const isDefaultStock = index < 5;
            
            const row = document.createElement('tr');
            if (isDefaultStock) {
                row.innerHTML = `
                    <td class="paper-type">${item.type}</td>
                    <td><input type="number" class="stock-invested" value="${item.invested.toFixed(2)}" min="0" step="0.01" data-index="${index}"></td>
                    <td><input type="number" class="stock-earned" value="${item.earned.toFixed(2)}" min="0" step="0.01" data-index="${index}"></td>
                    <td><input type="number" class="stock-bought" value="${item.bought}" min="0" data-index="${index}"></td>
                    <td><input type="number" class="stock-sold" value="${item.sold}" min="0" data-index="${index}"></td>
                    <td class="stock-value">${stock}</td>
                    <td></td>
                `;
            } else {
                row.innerHTML = `
                    <td><input type="text" class="stock-type-name" value="${item.type}" data-index="${index}" placeholder="Type name"></td>
                    <td><input type="number" class="stock-invested" value="${item.invested.toFixed(2)}" min="0" step="0.01" data-index="${index}"></td>
                    <td><input type="number" class="stock-earned" value="${item.earned.toFixed(2)}" min="0" step="0.01" data-index="${index}"></td>
                    <td><input type="number" class="stock-bought" value="${item.bought}" min="0" data-index="${index}"></td>
                    <td><input type="number" class="stock-sold" value="${item.sold}" min="0" data-index="${index}"></td>
                    <td class="stock-value">${stock}</td>
                    <td><button class="delete-stock-btn" data-index="${index}">Delete</button></td>
                `;
            }
            stockTableBody.appendChild(row);
        });
        
        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.style.backgroundColor = '#fff3e0';
        totalRow.innerHTML = `
            <td class="paper-type">TOTAL</td>
            <td>₹${totalInvested.toFixed(2)}</td>
            <td>₹${totalEarned.toFixed(2)}</td>
            <td>${totalBought}</td>
            <td>${totalSold}</td>
            <td class="stock-value">${totalStock}</td>
            <td></td>
        `;
        stockTableBody.appendChild(totalRow);
    }

    function updateStockRow(input) {
        const index = parseInt(input.getAttribute('data-index'));
        const row = input.closest('tr');
        
        if (input.classList.contains('stock-type-name')) {
            stockItems[index].type = input.value;
        } else if (input.classList.contains('stock-invested')) {
            stockItems[index].invested = parseFloat(input.value) || 0;
        } else if (input.classList.contains('stock-earned')) {
            stockItems[index].earned = parseFloat(input.value) || 0;
        } else if (input.classList.contains('stock-bought')) {
            stockItems[index].bought = parseInt(input.value) || 0;
        } else if (input.classList.contains('stock-sold')) {
            stockItems[index].sold = parseInt(input.value) || 0;
        }
        
        // Update stock display
        const stock = stockItems[index].bought - stockItems[index].sold;
        row.querySelector('.stock-value').textContent = stock;
        
        saveStockToLocalStorage();
        renderStockTable();
        markUnsavedChanges();
    }

    function addStockRow() {
        stockItems.push({ type: '', invested: 0, earned: 0, bought: 0, sold: 0 });
        renderStockTable();
        saveStockToLocalStorage();
        markUnsavedChanges();
    }

    function deleteStockRow(index) {
        if (index < 5) {
            alert('Cannot delete default stock types (Plain, Sticker, Photo, Stick File, Label).');
            return;
        }
        if (confirm(`Are you sure you want to delete stock type "${stockItems[index].type}"?`)) {
            stockItems.splice(index, 1);
            renderStockTable();
            saveStockToLocalStorage();
            markUnsavedChanges();
        }
    }

    // --- EXPENSE TRACKER LOGIC ---
    function sortExpenses(expenses) {
        return expenses.sort((a, b) => {
            let aValue, bValue;
            
            switch(currentSortColumn) {
                case 'date':
                    aValue = new Date(a.date).getTime();
                    bValue = new Date(b.date).getTime();
                    break;
                case 'description':
                    aValue = a.description.toLowerCase();
                    bValue = b.description.toLowerCase();
                    break;
                case 'category':
                    aValue = a.category;
                    bValue = b.category;
                    break;
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount;
                    break;
                case 'type':
                    aValue = a.type;
                    bValue = b.type;
                    break;
                default:
                    return 0;
            }
            
            if (currentSortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
    }
    
    function updateSortIcons() {
        // Reset all sort icons
        document.querySelectorAll('.sort-icon').forEach(icon => {
            icon.textContent = '↕';
        });
        
        // Update the active column icon
        const activeHeader = document.querySelector(`th[data-column="${currentSortColumn}"] .sort-icon`);
        if (activeHeader) {
            activeHeader.textContent = currentSortOrder === 'asc' ? '↑' : '↓';
        }
    }
    
    function renderExpenseTable() {
        expenseTableBody.innerHTML = '';
        const searchTerm = searchExpensesInput.value.toLowerCase();
        const filterCategory = filterCategorySelect.value;

        const filteredExpenses = expenses.filter(expense => {
            const matchesSearch = expense.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !filterCategory || expense.category === filterCategory;
            return matchesSearch && matchesCategory;
        });

        // Apply sorting
        const sortedExpenses = sortExpenses([...filteredExpenses]);
        
        // Update sort icons
        updateSortIcons();

        if (sortedExpenses.length === 0) {
            expenseTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No entries found.</td></tr>';
        } else {
            sortedExpenses.forEach((expense, index) => {
                const expenseDate = new Date(expense.date);
                const dateStr = expenseDate.toLocaleDateString();
                const timeStr = expenseDate.toLocaleTimeString();
                
                // Find the original index in the expenses array
                const originalIndex = expenses.findIndex(e => 
                    e.date === expense.date && 
                    e.description === expense.description && 
                    e.amount === expense.amount
                );
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${dateStr} ${timeStr}</td>
                    <td>${expense.description}</td>
                    <td>${expense.category}</td>
                    <td>₹${expense.amount.toFixed(2)}</td>
                    <td>${expense.type}</td>
                    <td class="action-buttons">
                        <button class="edit-expense-btn" data-index="${originalIndex}" title="Edit">✏️</button>
                        <button class="delete-expense-btn" data-index="${originalIndex}" title="Delete">🗑️</button>
                    </td>
                `;
                expenseTableBody.appendChild(row);
            });
            
            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-expense-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    editExpenseEntry(index);
                });
            });
            
            document.querySelectorAll('.delete-expense-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    deleteExpenseEntry(index);
                });
            });
        }
    }

    function updateSummary() {
        // Total Earned = Sales that are marked as "Earned" (not Investment/Expense)
        const totalEarned = expenses
            .filter(e => e.category === 'Sale' && (e.type === 'Earned' || e.type === 'Paid'))
            .reduce((sum, e) => sum + e.amount, 0);

        // Total Invested = Investment + Expense categories that are "Paid"
        const totalInvested = expenses
            .filter(e => (e.category === 'Investment' || e.category === 'Expense') && e.type === 'Paid')
            .reduce((sum, e) => sum + e.amount, 0);

        // Total Due = All entries marked as "Due" (regardless of category)
        const totalDue = expenses
            .filter(e => e.type === 'Due')
            .reduce((sum, e) => sum + e.amount, 0);

        // Net Profit = Total Earned - Total Invested
        const netProfit = totalEarned - totalInvested;
        const netProfitPercent = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

        totalEarnedEl.textContent = `₹${totalEarned.toFixed(2)}`;
        totalInvestedEl.textContent = `₹${totalInvested.toFixed(2)}`;
        totalDueEl.textContent = `₹${totalDue.toFixed(2)}`;
        netProfitEl.textContent = `₹${netProfit.toFixed(2)}`;
        netProfitPercentEl.textContent = `(${netProfitPercent.toFixed(2)}%)`;

        netProfitEl.className = netProfit >= 0 ? 'positive' : 'negative';
        netProfitPercentEl.className = netProfit >= 0 ? 'positive' : 'negative';
    }

    function renderDailySummary() {
        // Group sales by date and calculate daily totals from automatic sales
        const salesByDate = {};
        
        expenses
            .filter(e => e.category === 'Sale')
            .forEach(expense => {
                const expenseDate = new Date(expense.date);
                const dateKey = expenseDate.toLocaleDateString('en-GB'); // DD/MM/YYYY format
                
                if (!salesByDate[dateKey]) {
                    salesByDate[dateKey] = {
                        paperCount: 0,
                        amount: 0,
                        sortDate: expenseDate,
                        isManual: false
                    };
                }
                
                salesByDate[dateKey].paperCount += expense.quantity || 0;
                salesByDate[dateKey].amount += expense.amount;
            });
        
        // Add manual entries
        manualDailySummary.forEach((entry, index) => {
            const entryDate = new Date(entry.date);
            const dateKey = entryDate.toLocaleDateString('en-GB');
            
            if (!salesByDate[dateKey]) {
                salesByDate[dateKey] = {
                    paperCount: 0,
                    amount: 0,
                    sortDate: entryDate,
                    isManual: false
                };
            }
            
            // Add manual entry values
            salesByDate[dateKey].paperCount += entry.paperCount;
            salesByDate[dateKey].amount += entry.amount;
            salesByDate[dateKey].isManual = true; // Mark that this date has manual entries
            salesByDate[dateKey].manualIndex = index; // Store index for delete
        });
        
        // Convert to array and sort by date (most recent first)
        const dailySummaryData = Object.entries(salesByDate)
            .map(([date, data]) => ({
                date,
                paperCount: data.paperCount,
                amount: data.amount,
                sortDate: data.sortDate,
                isManual: data.isManual,
                manualIndex: data.manualIndex
            }))
            .sort((a, b) => b.sortDate - a.sortDate);
        
        // Clear and render table
        dailySummaryBody.innerHTML = '';
        
        if (dailySummaryData.length === 0) {
            dailySummaryBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">No sales data available</td></tr>';
            return;
        }
        
        dailySummaryData.forEach(day => {
            const tr = document.createElement('tr');
            
            let actionsHtml = '';
            if (day.isManual) {
                actionsHtml = `<button class="delete-daily-btn" data-index="${day.manualIndex}">Delete</button>`;
            } else {
                actionsHtml = '<span style="color: #999; font-size: 12px;">Auto</span>';
            }
            
            tr.innerHTML = `
                <td>${day.date}</td>
                <td style="text-align: center;">${day.paperCount}</td>
                <td style="text-align: right;">₹${day.amount.toFixed(2)}</td>
                <td style="text-align: center;">${actionsHtml}</td>
            `;
            dailySummaryBody.appendChild(tr);
        });
    }

    function addManualDailyEntry(entryData) {
        const entry = {
            date: entryData.date,
            paperCount: parseInt(entryData.paperCount),
            amount: parseFloat(entryData.amount)
        };
        
        manualDailySummary.push(entry);
        saveManualDailyToLocalStorage();
        renderDailySummary();
        markUnsavedChanges();
    }

    function deleteManualDailyEntry(index) {
        if (confirm('Are you sure you want to delete this manual entry?')) {
            manualDailySummary.splice(index, 1);
            saveManualDailyToLocalStorage();
            renderDailySummary();
            markUnsavedChanges();
        }
    }

    function handleDailyEntrySubmit(e) {
        e.preventDefault();
        const date = dailyEntryDateInput.value;
        const paperCount = dailyEntryPapersInput.value;
        const amount = dailyEntryAmountInput.value;

        if (!date || !paperCount || !amount) {
            alert('Please fill in all fields.');
            return;
        }

        addManualDailyEntry({ date, paperCount, amount });
        dailyEntryForm.reset();
    }

    function editExpenseEntry(index) {
        if (!expenses[index]) return;
        
        const expense = expenses[index];
        const expenseDate = new Date(expense.date);
        
        // Populate form with existing data
        expenseDateInput.value = expenseDate.toISOString().split('T')[0];
        expenseTimeInput.value = expenseDate.toTimeString().slice(0, 5);
        expenseDescInput.value = expense.description;
        expenseCategoryInput.value = expense.category;
        expenseAmountInput.value = expense.amount;
        expenseTypeInput.value = expense.type;
        
        // Delete the old entry
        expenses.splice(index, 1);
        saveAndRerenderExpenses();
        
        // Scroll to form
        expenseForm.scrollIntoView({ behavior: 'smooth' });
        expenseDescInput.focus();
    }

    function deleteExpenseEntry(index) {
        if (!expenses[index]) return;
        
        if (confirm('Are you sure you want to delete this expense entry?')) {
            expenses.splice(index, 1);
            saveAndRerenderExpenses();
        }
    }

    function addExpenseEntry(entryData) {
        // Create date from inputs or use current time
        let entryDate;
        if (entryData.customDate && entryData.customTime) {
            // Use custom date and time from form
            const [year, month, day] = entryData.customDate.split('-');
            const [hours, minutes] = entryData.customTime.split(':');
            entryDate = new Date(year, month - 1, day, hours, minutes);
        } else {
            entryDate = new Date();
        }
        
        const newEntry = {
            date: entryDate.toISOString(),
            description: entryData.description,
            category: entryData.category,
            amount: parseFloat(entryData.amount),
            type: entryData.type,
            quantity: entryData.quantity || 0 // Add quantity field (default to 0 for backward compatibility)
        };
        expenses.push(newEntry);
        saveAndRerenderExpenses();
        // Note: Auto-export removed to prevent automatic downloads on every entry
        // Use the "Export to Excel" button instead
    }

    function handleAddExpenseSubmit(e) {
        e.preventDefault();
        const description = expenseDescInput.value.trim();
        const category = expenseCategoryInput.value;
        const amount = expenseAmountInput.value;
        const type = expenseTypeInput.value;
        const customDate = expenseDateInput.value;
        const customTime = expenseTimeInput.value;

        if (!description || !amount || !customDate || !customTime) {
            alert('Please fill in all fields.');
            return;
        }

        addExpenseEntry({ description, category, amount, type, customDate, customTime });
        expenseForm.reset();
        setCurrentDateTime(); // Reset date/time to current after submit
    }
    
    function saveAndRerenderExpenses() {
        saveExpensesToLocalStorage();
        renderExpenseTable();
        renderDailySummary();
        updateSummary();
        markUnsavedChanges();
        
        // Auto-backup if enabled
        if (autoBackupEnabled) {
            setTimeout(() => autoBackupToExcel(), 500);
        }
    }

    function resetAllData() {
        if (confirm('Are you sure you want to reset all data? This will clear all expenses, reset billing prices, and reset paper stock. This action cannot be undone.')) {
            localStorage.removeItem('kiitprintExpenses');
            localStorage.removeItem('kiitprintBilling');
            localStorage.removeItem('kiitprintStock');
            localStorage.removeItem('kiitprintManualDaily');
            expenses = [];
            manualDailySummary = [];
            billingItems = JSON.parse(JSON.stringify(defaultBillingItems)); // Reset to defaults with discounts
            stockItems = JSON.parse(JSON.stringify(defaultStockItems)); // Reset stock to defaults
            renderBillingTable();
            renderStockTable();
            saveAndRerenderExpenses();
            alert('All data has been reset.');
        }
    }

    // --- EXCEL INTEGRATION (SheetJS) ---
    async function updateExcelFile() {
        try {
            const headers = ['Date & Time', 'Description / Customer', 'Category', 'Amount', 'Type'];
            const data = expenses.map(e => {
                const expenseDate = new Date(e.date);
                return {
                    'Date & Time': expenseDate.toLocaleString(),
                    'Description / Customer': e.description,
                    Category: e.category,
                    Amount: e.amount,
                    Type: e.type
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Records');

            // Download the updated Excel file
            XLSX.writeFile(workbook, 'records.xlsx');
            console.log('Excel file generated and downloaded as records.xlsx');
            
            markChangesSaved();

        } catch (error) {
            console.error('Error updating Excel file:', error);
            alert('Could not generate Excel file. See console for details.');
        }
    }
    
    // --- AUTO-BACKUP SYSTEM ---
    function markUnsavedChanges() {
        hasUnsavedChanges = true;
        updateBackupStatus();
    }
    
    function markChangesSaved() {
        hasUnsavedChanges = false;
        lastSaveTime = new Date();
        updateBackupStatus();
    }
    
    function updateBackupStatus() {
        // Update unsaved indicator
        if (hasUnsavedChanges) {
            unsavedIndicator.classList.remove('hidden');
        } else {
            unsavedIndicator.classList.add('hidden');
        }
        
        // Update last save time
        if (lastSaveTime) {
            const timeStr = lastSaveTime.toLocaleString();
            lastSaveTimeEl.textContent = `Last saved: ${timeStr}`;
            lastSaveTimeEl.style.color = '#4CAF50';
        } else {
            lastSaveTimeEl.textContent = 'Never saved';
            lastSaveTimeEl.style.color = '#D32F2F';
        }
        
        // Update auto-backup checkbox
        autoBackupCheckbox.checked = autoBackupEnabled;
    }
    
    function autoBackupToExcel() {
        try {
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const serialNo = String(backupCounter).padStart(4, '0');
            const filename = `KIIT-PRINT-Backup-${serialNo}-${timestamp}.xlsx`;
            
            const headers = ['Date & Time', 'Description / Customer', 'Category', 'Amount', 'Type'];
            const data = expenses.map(e => {
                const expenseDate = new Date(e.date);
                return {
                    'Date & Time': expenseDate.toLocaleString(),
                    'Description / Customer': e.description,
                    Category: e.category,
                    Amount: e.amount,
                    Type: e.type
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Records');

            // Download with timestamp and serial number
            XLSX.writeFile(workbook, filename);
            
            // Increment counter
            backupCounter++;
            localStorage.setItem('backupCounter', backupCounter);
            
            console.log(`Auto-backup saved: ${filename}`);
            markChangesSaved();

        } catch (error) {
            console.error('Error in auto-backup:', error);
        }
    }
    
    function toggleAutoBackup() {
        autoBackupEnabled = !autoBackupEnabled;
        localStorage.setItem('autoBackupEnabled', autoBackupEnabled);
        updateBackupStatus();
        
        if (autoBackupEnabled) {
            alert('✅ Auto-backup enabled!\n\nBackup files will be downloaded to your Downloads folder after each change.\n\nFilename format: KIIT-PRINT-Backup-0001-2025-11-03T15-30-45.xlsx\n\nTip: Configure your browser to auto-save to E:\\Projects\\Working\\KII-PRINT-BILLING\\Backup');
        } else {
            alert('Auto-backup disabled. Use Quick Save button to manually backup.');
        }
    }


    // --- EVENT LISTENERS ---
    function addEventListeners() {
        // Tab navigation
        billingTabBtn.addEventListener('click', () => switchTab('billing'));
        expenseTabBtn.addEventListener('click', () => switchTab('expense'));

        // Billing page listeners
        billingTableBody.addEventListener('input', (e) => {
            if (e.target.classList.contains('actual-price') || 
                e.target.classList.contains('discount-rs') || 
                e.target.classList.contains('discount-percent') ||
                e.target.classList.contains('extra-discount-percent') ||
                e.target.classList.contains('quantity') ||
                e.target.classList.contains('discounted-price') ||
                e.target.classList.contains('product-name')) {
                const row = e.target.closest('tr');
                updateBillingRow(row);
                saveBillingToLocalStorage();
            }
        });

        billingTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-row-btn')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                deleteRow(index);
            }
        });

        generateBillBtn.addEventListener('click', () => {
            const billHtml = generateBillHTML();
            const newWindow = window.open('', '_blank');
            newWindow.document.write(billHtml);
            newWindow.document.close();
            newWindow.print();
        });

        copyBillBtn.addEventListener('click', copyBillText);
        saveToExpensesBtn.addEventListener('click', saveBillToExpenses);
        addRowBtn.addEventListener('click', addNewRow);

        // Expense page listeners
        expenseForm.addEventListener('submit', handleAddExpenseSubmit);
        searchExpensesInput.addEventListener('input', renderExpenseTable);
        filterCategorySelect.addEventListener('change', renderExpenseTable);
        exportExcelBtn.addEventListener('click', updateExcelFile);
        quickSaveBtn.addEventListener('click', autoBackupToExcel);
        autoBackupCheckbox.addEventListener('change', toggleAutoBackup);
        resetDataBtn.addEventListener('click', resetAllData);
        
        // Stock table listeners
        stockTableBody.addEventListener('input', (e) => {
            if (e.target.classList.contains('stock-invested') || 
                e.target.classList.contains('stock-earned') ||
                e.target.classList.contains('stock-bought') ||
                e.target.classList.contains('stock-sold') ||
                e.target.classList.contains('stock-type-name')) {
                updateStockRow(e.target);
            }
        });
        
        stockTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-stock-btn')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                deleteStockRow(index);
            }
        });
        
        addStockRowBtn.addEventListener('click', addStockRow);
        
        // Daily entry form listeners
        dailyEntryForm.addEventListener('submit', handleDailyEntrySubmit);
        
        dailySummaryBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-daily-btn')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                deleteManualDailyEntry(index);
            }
        });
        
        // Sortable column headers
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', (e) => {
                // Don't sort if clicking on resize handle
                if (e.target.classList.contains('resize-handle')) return;
                
                const column = header.getAttribute('data-column');
                
                // Toggle sort order if clicking the same column
                if (currentSortColumn === column) {
                    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSortColumn = column;
                    currentSortOrder = 'asc';
                }
                
                renderExpenseTable();
            });
        });
        
        // Resizable columns functionality
        initResizableColumns();
        
        // FAQ Modal Event Listeners
        faqBtn.addEventListener('click', () => {
            faqModal.style.display = 'block';
        });
        
        modalClose.addEventListener('click', () => {
            faqModal.style.display = 'none';
        });
        
        // Close modal when clicking outside of it
        window.addEventListener('click', (e) => {
            if (e.target === faqModal) {
                faqModal.style.display = 'none';
            }
        });
    }
    
    // --- RESIZABLE COLUMNS ---
    function initResizableColumns() {
        const tables = document.querySelectorAll('.resizable-table');
        
        tables.forEach(table => {
            const headers = table.querySelectorAll('th.resizable');
            
            headers.forEach(header => {
                const resizeHandle = header.querySelector('.resize-handle');
                if (!resizeHandle) return;
                
                let startX, startWidth;
                
                const onMouseDown = (e) => {
                    e.stopPropagation();
                    startX = e.pageX;
                    startWidth = header.offsetWidth;
                    
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                    
                    header.style.userSelect = 'none';
                    document.body.style.cursor = 'col-resize';
                };
                
                const onMouseMove = (e) => {
                    const diff = e.pageX - startX;
                    const newWidth = startWidth + diff;
                    
                    if (newWidth >= 60) {
                        header.style.width = newWidth + 'px';
                        header.style.minWidth = newWidth + 'px';
                    }
                };
                
                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    
                    header.style.userSelect = '';
                    document.body.style.cursor = '';
                };
                
                resizeHandle.addEventListener('mousedown', onMouseDown);
            });
        });
    }

    // --- START THE APP ---
    initializeApp();
});
