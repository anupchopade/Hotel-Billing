import React, { useState } from 'react';
import { useMenuItems } from '../hooks/useMenuItems';
import { MenuItem } from '../types';
import { Menu, Plus, Edit, Trash2, Search, Save, X, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function MenuManagement() {
  const { user } = useAuth();
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useMenuItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    fullPrice: '',
    halfPrice: '',
    isAvailable: true
  });

  const isAdmin = user?.role === 'admin';
  const isCashier = user?.role === 'cashier';

  if (!isAdmin && !isCashier) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
        <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">Access restricted to hotel staff only.</p>
      </div>
    );
  }

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      fullPrice: '',
      halfPrice: '',
      isAvailable: true
    });
    setIsAddingItem(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category.trim() || !formData.fullPrice || !formData.halfPrice) {
      alert('Please fill all fields');
      return;
    }

    const itemData = {
      name: formData.name.trim(),
      category: formData.category.trim().toLowerCase(),
      fullPrice: parseFloat(formData.fullPrice),
      halfPrice: parseFloat(formData.halfPrice),
      isAvailable: formData.isAvailable
    };

    let result;
    if (editingItem) {
      result = await updateMenuItem(editingItem.id, itemData);
    } else {
      result = await addMenuItem(itemData);
    }
    
    if (result.success) {
      resetForm();
    } else {
      alert(result.error || 'Operation failed');
    }
  };

  const startEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      fullPrice: item.fullPrice.toString(),
      halfPrice: item.halfPrice.toString(),
      isAvailable: item.isAvailable
    });
    setEditingItem(item);
    setIsAddingItem(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Menu className="h-6 w-6 mr-3" />
            {isCashier ? 'Menu Items' : 'Menu Management'}
          </h1>
          {isAdmin && (
            <button
              onClick={() => setIsAddingItem(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          )}
        </div>

        {/* Add/Edit Form - Admin Only */}
        {isAdmin && isAddingItem && (
          <div className="mb-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  placeholder="e.g. Chicken Biryani"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  placeholder="e.g. biryani, starters"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Plate Price *
                </label>
                <input
                  type="number"
                  value={formData.fullPrice}
                  onChange={(e) => setFormData({ ...formData, fullPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Half Plate Price *
                </label>
                <input
                  type="number"
                  value={formData.halfPrice}
                  onChange={(e) => setFormData({ ...formData, halfPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="md:col-span-2 flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Available for order</span>
                </label>
                
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
      </div>

      {/* Menu Items */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Menu className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No menu items found</p>
            <p className="text-sm">Add some items to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg transition-all ${
                  item.isAvailable 
                    ? 'border-gray-200 dark:border-gray-700 hover:shadow-md' 
                    : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`font-medium ${item.isAvailable ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{item.category}</p>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1 rounded bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this item?')) {
                            const result = await deleteMenuItem(item.id);
                            if (!result.success) {
                              alert(result.error || 'Failed to delete item');
                            }
                          }
                        }}
                        className="p-1 rounded bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Full Plate:</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{item.fullPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Half Plate:</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{item.halfPrice}</span>
                  </div>
                </div>
                
                {!item.isAvailable && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                    Currently Unavailable
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}