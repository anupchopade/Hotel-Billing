import { useState, useEffect } from 'react';
import { useBills } from '../hooks/useBills';
import { useMenuItems } from '../hooks/useMenuItems';
import { BillItem } from '../types';
import BillItemCard from '../components/BillItemCard';
import MenuItemSelector from '../components/MenuItemSelector';
import BillSummary from '../components/BillSummary';
import PrintBill from '../components/PrintBill';
import { ShoppingCart, Printer, Save, FileText, CheckCircle2, X, Trash2, Plus, Minus } from 'lucide-react';

export default function CreateBill() {
  const { addBill } = useBills();
  const { menuItems } = useMenuItems();
  
  const [customerName, setCustomerName] = useState('Shree');
  const [tableNumber, setTableNumber] = useState('1');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showPrint, setShowPrint] = useState(false);
  const [currentBill, setCurrentBill] = useState<any>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [showCartModal, setShowCartModal] = useState(false);

  // Handle escape key and click outside to close cart modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCartModal) {
        setShowCartModal(false);
      }
    };

    if (showCartModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showCartModal]);

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

    const price = Number(type === 'full' ? menuItem.fullPrice : menuItem.halfPrice) || 0;
    const existingItemIndex = billItems.findIndex(
      item => item.menuItemId === menuItemId && item.type === type
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...billItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total = Number(updatedItems[existingItemIndex].quantity * price);
      setBillItems(updatedItems);
    } else {
      const newItem: BillItem = {
        id: Date.now().toString(),
        menuItemId,
        name: menuItem.name,
        type,
        price: Number(price),
        quantity: 1,
        total: Number(price)
      };
      setBillItems([...billItems, newItem]);
    }

    setLastAdded(`${menuItem.name} (${type === 'full' ? 'Full' : 'Half'})`);
    showToast(`Added ${menuItem.name} - ${type === 'full' ? 'Full' : 'Half'}`);
  };

  const updateItemQuantity = (menuItemId: string, type: 'full' | 'half', quantity: number) => {
    const safeQuantity = Number(quantity) || 0;
    
    if (safeQuantity <= 0) {
      removeItem(menuItemId, type);
      return;
    }

    const updatedItems = billItems.map(item => {
      if (item.menuItemId === menuItemId && item.type === type) {
        return { ...item, quantity: safeQuantity, total: Number(item.price) * safeQuantity };
      }
      return item;
    });
    setBillItems(updatedItems);
  };

  const removeItem = (menuItemId: string, type: 'full' | 'half') => {
    setBillItems(billItems.filter(item => !(item.menuItemId === menuItemId && item.type === type)));
  };

  const subtotal = billItems.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const gstAmount = Number((subtotal * 0.18).toFixed(2)); // 18% GST
  const total = Number(Math.max(0, subtotal + gstAmount - Number(discount || 0)).toFixed(2));

  const handleSaveBill = async () => {
    if (!customerName.trim() || !tableNumber.trim() || billItems.length === 0) {
      alert('Please fill all required fields and add at least one item');
      return;
    }

    const result = await addBill({
      customerName,
      tableNumber,
      items: billItems,
      discount
    });

    if (result.success && result.bill) {
      setCurrentBill(result.bill);
      setShowPrint(true);
    } else {
      alert(result.error || 'Failed to create bill');
    }
  };

  const handleNewBill = () => {
    setCustomerName('Shree');
    setTableNumber('1');
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
    <div className="space-y-3 sm:space-y-4">
      {/* Compact Header for Mobile */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
          Create New Bill
        </h1>

        {/* Compact Customer Details for Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Name"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Table *
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Table"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-end">
            <div className="w-full bg-green-50 dark:bg-green-900/20 rounded-lg p-2 border border-green-200 dark:border-green-800">
              <div className="flex items-center text-xs sm:text-sm text-green-800 dark:text-green-300">
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                {lastAdded ? (
                  <span className="truncate">Last: <span className="font-medium">{lastAdded}</span></span>
                ) : (
                  <span>Select items below</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Summary - Sticky at top */}
      {billItems.length > 0 && (
        <div className="lg:hidden sticky top-2 z-10 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Cart Header - Always Visible */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Cart ({billItems.length})
              </span>
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              ₹{total.toFixed(2)}
            </div>
          </div>
          
          {/* Bigger View/Edit Button */}
          <button
            onClick={() => setShowCartModal(true)}
            className="flex items-center justify-center w-full py-3 px-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors mb-3"
          >
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              👁️ View/Edit Items ({billItems.length})
            </span>
          </button>

          {/* Action buttons - Always Visible */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveBill}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-center text-sm"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </button>
            <button
              onClick={async () => {
                if (!currentBill) {
                  await handleSaveBill();
                } else {
                  setShowPrint(true);
                }
              }}
              disabled={!customerName || !tableNumber || billItems.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-center text-sm"
            >
              <Printer className="h-3 w-3 mr-1" />
              Print
            </button>
          </div>
        </div>
      )}

      {/* Two-column layout: Menu on left, Cart on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2">
          <MenuItemSelector onItemSelect={addItem} />
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart ({billItems.length})
            </h2>

            {billItems.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">No items yet. Add from the left.</div>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-[300px] overflow-auto pr-1">
                {billItems.map((item) => (
                  <BillItemCard
                    key={`${item.menuItemId}-${item.type}`}
                    item={item}
                    onQuantityChange={updateItemQuantity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bill Summary */}
          {billItems.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <BillSummary
                subtotal={subtotal}
                gstAmount={gstAmount}
                discount={discount}
                total={total}
                onDiscountChange={setDiscount}
              />

              <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
                <button
                  onClick={handleSaveBill}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Bill
                </button>
                <button
                  onClick={async () => {
                    if (!currentBill) {
                      // Save the bill first, then show print
                      await handleSaveBill();
                    } else {
                      setShowPrint(true);
                    }
                  }}
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

      {/* Cart Edit Modal */}
      {showCartModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCartModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Edit Cart Items ({billItems.length})
              </h3>
              <button
                onClick={() => setShowCartModal(false)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            {billItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-base">No items in cart</p>
                <p className="text-sm">Add items from the menu to get started</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                                 {billItems.map((item) => (
                   <div key={`${item.menuItemId}-${item.type}`} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                     <div className="flex-1 min-w-0">
                       <h4 className="font-medium text-gray-900 dark:text-white truncate mb-1">
                         {item.name}
                       </h4>
                       <p className="text-sm text-gray-600 dark:text-gray-400">
                         {item.type === 'full' ? 'Full Plate' : 'Half Plate'} - ₹{item.price}
                       </p>
                       <p className="text-sm font-medium text-gray-900 dark:text-white">
                         Total: ₹{item.total}
                       </p>
                     </div>
                     
                     <div className="flex items-center space-x-2">
                       <button
                         onClick={() => updateItemQuantity(item.menuItemId, item.type, item.quantity - 1)}
                         className="p-2 rounded-full bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 transition-colors"
                         title={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                       >
                         {item.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                       </button>
                       
                       <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                         {item.quantity}
                       </span>
                       
                       <button
                         onClick={() => updateItemQuantity(item.menuItemId, item.type, item.quantity + 1)}
                         className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 transition-colors"
                         title="Increase quantity"
                       >
                         <Plus className="h-4 w-4" />
                       </button>
                     </div>
                   </div>
                 ))}
                
                {/* Cart Summary in Modal */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">GST (18%):</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-semibold border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-blue-600 dark:text-blue-400">₹{total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Action Buttons in Modal */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                  <button
                    onClick={() => setShowCartModal(false)}
                    className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all text-sm sm:text-base"
                  >
                    Close
                  </button>
                  <button
                    onClick={async () => {
                      setShowCartModal(false);
                      await handleSaveBill();
                    }}
                    className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all text-sm sm:text-base"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Bill
                  </button>
                  <button
                    onClick={async () => {
                      setShowCartModal(false);
                      if (!currentBill) {
                        await handleSaveBill();
                      } else {
                        setShowPrint(true);
                      }
                    }}
                    disabled={!customerName || !tableNumber || billItems.length === 0}
                    className="flex-1 flex items-center justify-center px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all text-sm sm:text-base"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print & Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}