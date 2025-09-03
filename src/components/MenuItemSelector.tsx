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
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Select Items</h2>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all bg-white dark:bg-gray-800">
            <div className="mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">{item.category}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Full Plate</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">₹{item.fullPlatePrice}</span>
                  <button
                    onClick={() => onItemSelect(item.id, 'full')}
                    className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Half Plate</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">₹{item.halfPlatePrice}</span>
                  <button
                    onClick={() => onItemSelect(item.id, 'half')}
                    className="p-1 rounded-full bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
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