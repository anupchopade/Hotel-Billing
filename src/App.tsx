import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/Toaster';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateBill from './pages/CreateBill';
import BillHistory from './pages/BillHistory';
import MenuManagement from './pages/MenuManagement';
import UserManagement from './pages/UserManagement';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/create-bill" element={
                <ProtectedRoute>
                  <CreateBill />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <BillHistory />
                </ProtectedRoute>
              } />
              <Route path="/menu" element={
                <ProtectedRoute>
                  <MenuManagement />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;