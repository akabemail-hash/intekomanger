import React from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SalesReport } from './pages/SalesReport';
import { PurchaseReport } from './pages/PurchaseReport';
import { ProfitReport } from './pages/ProfitReport';
import { PaymentReport } from './pages/PaymentReport';
import { SaleRefundReport } from './pages/SaleRefundReport';
import { StockReport } from './pages/StockReport';
import { AdminUsers } from './pages/AdminUsers';
import { AdminRoles } from './pages/AdminRoles';
import { AdminNotifications } from './pages/AdminNotifications';
import { Packages } from './pages/superadmin/Packages';
import { Tenants } from './pages/superadmin/Tenants';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requiredPermission }: { children?: React.ReactNode, requiredPermission?: string }) => {
  const { user, getPermissionsForUser } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const permissions = getPermissionsForUser(user);

  // If a specific permission is required, check it
  if (requiredPermission && !permissions.includes(requiredPermission)) {
      // Allow dashboard access if they have dashboard permission but failed specific page permission
      // Otherwise login
      return permissions.includes('dashboard') ? <Navigate to="/" replace /> : <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppContent = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            
            <Route path="/" element={
                <ProtectedRoute requiredPermission="dashboard">
                    <Dashboard />
                </ProtectedRoute>
            } />
            
            <Route path="/sales" element={
                <ProtectedRoute requiredPermission="sales">
                    <SalesReport />
                </ProtectedRoute>
            } />
            
            <Route path="/purchases" element={
                <ProtectedRoute requiredPermission="purchases">
                    <PurchaseReport />
                </ProtectedRoute>
            } />

            <Route path="/profit" element={
                <ProtectedRoute requiredPermission="profit">
                    <ProfitReport />
                </ProtectedRoute>
            } />
            
            <Route path="/payments" element={
                <ProtectedRoute requiredPermission="payments">
                    <PaymentReport />
                </ProtectedRoute>
            } />

            <Route path="/sale-refund" element={
                <ProtectedRoute requiredPermission="sale_refund">
                    <SaleRefundReport />
                </ProtectedRoute>
            } />

            <Route path="/stock" element={
                <ProtectedRoute requiredPermission="stock">
                    <StockReport />
                </ProtectedRoute>
            } />

            {/* Tenant Admin Routes */}
            <Route path="/admin/users" element={
                <ProtectedRoute requiredPermission="admin_users">
                    <AdminUsers />
                </ProtectedRoute>
            } />

            <Route path="/admin/roles" element={
                <ProtectedRoute requiredPermission="admin_roles">
                    <AdminRoles />
                </ProtectedRoute>
            } />

            <Route path="/admin/notifications" element={
                <ProtectedRoute requiredPermission="admin_notifications">
                    <AdminNotifications />
                </ProtectedRoute>
            } />
            
            {/* Super Admin Routes */}
             <Route path="/super-admin/packages" element={
                <ProtectedRoute requiredPermission="super_admin">
                    <Packages />
                </ProtectedRoute>
            } />
             <Route path="/super-admin/tenants" element={
                <ProtectedRoute requiredPermission="super_admin">
                    <Tenants />
                </ProtectedRoute>
            } />

            {/* Redirect old /admin to /admin/users for backward compatibility or default */}
            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />

            <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <MemoryRouter>
                <AppContent />
            </MemoryRouter>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;