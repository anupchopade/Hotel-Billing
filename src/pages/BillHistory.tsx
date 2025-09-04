import { useState } from 'react';
import { useBills } from '../hooks/useBills';
import { History, Search, Calendar, FileText, Eye, Download } from 'lucide-react';
import { Bill } from '../types';

export default function BillHistory() {
  const { bills } = useBills();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || bill.createdAt.startsWith(dateFilter);
    
    return matchesSearch && matchesDate;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;

  const exportToCSV = (fromDate?: string, toDate?: string) => {
    let billsToExport = bills;
    
    // Apply date range filter if provided
    if (fromDate || toDate) {
      billsToExport = bills.filter(bill => {
        const billDate = new Date(bill.createdAt);
        const billDateOnly = new Date(billDate.getFullYear(), billDate.getMonth(), billDate.getDate());
        
        let fromMatch = true;
        let toMatch = true;
        
        if (fromDate) {
          const fromDateOnly = new Date(fromDate);
          fromMatch = billDateOnly >= fromDateOnly;
        }
        
        if (toDate) {
          const toDateOnly = new Date(toDate);
          toMatch = billDateOnly <= toDateOnly;
        }
        
        return fromMatch && toMatch;
      });
      
      console.log('Filtered bills for export:', billsToExport.length);
      if (billsToExport.length === 0) {
        alert('No bills found in the selected date range.');
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
    const dateRange = fromDate && toDate ? `${fromDate}_to_${toDate}` : new Date().toISOString().split('T')[0];
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
      <div className="space-y-6">
        <button
          onClick={() => setSelectedBill(null)}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          ← Back to History
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Bill #{selectedBill.billNumber}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Bill Details</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Customer:</strong> {selectedBill.customerName}</div>
                <div><strong>Table:</strong> {selectedBill.tableNumber}</div>
                <div><strong>Date:</strong> {new Date(selectedBill.createdAt).toLocaleString('en-IN')}</div>
                <div><strong>Cashier:</strong> {selectedBill.createdBy}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Items Ordered</h3>
              <div className="space-y-2">
                {selectedBill.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} ({item.type})</span>
                    <span>{item.quantity} x ₹{item.price} = ₹{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>Total Amount:</span>
              <span>₹{selectedBill.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <History className="h-6 w-6 mr-3" />
            Bill History
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => exportToCSV()}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Current
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Custom Range
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by bill number, customer, or table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        {filteredBills.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No bills found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedBill(bill)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="font-bold text-gray-900 dark:text-white">#{bill.billNumber}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {bill.customerName} - Table {bill.tableNumber}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{new Date(bill.createdAt).toLocaleString('en-IN')}</span>
                    <span>by {bill.createdBy}</span>
                    <span>{bill.items.length} items</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900 dark:text-white">₹{bill.total.toFixed(2)}</div>
                  <Eye className="h-4 w-4 text-gray-400 ml-auto mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Date Range Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Export Bills - Custom Date Range
            </h3>
            
            <div className="space-y-4">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportFromDate('');
                  setExportToDate('');
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomExport}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}