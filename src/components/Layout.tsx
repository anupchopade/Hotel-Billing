import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Home, 
  FileText, 
  History, 
  Menu, 
  Users, 
  LogOut, 
  Sun, 
  Moon,
  Store
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'New Bill', href: '/create-bill', icon: FileText },
    { name: 'History', href: '/history', icon: History },
    { name: 'Menu', href: '/menu', icon: Menu },
    ...(user?.role === 'admin' ? [{ name: 'Users', href: '/users', icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink-0">
              <Store className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <Link to="/create-bill" className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
                Hotel Anuprabha
              </Link>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate hidden sm:block">
                Welcome, {user?.name}
              </span>
              
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-16 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-around px-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center px-1 py-2.5 flex-1 text-xs transition-colors min-w-0 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon className="h-4 w-4 mb-1 flex-shrink-0" />
                <span className="truncate text-center leading-tight">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 lg:top-0 z-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pt-28 lg:pt-16">
          <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}