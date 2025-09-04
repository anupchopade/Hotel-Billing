import React, { useMemo, useState } from 'react';
import { useMenuItems } from '../hooks/useMenuItems';
import { useBills } from '../hooks/useBills';
import { Search, Plus } from 'lucide-react';

interface MenuItemSelectorProps {
  onItemSelect: (menuItemId: string, type: 'full' | 'half') => void;
}

export default function MenuItemSelector({ onItemSelect }: MenuItemSelectorProps) {
  const { menuItems } = useMenuItems();
  const { bills } = useBills();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const itemOrderScore = useMemo(() => {
    const score: Record<string, number> = {};
    // Weight recent bills higher
    const recentBills = bills.slice(0, 200); // cap to avoid heavy compute
    let weight = recentBills.length;
    recentBills.forEach(bill => {
      bill.items.forEach(it => {
        score[it.menuItemId] = (score[it.menuItemId] || 0) + it.quantity * Math.max(weight, 1);
      });
      weight = Math.max(weight - 1, 1);
    });
    return score;
  }, [bills]);
  
  const filteredItems = useMemo(() => {
    const items = menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory && item.isAvailable;
    });
    return items.sort((a, b) => {
      const sb = (itemOrderScore[b.id] || 0) - (itemOrderScore[a.id] || 0);
      if (sb !== 0) return sb;
      return a.name.localeCompare(b.name);
    });
  }, [menuItems, searchTerm, selectedCategory, itemOrderScore]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Select Items</h2>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 text-sm sm:text-base"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all bg-white dark:bg-gray-800">
            <div className="mb-2 sm:mb-3">
              <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{item.name}</h3>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 capitalize">{item.category}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Full Plate Button */}
              <button
                onClick={() => onItemSelect(item.id, 'full')}
                className="group relative bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-lg sm:rounded-xl p-2 sm:p-4 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <div className="text-center">
                  <div className="text-xs sm:text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    FULL
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-blue-900 dark:text-blue-100">
                    ₹{item.fullPrice}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </button>

              {/* Half Plate Button */}
              <button
                onClick={() => onItemSelect(item.id, 'half')}
                className="group relative bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 rounded-lg sm:rounded-xl p-2 sm:p-4 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <div className="text-center">
                  <div className="text-xs sm:text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                    HALF
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-orange-900 dark:text-orange-100">
                    ₹{item.halfPrice}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-300">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No menu items found</p>
        </div>
      )}
    </div>
  );
}