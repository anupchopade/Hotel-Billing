import React from 'react';
import { Calculator, Percent } from 'lucide-react';

interface BillSummaryProps {
  subtotal: number;
  gstAmount: number;
  discount: number;
  total: number;
  onDiscountChange: (discount: number) => void;
}

export default function BillSummary({ 
  subtotal, 
  gstAmount, 
  discount, 
  total, 
  onDiscountChange 
}: BillSummaryProps) {
  // Ensure all values are numbers
  const safeSubtotal = Number(subtotal) || 0;
  const safeGstAmount = Number(gstAmount) || 0;
  const safeDiscount = Number(discount) || 0;
  const safeTotal = Number(total) || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <Calculator className="h-5 w-5 mr-2" />
        Bill Summary
      </h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
          <span>Subtotal:</span>
          <span className="font-medium">₹{safeSubtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
          <span>GST (18%):</span>
          <span className="font-medium">₹{safeGstAmount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Discount:</span>
          <div className="flex items-center space-x-2">
            <Percent className="h-4 w-4 text-gray-400" />
            <input
              type="number"
              value={safeDiscount}
              onChange={(e) => onDiscountChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center dark:bg-gray-700 dark:text-white"
              placeholder="0"
              min="0"
              max={safeSubtotal + safeGstAmount}
              step="0.01"
            />
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
            <span>Total:</span>
            <span>₹{safeTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}