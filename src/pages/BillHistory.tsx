import { useState, useEffect } from 'react';
import { useBills } from '../hooks/useBills';
import { History, Search, Calendar, FileText, Eye, Download, Printer, X } from 'lucide-react';
import { Bill } from '../types';

export default function BillHistory() {
  const { bills } = useBills();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [billToPrint, setBillToPrint] = useState<Bill | null>(null);

  // Handle escape key to go back from bill detail view
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBill) {
        setSelectedBill(null);
      }
    };

    if (selectedBill) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedBill]);

  const handlePrintBill = (bill: Bill) => {
    setBillToPrint(bill);
    // Small delay to ensure the print modal is rendered
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || bill.createdAt.startsWith(dateFilter);
    
    return matchesSearch && matchesDate;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;

  const exportToCSV = (fromDate?: string, toDate?: string, useLast15Days = false) => {
    let billsToExport = bills;
    
    // Apply date range filter if provided
    if (fromDate || toDate || useLast15Days) {
      billsToExport = bills.filter(bill => {
        const billDate = new Date(bill.createdAt);
        const billDateOnly = new Date(billDate.getFullYear(), billDate.getMonth(), billDate.getDate());
        
        let fromMatch = true;
        let toMatch = true;
        
        if (useLast15Days) {
          // Get date 15 days ago
          const fifteenDaysAgo = new Date();
          fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
          const fifteenDaysAgoOnly = new Date(fifteenDaysAgo.getFullYear(), fifteenDaysAgo.getMonth(), fifteenDaysAgo.getDate());
          
          fromMatch = billDateOnly >= fifteenDaysAgoOnly;
          toMatch = billDateOnly <= new Date(); // Today
        } else {
          if (fromDate) {
            const fromDateOnly = new Date(fromDate);
            fromMatch = billDateOnly >= fromDateOnly;
          }
          
          if (toDate) {
            const toDateOnly = new Date(toDate);
            toMatch = billDateOnly <= toDateOnly;
          }
        }
        
        return fromMatch && toMatch;
      });
      
      console.log('Filtered bills for export:', billsToExport.length);
      if (billsToExport.length === 0) {
        const message = useLast15Days ? 'No bills found in the last 15 days.' : 'No bills found in the selected date range.';
        alert(message);
        return;
      }
    } else {
      // Use current filtered bills if no date range specified
      billsToExport = filteredBills;
    }

    const headers = ['Bill No', 'Date', 'Customer', 'Table', 'Items', 'Total', 'Cashier'];
    const csvData = billsToExport.map(bill => {
      const itemsCell = bill.items
        .map(it => `${it.name} (${it.type}) x${it.quantity} @₹${it.price} = ₹${it.total}`)
        .join(' | ');
      return [
        bill.billNumber,
        new Date(bill.createdAt).toLocaleString('en-IN'),
        bill.customerName,
        bill.tableNumber,
        itemsCell,
        bill.total.toFixed(2),
        bill.createdBy
      ].map(v => typeof v === 'string' ? escapeCsv(v) : v);
    });

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    let dateRange;
    if (useLast15Days) {
      const today = new Date().toISOString().split('T')[0];
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      const fifteenDaysAgoStr = fifteenDaysAgo.toISOString().split('T')[0];
      dateRange = `last15days_${fifteenDaysAgoStr}_to_${today}`;
    } else if (fromDate && toDate) {
      dateRange = `${fromDate}_to_${toDate}`;
    } else {
      dateRange = new Date().toISOString().split('T')[0];
    }
    
    a.href = url;
    a.download = `bills-export-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCustomExport = () => {
    if (!exportFromDate || !exportToDate) {
      alert('Please select both from and to dates');
      return;
    }
    if (new Date(exportFromDate) > new Date(exportToDate)) {
      alert('From date cannot be later than to date');
      return;
    }
    
    // Debug information
    console.log('Exporting bills from', exportFromDate, 'to', exportToDate);
    console.log('Total bills available:', bills.length);
    
    exportToCSV(exportFromDate, exportToDate);
    setShowExportModal(false);
    setExportFromDate('');
    setExportToDate('');
  };

  if (selectedBill) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <button
          onClick={() => setSelectedBill(null)}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm sm:text-base mb-2"
        >
          ← Back to History
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Bill #{selectedBill.billNumber}
            </h2>
            <button
              onClick={() => setSelectedBill(null)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Close (Esc)"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">Bill Details</h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Customer:</span>
                  <span className="text-gray-900 dark:text-white">{selectedBill.customerName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Table:</span>
                  <span className="text-gray-900 dark:text-white">{selectedBill.tableNumber}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="text-gray-900 dark:text-white">{new Date(selectedBill.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Cashier:</span>
                  <span className="text-gray-900 dark:text-white">{selectedBill.createdBy}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">Items Ordered</h3>
              <div className="space-y-2">
                {selectedBill.items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white">{item.name} ({item.type})</span>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{item.quantity} x ₹{item.price} = ₹{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              <span>Total Amount:</span>
              <span>₹{selectedBill.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <History className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="truncate">Bill History</span>
          </h1>
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
            <button
              onClick={() => exportToCSV(undefined, undefined, true)}
              className="flex items-center justify-center px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all text-sm"
            >
              <Download className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Export Last 15 Days</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center justify-center px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all text-sm"
            >
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Custom Range</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bills, customers, tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-auto pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        {filteredBills.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-base sm:text-lg">No bills found</p>
            <p className="text-xs sm:text-sm">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBills.map((bill) => (
              <div
                key={bill.id}
                className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedBill(bill)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">#{bill.billNumber}</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {bill.customerName} - Table {bill.tableNumber}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="truncate">{new Date(bill.createdAt).toLocaleString('en-IN')}</span>
                      <span>by {bill.createdBy}</span>
                      <span>{bill.items.length} items</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                    <div className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">₹{bill.total.toFixed(2)}</div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintBill(bill);
                        }}
                        className="p-4 rounded-xl bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors"
                        title="Print Bill"
                      >
                        <Printer className="h-6 w-6" />
                      </button>
                      <Eye className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Date Range Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Export Bills - Custom Date Range
            </h3>
            
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={exportFromDate}
                  onChange={(e) => setExportFromDate(e.target.value)}
                  min="2019-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={exportToDate}
                  onChange={(e) => setExportToDate(e.target.value)}
                  min="2019-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportFromDate('');
                  setExportToDate('');
                }}
                className="flex-1 px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomExport}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all text-sm"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal - Hidden but rendered for printing */}
      {billToPrint && (
        <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-50">
          <div className="p-8">
            <div id="bill-content" className="max-w-sm mx-auto bg-white text-black font-mono text-xs leading-tight">
              {/* Header */}
              <div className="text-center border-b-2 border-dashed border-gray-400 pb-3 mb-3">
                <h1 className="text-lg font-bold">HOTEL ANUPRABHA</h1>
                <p>Nagpur Road</p>
                <p>Pusad - 445216</p>
                <p>Phone: 1234567890</p>
                <p>Email: acxml03@gmail.com</p>
                <p>GSTIN: 22AAAAA0000A1Z5</p>
              </div>

              {/* Bill Info */}
              <div className="mb-3">
                <div className="flex justify-between">
                  <span>Bill No:</span>
                  <span className="font-bold">{billToPrint.billNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(billToPrint.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{billToPrint.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span>{billToPrint.tableNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{billToPrint.createdBy}</span>
                </div>
              </div>

              <div className="border-b border-gray-400 mb-2"></div>

              {/* Items */}
              <div className="mb-3">
                <div className="flex justify-between font-bold mb-1">
                  <span>Item</span>
                  <span>Qty Rate Total</span>
                </div>
                {billToPrint.items.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between">
                      <span className="flex-1">{item.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>({item.type === 'full' ? 'F' : 'H'})</span>
                      <span>{item.quantity} x ₹{item.price} = ₹{item.total}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-b border-gray-400 mb-2"></div>

              {/* Totals */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{billToPrint.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>₹{billToPrint.gstAmount.toFixed(2)}</span>
                </div>
                {billToPrint.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-₹{billToPrint.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-400 pt-1">
                  <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL:</span>
                    <span>₹{billToPrint.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border-b-2 border-dashed border-gray-400 my-3"></div>

              {/* Footer */}
              <div className="text-center">
                <p className="mb-2">Thank you for dining with us!</p>
                <p className="text-xs">Visit us again soon</p>
                <div className="mt-2 flex items-center justify-center">
                  <span className="text-xs">Verify: {billToPrint.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}