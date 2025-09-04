import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBills } from '../hooks/useBills';
import { useMenuItems } from '../hooks/useMenuItems';
import { 
  FileText, 
  History, 
  Menu, 
  TrendingUp, 
  IndianRupee,
  Clock,
  ChefHat,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { bills } = useBills();
  const { menuItems } = useMenuItems();
  const [showFinancials, setShowFinancials] = useState(false);

  const todaysBills = bills.filter(bill => {
    const billDate = new Date(bill.createdAt).toDateString();
    const today = new Date().toDateString();
    return billDate === today;
  });

  const todaysRevenue = todaysBills.reduce((sum, bill) => sum + bill.total, 0);
  const thisMonthsBills = bills.filter(bill => {
    const billDate = new Date(bill.createdAt);
    const now = new Date();
    return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
  });
  const monthlyRevenue = thisMonthsBills.reduce((sum, bill) => sum + bill.total, 0);

  const quickActions = [
    {
      name: 'Create New Bill',
      href: '/create-bill',
      icon: FileText,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Generate a new bill for customer'
    },
    {
      name: 'View History',
      href: '/history',
      icon: History,
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Check past bills and reports'
    },
    {
      name: 'Manage Menu',
      href: '/menu',
      icon: Menu,
      color: 'bg-purple-600 hover:bg-purple-700',
      description: 'Add or update menu items'
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full flex-shrink-0 ml-3">
            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* General Stats - Always Visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Today's Bills</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{todaysBills.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Menu Items</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{menuItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Details Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Financial Overview
          </h2>
          <button
            onClick={() => setShowFinancials(!showFinancials)}
            className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm sm:text-base"
          >
            {showFinancials ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show
              </>
            )}
          </button>
        </div>

        {showFinancials ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                  <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Today's Revenue</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 dark:text-blue-100">₹{todaysRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Monthly Revenue</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900 dark:text-green-100">₹{monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 sm:py-6">
            <div className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <EyeOff className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Financial details are hidden for privacy</p>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Show" to view revenue information</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className={`${action.color} text-white p-4 sm:p-5 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg group`}
              >
                <div className="flex items-center mb-2 sm:mb-3">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  <h3 className="font-semibold text-sm sm:text-base">{action.name}</h3>
                </div>
                <p className="text-xs sm:text-sm opacity-90">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Bills */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Recent Bills</h2>
          <Link
            to="/history"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm self-start sm:self-auto"
          >
            View All
          </Link>
        </div>
        
        {todaysBills.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No bills created today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysBills.slice(0, 5).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">#{bill.billNumber}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{bill.customerName} - Table {bill.tableNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">₹{bill.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(bill.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}