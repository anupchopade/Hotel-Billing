import React from 'react';
import { Bill } from '../types';
import { Printer, FileText, ArrowLeft, QrCode } from 'lucide-react';

interface PrintBillProps {
  bill: Bill;
  onNewBill: () => void;
  onGoBack: () => void;
}

export default function PrintBill({ bill, onNewBill, onGoBack }: PrintBillProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg no-print">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onGoBack}
            className="flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Edit
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Bill
          </button>
          
          <button
            onClick={onNewBill}
            className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all"
          >
            <FileText className="h-5 w-5 mr-2" />
            New Bill
          </button>
        </div>
      </div>

      {/* Print Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div id="bill-content" className="max-w-sm mx-auto bg-white text-black font-mono text-xs leading-tight">
            {/* Header */}
            <div className="text-center border-b-2 border-dashed border-gray-400 pb-3 mb-3">
              <h1 className="text-lg font-bold">HOTEL RESTAURANT</h1>
              <p>Your Hotel Name Here</p>
              <p>Address Line 1</p>
              <p>Address Line 2, City - 123456</p>
              <p>Phone: +91 98765 43210</p>
              <p>Email: info@yourhotel.com</p>
              <p>GSTIN: 22AAAAA0000A1Z5</p>
            </div>

            {/* Bill Info */}
            <div className="mb-3">
              <div className="flex justify-between">
                <span>Bill No:</span>
                <span className="font-bold">{bill.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(bill.createdAt).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{bill.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Table:</span>
                <span>{bill.tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{bill.createdBy}</span>
              </div>
            </div>

            <div className="border-b border-gray-400 mb-2"></div>

            {/* Items */}
            <div className="mb-3">
              <div className="flex justify-between font-bold mb-1">
                <span>Item</span>
                <span>Qty Rate Total</span>
              </div>
              {bill.items.map((item, index) => (
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
                <span>₹{bill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>₹{bill.gstAmount.toFixed(2)}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-₹{bill.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-400 pt-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL:</span>
                  <span>₹{bill.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-b-2 border-dashed border-gray-400 my-3"></div>

            {/* Footer */}
            <div className="text-center">
              <p className="mb-2">Thank you for dining with us!</p>
              <p className="text-xs">Visit us again soon</p>
              <div className="mt-2 flex items-center justify-center">
                <QrCode className="h-6 w-6 mr-1" />
                <span className="text-xs">Verify: {bill.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}