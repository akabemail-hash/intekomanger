import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, FileText, ShoppingCart, Package, TrendingDown, Users, LogOut, Bell, Sun, Moon, ChevronDown, ChevronRight, Settings, UserPlus, Shield, Globe, Check, Briefcase, Database, Box, TrendingUp, CreditCard, RefreshCcw, User, KeyRound } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { LOGO_URL } from '../constants';
import { Language, Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(true);
  const [isSuperAdminMenuOpen, setIsSuperAdminMenuOpen] = useState(true);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const { t, language, setLanguage } = useLanguage();
  const { logout, user, getPermissionsForUser, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, markAsRead } = useNotifications();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const permissions = user ? getPermissionsForUser(user) : [];

  // Filter notifications for the current user
  const userNotifications = notifications.filter(n => {
    if (n.targetType === 'all') return true;
    if (n.targetType === 'role' && user?.role === n.targetValue) return true;
    if (n.targetType === 'users' && Array.isArray(n.targetValue) && user && n.targetValue.includes(user.id)) return true;
    return false;
  });

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (pathPrefix: string) => location.pathname.startsWith(pathPrefix);

  const hasAdminAccess = permissions.some(p => ['admin_users', 'admin_roles', 'admin_notifications'].includes(p));
  const isSuperAdmin = permissions.includes('super_admin');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && newPassword) {
        try {
            await updateUser(user.id, { password: newPassword });
            alert(t('update_success'));
            setShowPasswordModal(false);
            setNewPassword('');
        } catch (e: any) {
            alert(e.message);
        }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-850 shadow-lg transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:shadow-none border-r border-slate-200 dark:border-slate-700
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex justify-between items-center">
             <img src={LOGO_URL} alt="Inteko" className="h-10 object-contain mx-auto bg-white p-1 rounded" />
             <button onClick={toggleSidebar} className="md:hidden text-slate-500">
               <X size={24} />
             </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
            {permissions.includes('dashboard') && (
              <Link to="/" onClick={() => setIsSidebarOpen(false)} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600 dark:border-blue-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <LayoutDashboard size={20} className="mr-3" /> {t('dashboard')}
              </Link>
            )}
            {permissions.includes('sales') && (
              <Link to="/sales" onClick={() => setIsSidebarOpen(false)} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/sales') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600 dark:border-blue-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <FileText size={20} className="mr-3" /> {t('sales_report')}
              </Link>
            )}
            {permissions.includes('purchases') && (
              <Link to="/purchases" onClick={() => setIsSidebarOpen(false)} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/purchases') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600 dark:border-blue-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <ShoppingCart size={20} className="mr-3" /> {t('purchase_report')}
              </Link>
            )}
            {permissions.includes('profit') && (
              <Link to="/profit" onClick={() => setIsSidebarOpen(false)} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/profit') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600 dark:border-blue-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <TrendingUp size={20} className="mr-3" /> {t('profit_report')}
              </Link>
            )}
            {permissions.includes('payments') && (
              <Link to="/payments" onClick={() => setIsSidebarOpen(false)} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/payments') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600 dark:border-blue-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <CreditCard size={20} className="mr-3" /> {t('payment_report')}
              </Link>
            )}
            {permissions.includes('sale_refund') && (
              <Link to="/sale-refund" onClick={() => setIsSidebarOpen(false)} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/sale-refund') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600 dark:border-blue-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <RefreshCcw size={20} className="mr-3" /> {t('sale_refund_report')}
              </Link>
            )}
            {permissions.includes('stock') && (
              <Link to="/stock" onClick={() => setIsSidebarOpen(false)} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/stock') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600 dark:border-blue-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <Package size={20} className="mr-3" /> {t('stock_report')}
              </Link>
            )}

            {/* Super Admin Section */}
            {isSuperAdmin && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                 <button 
                  onClick={() => setIsSuperAdminMenuOpen(!isSuperAdminMenuOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800`}
                >
                  <div className="flex items-center">
                    <Database size={20} className="mr-3 text-purple-600" />
                    <span className="font-bold">{t('system_admin')}</span>
                  </div>
                  {isSuperAdminMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {isSuperAdminMenuOpen && (
                    <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-700 space-y-1 mt-1">
                        <Link to="/super-admin/packages" onClick={() => setIsSidebarOpen(false)} className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${isActive('/super-admin/packages') ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                            <Box size={16} className="mr-2" /> {t('packages')}
                        </Link>
                        <Link to="/super-admin/tenants" onClick={() => setIsSidebarOpen(false)} className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${isActive('/super-admin/tenants') ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                            <Briefcase size={16} className="mr-2" /> {t('tenants')}
                        </Link>
                    </div>
                )}
              </div>
            )}

            {/* Admin Accordion Menu */}
            {hasAdminAccess && (
              <div className="pt-2">
                <button 
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 ${isParentActive('/admin') ? 'text-blue-700 dark:text-blue-300' : ''}`}
                >
                  <div className="flex items-center">
                    <Users size={20} className="mr-3" />
                    <span>{t('admin_users')}</span>
                  </div>
                  {isAdminMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {isAdminMenuOpen && (
                  <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-700 space-y-1 mt-1">
                    {permissions.includes('admin_users') && (
                      <Link to="/admin/users" onClick={() => setIsSidebarOpen(false)} className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${isActive('/admin/users') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                        <UserPlus size={16} className="mr-2" /> {t('admin_users')}
                      </Link>
                    )}
                    {permissions.includes('admin_roles') && (
                      <Link to="/admin/roles" onClick={() => setIsSidebarOpen(false)} className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${isActive('/admin/roles') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                        <Shield size={16} className="mr-2" /> {t('admin_roles')}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center px-4 py-3 mb-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="ml-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.username}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">{user?.voen}</p>
                </div>
            </div>
            {/* Removed Logout button from sidebar since it is now in the header profile menu */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header */}
        <header className="bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 md:px-8 shrink-0 z-20">
             <div className="flex items-center">
                 <button onClick={toggleSidebar} className="md:hidden text-slate-600 dark:text-slate-300 mr-4">
                     <Menu size={24} />
                 </button>
                 <h2 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">
                     Inteko Manager
                 </h2>
             </div>

             <div className="flex items-center gap-3">
                 {/* Notification Bell */}
                 <div className="relative">
                     <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors relative"
                     >
                         <Bell size={20} />
                         {unreadCount > 0 && (
                             <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-850"></span>
                         )}
                     </button>
                     
                     {/* Notification Dropdown */}
                     {isNotificationsOpen && (
                         <>
                             <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)}></div>
                             <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
                                 <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 font-semibold text-slate-800 dark:text-white flex justify-between items-center">
                                     {t('notifications')}
                                     {unreadCount > 0 && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                                 </div>
                                 <div className="max-h-80 overflow-y-auto">
                                     {userNotifications.length === 0 ? (
                                         <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                             {t('no_notifications')}
                                         </div>
                                     ) : (
                                         userNotifications.map(n => (
                                             <div 
                                                key={n.id} 
                                                onClick={() => markAsRead(n.id)}
                                                className={`p-4 border-b border-slate-50 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                             >
                                                 <div className="flex justify-between items-start mb-1">
                                                     <p className={`text-sm ${!n.isRead ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{n.message}</p>
                                                     {!n.isRead && <div className="h-2 w-2 bg-blue-500 rounded-full shrink-0 mt-1.5 ml-2"></div>}
                                                 </div>
                                                 <p className="text-xs text-slate-400">
                                                     {new Date(n.date).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                 </p>
                                                 {/* Debug Info for Target */}
                                                 <div className="mt-1 text-[10px] text-slate-400 uppercase tracking-wider">
                                                     {n.targetType === 'all' ? 'Broadcast' : n.targetType === 'role' ? `Role: ${n.targetValue}` : 'Private'}
                                                 </div>
                                             </div>
                                         ))
                                     )}
                                 </div>
                             </div>
                         </>
                     )}
                 </div>

                 {/* Language Dropdown */}
                 <div className="relative">
                    <button
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Globe size={18} />
                        <span className="uppercase font-bold text-xs">{language}</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isLangMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsLangMenuOpen(false)}></div>
                            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
                                {(['az', 'ru', 'tr', 'en'] as Language[]).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => {
                                        setLanguage(lang);
                                        setIsLangMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${
                                        language === lang 
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10' 
                                        : 'text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                    <span className="uppercase">{lang}</span>
                                    {language === lang && <Check size={14} />}
                                </button>
                                ))}
                            </div>
                        </>
                    )}
                 </div>

                 {/* Theme Toggle */}
                 <button 
                    onClick={toggleTheme}
                    className="p-2 text-slate-600 dark:text-yellow-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                 >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                 </button>

                 {/* Profile Menu */}
                 <div className="relative">
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors"
                    >
                        {user?.username?.[0]?.toUpperCase()}
                    </button>

                    {isProfileMenuOpen && (
                         <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)}></div>
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.username}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
                                </div>
                                <div className="py-1">
                                    <button 
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            setShowPasswordModal(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                    >
                                        <KeyRound size={16} />
                                        {t('change_password')}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            logout();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                    >
                                        <LogOut size={16} />
                                        {t('logout')}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                 </div>
             </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>

        {/* Change Password Modal */}
        {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold dark:text-white">{t('change_password')}</h2>
                        <button onClick={() => setShowPasswordModal(false)} className="text-slate-500"><X size={20}/></button>
                    </div>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('new_password')}</label>
                            <input 
                                type="password" 
                                required
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white p-2"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                {t('cancel')}
                            </button>
                            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                {t('save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-700 z-50 flex justify-around items-center h-16 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            {permissions.includes('dashboard') && (
              <Link to="/" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <LayoutDashboard size={20} />
                <span className="text-[10px] mt-1 font-medium">{t('dashboard')}</span>
              </Link>
            )}
            {permissions.includes('sales') && (
              <Link to="/sales" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/sales') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <FileText size={20} />
                <span className="text-[10px] mt-1 font-medium">{t('sales_report')}</span>
              </Link>
            )}
             {permissions.includes('sale_refund') && (
              <Link to="/sale-refund" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/sale-refund') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <RefreshCcw size={20} />
                <span className="text-[10px] mt-1 font-medium">{t('sale_refund_report')}</span>
              </Link>
            )}
            {permissions.includes('stock') && (
              <Link to="/stock" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/stock') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <Package size={20} />
                <span className="text-[10px] mt-1 font-medium">{t('stock_report')}</span>
              </Link>
            )}
        </div>

      </div>
    </div>
  );
};