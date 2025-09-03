import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBills } from '../hooks/useBills';
import { useMenuItems } from '../hooks/useMenuItems';
import { BillItem } from '../types';
import BillItemCard from '../components/BillItemCard';
import MenuItemSelector from '../components/MenuItemSelector';
import BillSummary from '../components/BillSummary';
import PrintBill from '../components/PrintBill';
import { ShoppingCart, Printer, Save, FileText, CheckCircle2 } from 'lucide-react';

export default function CreateBill() {
  const { user } = useAuth();
  const { addBill } = useBills();
  const { menuItems } = useMenuItems();
  const navigate = useNavigate();
  
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showPrint, setShowPrint] = useState(false);
  const [currentBill, setCurrentBill] = useState<any>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const showToast = (message: string) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'mb-2 px-4 py-3 rounded-lg bg-green-600 text-white shadow-lg animate-fade-in';
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('opacity-0');
      setTimeout(() => el.remove(), 300);
    }, 1200);
  };

  const addItem = (menuItemId: string, type: 'full' | 'half') => {
    const menuItem = menuItems.find(item => item.id === menuItemId);
    if (!menuItem) return;

    const price = type === 'full' ? menuItem.fullPlatePrice : menuItem.halfPlatePrice;
    const existingItemIndex = billItems.findIndex(
      item => item.menuItemId === menuItemId && item.type === type
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...billItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * price;
      setBillItems(updatedItems);
    } else {
      const newItem: BillItem = {
        id: Date.now().toString(),
        menuItemId,
        name: menuItem.name,
        type,
        price,
        quantity: 1,
        total: price
      };
      setBillItems([...billItems, newItem]);
    }

    setLastAdded(`${menuItem.name} (${type === 'full' ? 'Full' : 'Half'})`);
    showToast(`Added ${menuItem.name} - ${type === 'full' ? 'Full' : 'Half'}`);
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setBillItems(billItems.filter(item => item.id !== itemId));
      return;
    }

    const updatedItems = billItems.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity, total: item.price * quantity };
      }
      return item;
    });
    setBillItems(updatedItems);
  };

  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const gstAmount = subtotal * 0.18; // 18% GST
  const total = subtotal + gstAmount - discount;

  const handleSaveBill = () => {
    if (!customerName.trim() || !tableNumber.trim() || billItems.length === 0) {
      alert('Please fill all required fields and add at least one item');
      return;
    }

    const bill = addBill({
      customerName,
      tableNumber,
      items: billItems,
      discount,
      createdBy: user!.name
    });

    setCurrentBill(bill);
    setShowPrint(true);
  };

  const handleNewBill = () => {
    setCustomerName('');
    setTableNumber('');
    setBillItems([]);
    setDiscount(0);
    setShowPrint(false);
    setCurrentBill(null);
    setLastAdded(null);
  };

  if (showPrint && currentBill) {
    return (
      <PrintBill 
        bill={currentBill} 
        onNewBill={handleNewBill}
        onGoBack={() => setShowPrint(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <FileText className="h-6 w-6 mr-3" />
          Create New Bill
        </h1>

        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Table Number *
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter table number"
            />
          </div>
          <div className="flex items-end">
            <div className="w-full rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-800 dark:text-green-300">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {lastAdded ? (
                  <span>Last added: <span className="font-medium">{lastAdded}</span></span>
                ) : (
                  <span>Add items from the left panel</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout: Menu on left, Cart on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MenuItemSelector onItemSelect={addItem} />
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart ({billItems.length})
            </h2>

            {billItems.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">No items yet. Add from the left.</div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                {billItems.map((item) => (
                  <BillItemCard
                    key={item.id}
                    item={item}
                    onQuantityChange={updateItemQuantity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bill Summary */}
          {billItems.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <BillSummary
                subtotal={subtotal}
                gstAmount={gstAmount}
                discount={discount}
                total={total}
                onDiscountChange={setDiscount}
              />

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={handleSaveBill}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Bill
                </button>
                <button
                  onClick={() => setShowPrint(true)}
                  disabled={!customerName || !tableNumber || billItems.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  Print & Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}