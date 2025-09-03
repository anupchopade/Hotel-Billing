import React from 'react';
import { BillItem } from '../types';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface BillItemCardProps {
  item: BillItem;
  onQuantityChange: (itemId: string, quantity: number) => void;
}

export default function BillItemCard({ item, onQuantityChange }: BillItemCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {item.type === 'full' ? 'Full Plate' : 'Half Plate'} - ₹{item.price}
        </p>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            className="p-2 rounded-full bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 transition-colors"
          >
            {item.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </button>
          
          <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
            {item.quantity}
          </span>
          
          <button
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-right">
          <p className="font-bold text-gray-900 dark:text-white">₹{item.total}</p>
        </div>
      </div>
    </div>
  );
}