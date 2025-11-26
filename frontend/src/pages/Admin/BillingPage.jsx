import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Trash2, FileText, Copy, Save, Download, RotateCcw, ChevronUp, ChevronDown, Search, HelpCircle, X } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

// Default billing items with preset discounts
const DEFAULT_BILLING_ITEMS = [
  { name: 'One-sided Black & White', price: 3.00, discountRupees: 1.00, baseDiscount: 33.33, extraDiscount: 0, quantity: 0 },
  { name: 'Double-sided Black & White', price: 5.00, discountRupees: 1.00, baseDiscount: 20.00, extraDiscount: 0, quantity: 0 },
  { name: 'One-sided Colour', price: 10.00, discountRupees: 3.00, baseDiscount: 30.00, extraDiscount: 0, quantity: 0 },
  { name: 'Double-sided Colour', price: 20.00, discountRupees: 6.00, baseDiscount: 30.00, extraDiscount: 0, quantity: 0 },
  { name: 'A4 Size Sticker', price: 30.00, discountRupees: 0.00, baseDiscount: 0.00, extraDiscount: 0, quantity: 0 },
  { name: 'A4 Size Photo', price: 70.00, discountRupees: 20.00, baseDiscount: 28.57, extraDiscount: 0, quantity: 0 },
  { name: 'Stick File', price: 15.00, discountRupees: 3.00, baseDiscount: 20.00, extraDiscount: 0, quantity: 0 },
]

const DEFAULT_STOCK_ITEMS = [
  { type: 'Plain', invested: 0, earned: 0, bought: 0, sold: 0 },
  { type: 'Sticker', invested: 0, earned: 0, bought: 0, sold: 0 },
  { type: 'Photo', invested: 0, earned: 0, bought: 0, sold: 0 },
  { type: 'Stick File', invested: 0, earned: 0, bought: 0, sold: 0 },
  { type: 'Label', invested: 0, earned: 0, bought: 0, sold: 0 },
]

export default function BillingPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('billing') // 'billing' or 'expense'
  const [loading, setLoading] = useState(true)
  const [showFAQ, setShowFAQ] = useState(false)

  // Billing state
  const [billingItems, setBillingItems] = useState([...DEFAULT_BILLING_ITEMS])
  const [customerName, setCustomerName] = useState('')
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0])
  const [billTime, setBillTime] = useState(new Date().toTimeString().slice(0, 5))

  // Expense state
  const [expenses, setExpenses] = useState([])
  const [stockItems, setStockItems] = useState([...DEFAULT_STOCK_ITEMS])
  const [dailySummary, setDailySummary] = useState([])
  
  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    description: '',
    category: 'Sale',
    amount: '',
    type: 'Earned'
  })
  
  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })

  // Load data from Firestore
  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const token = await user.getIdToken()
      const response = await apiRequest('/api/billing', {}, token)
      
      if (response.data) {
        if (response.data.billingItems?.length > 0) {
          setBillingItems(response.data.billingItems)
        }
        if (response.data.expenses) {
          setExpenses(response.data.expenses)
        }
        if (response.data.stockItems?.length > 0) {
          setStockItems(response.data.stockItems)
        }
        if (response.data.dailySummary) {
          setDailySummary(response.data.dailySummary)
        }
      }
    } catch (error) {
      console.error('Error loading billing data:', error)
      // If API doesn't exist yet, use localStorage as fallback
      const saved = localStorage.getItem('pja3d_billing')
      if (saved) {
        const data = JSON.parse(saved)
        if (data.billingItems) setBillingItems(data.billingItems)
        if (data.expenses) setExpenses(data.expenses)
        if (data.stockItems) setStockItems(data.stockItems)
        if (data.dailySummary) setDailySummary(data.dailySummary)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Save data to Firestore
  const saveData = useCallback(async (dataToSave) => {
    if (!user) return
    try {
      const token = await user.getIdToken()
      await apiRequest('/api/billing', {
        method: 'POST',
        body: JSON.stringify(dataToSave)
      }, token)
    } catch (error) {
      console.error('Error saving billing data:', error)
      // Save to localStorage as fallback
      localStorage.setItem('pja3d_billing', JSON.stringify(dataToSave))
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-save when data changes
  useEffect(() => {
    if (!loading) {
      const dataToSave = { billingItems, expenses, stockItems, dailySummary }
      saveData(dataToSave)
      localStorage.setItem('pja3d_billing', JSON.stringify(dataToSave))
    }
  }, [billingItems, expenses, stockItems, dailySummary, saveData, loading])

  // Calculate discounted price for a billing item
  const calculateDiscountedPrice = (item) => {
    return item.price - item.discountRupees
  }

  // Calculate final price for a billing item
  const calculateFinalPrice = (item) => {
    return calculateDiscountedPrice(item) * item.quantity
  }

  // Calculate billing total
  const billingTotal = useMemo(() => {
    return billingItems.reduce((sum, item) => sum + calculateFinalPrice(item), 0)
  }, [billingItems])

  // Update billing item
  const updateBillingItem = (index, field, value) => {
    setBillingItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      
      // Recalculate based on which field changed
      const item = updated[index]
      if (field === 'baseDiscount' || field === 'extraDiscount') {
        const totalDiscountPercent = (parseFloat(item.baseDiscount) || 0) + (parseFloat(item.extraDiscount) || 0)
        item.discountRupees = (item.price * totalDiscountPercent) / 100
      } else if (field === 'discountRupees') {
        const totalDiscountPercent = item.price > 0 ? (item.discountRupees / item.price) * 100 : 0
        item.baseDiscount = totalDiscountPercent - (item.extraDiscount || 0)
      } else if (field === 'price') {
        const totalDiscountPercent = (parseFloat(item.baseDiscount) || 0) + (parseFloat(item.extraDiscount) || 0)
        item.discountRupees = (value * totalDiscountPercent) / 100
      }
      
      return updated
    })
  }

  // Add new billing row
  const addBillingRow = () => {
    setBillingItems(prev => [...prev, { name: '', price: 0, discountRupees: 0, baseDiscount: 0, extraDiscount: 0, quantity: 0 }])
  }

  // Delete billing row (only custom rows)
  const deleteBillingRow = (index) => {
    if (index < 7) {
      toast.error('Cannot delete default items')
      return
    }
    setBillingItems(prev => prev.filter((_, i) => i !== index))
  }

  // Generate bill text for printing/copying
  const generateBillText = () => {
    const itemsWithQty = billingItems.filter(item => item.quantity > 0)
    if (itemsWithQty.length === 0) {
      toast.error('No items in bill')
      return null
    }
    
    let text = `** PJA3D STUDIO - BILL / INVOICE **\n`
    text += `Date: ${billDate} | Time: ${billTime}\n`
    text += `Customer: ${customerName || 'Walk-in Customer'}\n\n`
    text += `--------------------------------\n`
    
    itemsWithQty.forEach(item => {
      const finalPrice = calculateFinalPrice(item)
      text += `${item.name} (Qty: ${item.quantity}) - ₹${finalPrice.toFixed(2)}\n`
    })
    
    text += `--------------------------------\n`
    text += `TOTAL: ₹${billingTotal.toFixed(2)}\n\n`
    text += `Thank you!\nContact: 6372362313 | UPI: pushkarjay2@ybl`
    
    return text
  }

  // Copy bill to clipboard
  const copyBill = () => {
    const text = generateBillText()
    if (!text) return
    
    navigator.clipboard.writeText(text)
    toast.success('Bill copied to clipboard!')
  }

  // Print bill
  const printBill = () => {
    const itemsWithQty = billingItems.filter(item => item.quantity > 0)
    if (itemsWithQty.length === 0) {
      toast.error('No items in bill')
      return
    }
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>PJA3D Bill</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
            h1 { text-align: center; color: #2E7D32; margin-bottom: 5px; }
            .header { text-align: center; border-bottom: 2px solid #2E7D32; padding-bottom: 10px; margin-bottom: 15px; }
            .bill-type { color: #FF9800; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
            .total { font-weight: bold; font-size: 1.2em; }
            .footer { text-align: center; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PJA3D STUDIO</h1>
            <div class="bill-type">Bill / Invoice</div>
            <p>Date: ${billDate} | Time: ${billTime}</p>
            <p><strong>Customer:</strong> ${customerName || 'Walk-in Customer'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Disc</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsWithQty.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>₹${item.price.toFixed(2)}</td>
                  <td>₹${item.discountRupees.toFixed(2)}</td>
                  <td>${item.quantity}</td>
                  <td>₹${calculateFinalPrice(item).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align: right;" class="total">Total</td>
                <td class="total">₹${billingTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>Contact: 6372362313 | UPI: pushkarjay2@ybl</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  // Save bill to expenses
  const saveBillToExpenses = () => {
    if (billingTotal <= 0) {
      toast.error('Cannot save empty bill')
      return
    }
    
    const totalQuantity = billingItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    
    // Update paper stock
    const updatedStock = [...stockItems]
    billingItems.forEach((item, index) => {
      if (item.quantity > 0) {
        if (index <= 3) {
          // Plain paper (rows 1-4)
          updatedStock[0].sold += item.quantity
          updatedStock[0].earned += calculateFinalPrice(item)
        } else if (index === 4) {
          // Sticker
          updatedStock[1].sold += item.quantity
          updatedStock[1].earned += calculateFinalPrice(item)
        } else if (index === 5) {
          // Photo
          updatedStock[2].sold += item.quantity
          updatedStock[2].earned += calculateFinalPrice(item)
        } else if (index === 6) {
          // Stick File
          updatedStock[3].sold += item.quantity
          updatedStock[3].earned += calculateFinalPrice(item)
        }
      }
    })
    setStockItems(updatedStock)
    
    // Add expense entry
    const newExpense = {
      id: Date.now().toString(),
      date: `${billDate}T${billTime}`,
      description: customerName ? `Sale to ${customerName}` : 'Walk-in Sale',
      category: 'Sale',
      amount: billingTotal,
      type: 'Earned',
      quantity: totalQuantity
    }
    setExpenses(prev => [...prev, newExpense])
    
    // Reset bill
    setBillingItems(billingItems.map(item => ({ ...item, quantity: 0 })))
    setCustomerName('')
    setBillDate(new Date().toISOString().split('T')[0])
    setBillTime(new Date().toTimeString().slice(0, 5))
    
    toast.success('Bill saved to expenses!')
    setActiveTab('expense')
  }

  // Add expense entry
  const addExpenseEntry = (e) => {
    e.preventDefault()
    if (!expenseForm.description || !expenseForm.amount) {
      toast.error('Please fill all required fields')
      return
    }
    
    const newExpense = {
      id: Date.now().toString(),
      date: `${expenseForm.date}T${expenseForm.time}`,
      description: expenseForm.description,
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      type: expenseForm.type,
      quantity: 0
    }
    
    setExpenses(prev => [...prev, newExpense])
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      description: '',
      category: 'Sale',
      amount: '',
      type: 'Earned'
    })
    toast.success('Expense added!')
  }

  // Delete expense
  const deleteExpense = (id) => {
    if (!confirm('Delete this expense entry?')) return
    setExpenses(prev => prev.filter(e => e.id !== id))
    toast.success('Expense deleted')
  }

  // Calculate summaries
  const summary = useMemo(() => {
    const totalEarned = expenses
      .filter(e => e.category === 'Sale' && (e.type === 'Earned' || e.type === 'Paid'))
      .reduce((sum, e) => sum + e.amount, 0)
    
    const totalInvested = expenses
      .filter(e => (e.category === 'Investment' || e.category === 'Expense') && e.type === 'Paid')
      .reduce((sum, e) => sum + e.amount, 0)
    
    const totalDue = expenses
      .filter(e => e.type === 'Due')
      .reduce((sum, e) => sum + e.amount, 0)
    
    const netProfit = totalEarned - totalInvested
    const profitPercent = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0
    
    return { totalEarned, totalInvested, totalDue, netProfit, profitPercent }
  }, [expenses])

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses]
    
    if (searchQuery) {
      result = result.filter(e => e.description.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    
    if (filterCategory) {
      result = result.filter(e => e.category === filterCategory)
    }
    
    result.sort((a, b) => {
      let aVal, bVal
      switch (sortConfig.key) {
        case 'date':
          aVal = new Date(a.date).getTime()
          bVal = new Date(b.date).getTime()
          break
        case 'amount':
          aVal = a.amount
          bVal = b.amount
          break
        default:
          aVal = a[sortConfig.key]
          bVal = b[sortConfig.key]
      }
      return sortConfig.direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })
    
    return result
  }, [expenses, searchQuery, filterCategory, sortConfig])

  // Update stock item
  const updateStockItem = (index, field, value) => {
    setStockItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 }
      return updated
    })
  }

  // Export to Excel (CSV)
  const exportToExcel = () => {
    const headers = ['Date', 'Time', 'Description', 'Category', 'Amount', 'Type']
    const rows = expenses.map(e => {
      const d = new Date(e.date)
      return [
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        e.description,
        e.category,
        e.amount.toFixed(2),
        e.type
      ]
    })
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `PJA3D-Expenses-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported to CSV!')
  }

  // Reset all data
  const resetAllData = () => {
    if (!confirm('Reset ALL billing data? This cannot be undone!')) return
    if (!confirm('Are you ABSOLUTELY sure?')) return
    
    setBillingItems([...DEFAULT_BILLING_ITEMS])
    setExpenses([])
    setStockItems([...DEFAULT_STOCK_ITEMS])
    setDailySummary([])
    localStorage.removeItem('pja3d_billing')
    toast.success('All data reset!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-slate-600">Loading billing data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'billing' 
                ? 'bg-primary-500 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Billing / Invoice
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'expense' 
                ? 'bg-primary-500 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Expense Tracker
          </button>
        </div>
        <button
          onClick={() => setShowFAQ(true)}
          className="btn btn-ghost btn-sm"
        >
          <HelpCircle className="w-4 h-4 mr-1" /> FAQ
        </button>
      </div>

      {/* BILLING TAB */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Optional"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Bill Date</label>
                <input
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Bill Time</label>
                <input
                  type="time"
                  value={billTime}
                  onChange={(e) => setBillTime(e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Billing Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-left">Price (₹)</th>
                    <th className="p-3 text-left">Disc (₹)</th>
                    <th className="p-3 text-left">Base %</th>
                    <th className="p-3 text-left">Extra %</th>
                    <th className="p-3 text-left">Qty</th>
                    <th className="p-3 text-left">Rate (₹)</th>
                    <th className="p-3 text-left">Final (₹)</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billingItems.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-3 text-slate-500">{index + 1}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateBillingItem(index, 'name', e.target.value)}
                          className="input input-sm w-full min-w-[150px]"
                          placeholder="Product name"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateBillingItem(index, 'price', parseFloat(e.target.value) || 0)}
                          className="input input-sm w-20"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.discountRupees.toFixed(2)}
                          onChange={(e) => updateBillingItem(index, 'discountRupees', parseFloat(e.target.value) || 0)}
                          className="input input-sm w-20"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.baseDiscount.toFixed(2)}
                          onChange={(e) => updateBillingItem(index, 'baseDiscount', parseFloat(e.target.value) || 0)}
                          className="input input-sm w-20"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.extraDiscount}
                          onChange={(e) => updateBillingItem(index, 'extraDiscount', parseFloat(e.target.value) || 0)}
                          className="input input-sm w-20"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateBillingItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="input input-sm w-16"
                          min="0"
                        />
                      </td>
                      <td className="p-3 font-medium">
                        ₹{calculateDiscountedPrice(item).toFixed(2)}
                      </td>
                      <td className="p-3 font-semibold text-primary-600">
                        ₹{calculateFinalPrice(item).toFixed(2)}
                      </td>
                      <td className="p-3">
                        {index >= 7 && (
                          <button
                            onClick={() => deleteBillingRow(index)}
                            className="p-1 hover:bg-red-50 hover:text-red-500 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100">
                  <tr>
                    <td colSpan={8} className="p-3 text-right font-semibold">Total:</td>
                    <td className="p-3 font-bold text-lg text-primary-600">₹{billingTotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Billing Actions */}
            <div className="p-4 bg-slate-50 border-t flex flex-wrap gap-3">
              <button onClick={addBillingRow} className="btn btn-outline btn-sm">
                <Plus className="w-4 h-4 mr-1" /> Add Row
              </button>
              <button onClick={printBill} className="btn btn-primary btn-sm">
                <FileText className="w-4 h-4 mr-1" /> Generate Bill
              </button>
              <button onClick={copyBill} className="btn btn-outline btn-sm">
                <Copy className="w-4 h-4 mr-1" /> Copy Bill
              </button>
              <button onClick={saveBillToExpenses} className="btn btn-secondary btn-sm">
                <Save className="w-4 h-4 mr-1" /> Save to Expenses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSE TAB */}
      {activeTab === 'expense' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Summary */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Earned:</span>
                  <span className="font-medium text-green-600">₹{summary.totalEarned.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Invested:</span>
                  <span className="font-medium text-red-600">₹{summary.totalInvested.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Due:</span>
                  <span className="font-medium text-amber-600">₹{summary.totalDue.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Net Profit:</span>
                  <div className="text-right">
                    <span className={`font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{summary.netProfit.toFixed(2)}
                    </span>
                    <span className={`text-sm ml-1 ${summary.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ({summary.profitPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <button onClick={exportToExcel} className="btn btn-outline btn-sm w-full">
                  <Download className="w-4 h-4 mr-1" /> Export to CSV
                </button>
                <button onClick={resetAllData} className="btn btn-ghost btn-sm w-full text-red-500">
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset All Data
                </button>
              </div>
            </div>

            {/* Stock Table */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Paper Stock</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Inv</th>
                      <th className="p-2 text-left">Earn</th>
                      <th className="p-2 text-left">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{item.type || '-'}</td>
                        <td className="p-2">₹{item.invested.toFixed(0)}</td>
                        <td className="p-2">₹{item.earned.toFixed(0)}</td>
                        <td className="p-2">{item.bought - item.sold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Center - Add Entry & Table */}
          <div className="lg:col-span-3 space-y-6">
            {/* Add Entry Form */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Entry</h3>
              <form onSubmit={addExpenseEntry} className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm(f => ({ ...f, date: e.target.value }))}
                  className="input input-sm"
                  required
                />
                <input
                  type="time"
                  value={expenseForm.time}
                  onChange={(e) => setExpenseForm(f => ({ ...f, time: e.target.value }))}
                  className="input input-sm"
                  required
                />
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description"
                  className="input input-sm col-span-2"
                  required
                />
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm(f => ({ ...f, category: e.target.value }))}
                  className="select select-sm"
                >
                  <option value="Sale">Sale</option>
                  <option value="Investment">Investment</option>
                  <option value="Expense">Expense</option>
                </select>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="Amount"
                  className="input input-sm"
                  min="0"
                  step="0.01"
                  required
                />
                <select
                  value={expenseForm.type}
                  onChange={(e) => setExpenseForm(f => ({ ...f, type: e.target.value }))}
                  className="select select-sm"
                >
                  <option value="Paid">Paid</option>
                  <option value="Earned">Earned</option>
                  <option value="Due">Due</option>
                </select>
                <button type="submit" className="btn btn-primary btn-sm">Add Entry</button>
              </form>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="input input-sm w-full pl-9"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="select select-sm"
              >
                <option value="">All Categories</option>
                <option value="Sale">Sale</option>
                <option value="Investment">Investment</option>
                <option value="Expense">Expense</option>
              </select>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b sticky top-0">
                    <tr>
                      <th
                        className="p-3 text-left cursor-pointer hover:bg-slate-100"
                        onClick={() => setSortConfig(s => ({ key: 'date', direction: s.key === 'date' && s.direction === 'desc' ? 'asc' : 'desc' }))}
                      >
                        Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />)}
                      </th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-left">Category</th>
                      <th
                        className="p-3 text-left cursor-pointer hover:bg-slate-100"
                        onClick={() => setSortConfig(s => ({ key: 'amount', direction: s.key === 'amount' && s.direction === 'desc' ? 'asc' : 'desc' }))}
                      >
                        Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />)}
                      </th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No entries found
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((expense) => {
                        const d = new Date(expense.date)
                        return (
                          <tr key={expense.id} className="border-b hover:bg-slate-50">
                            <td className="p-3 text-slate-600">
                              {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3">{expense.description}</td>
                            <td className="p-3">
                              <span className={`badge badge-sm ${
                                expense.category === 'Sale' ? 'badge-success' :
                                expense.category === 'Investment' ? 'badge-info' : 'badge-warning'
                              }`}>
                                {expense.category}
                              </span>
                            </td>
                            <td className="p-3 font-medium">₹{expense.amount.toFixed(2)}</td>
                            <td className="p-3">
                              <span className={`badge badge-sm ${
                                expense.type === 'Earned' ? 'badge-success' :
                                expense.type === 'Paid' ? 'badge-error' : 'badge-warning'
                              }`}>
                                {expense.type}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => deleteExpense(expense.id)}
                                className="p-1 hover:bg-red-50 hover:text-red-500 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Billing System FAQ</h2>
                <button onClick={() => setShowFAQ(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-primary-600 mb-2">How to Use:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Enter customer name (optional)</li>
                    <li>Set prices, discounts, and quantities in the table</li>
                    <li>Click "Generate Bill" to print</li>
                    <li>Click "Copy Bill" to copy text to clipboard</li>
                    <li>Click "Save to Expenses" to log the sale</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-semibold text-primary-600 mb-2">Expense Tracker:</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Track sales, investments, and expenses</li>
                    <li>Monitor paper stock automatically</li>
                    <li>Export to CSV for Excel</li>
                  </ul>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-primary-600 mb-2">Developer:</h3>
                  <p className="text-slate-600">Pushkarjay Ajay</p>
                  <p className="text-slate-500">pushkarjay.ajay1@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
