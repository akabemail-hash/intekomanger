import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Check, Shield, Plus, Edit, ChevronLeft } from 'lucide-react';

export const AdminRoles: React.FC = () => {
  const { t } = useLanguage();
  const { roles, addRole, updateRole } = useAuth();
  const navigate = useNavigate();
  
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const permissionLabels: Record<string, string> = {
    dashboard: 'dashboard',
    sales: 'sales_report',
    purchases: 'purchase_report',
    profit: 'profit_report',
    payments: 'payment_report',
    sale_refund: 'sale_refund_report',
    stock: 'stock_report',
    admin_users: 'admin_users',
    admin_roles: 'admin_roles',
    admin_notifications: 'admin_notifications',
  };

  const allPermissions = Object.keys(permissionLabels);

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    if (roles.find(r => r.name === newRoleName)) {
        alert(t('role_exists'));
        return;
    }
    const newRole: Role = {
        name: newRoleName,
        permissions: ['dashboard']
    };
    addRole(newRole);
    setNewRoleName('');
    alert(t('role_created'));
  };

  const togglePermission = (permId: string) => {
    if (!editingRole) return;
    const currentPerms = editingRole.permissions;
    let newPerms;
    if (currentPerms.includes(permId)) {
        newPerms = currentPerms.filter(p => p !== permId);
    } else {
        newPerms = [...currentPerms, permId];
    }
    setEditingRole({ ...editingRole, permissions: newPerms });
  };

  const saveRolePermissions = () => {
    if (editingRole) {
        updateRole(editingRole);
        setEditingRole(null);
        alert(t('permissions_updated'));
    }
  };

  return (
    <div className="space-y-8">
      {/* Mobile Back Button */}
      <div className="md:hidden mb-4">
          <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium p-2 -ml-2 rounded-lg active:bg-slate-100 dark:active:bg-slate-800"
          >
              <ChevronLeft size={20} /> 
              {t('previous')}
          </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('admin_roles')}</h1>

      {/* Create Role */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-lg">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Plus size={20} />
              {t('create_role')}
          </h2>
          <form onSubmit={handleCreateRole} className="flex gap-4">
              <input 
                type="text" 
                required
                placeholder={t('role_name')}
                className="flex-1 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white p-2"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <button 
                 type="submit" 
                 className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
               >
                 {t('save')}
               </button>
          </form>
      </div>

      {/* Role List & Permission Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                 <h2 className="font-semibold text-slate-700 dark:text-slate-200">{t('admin_roles')}</h2>
             </div>
             <div className="divide-y divide-slate-100 dark:divide-slate-700">
                 {roles.map(r => (
                     <div key={r.name} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50">
                         <div>
                             <p className="font-bold text-slate-800 dark:text-white">{r.name}</p>
                             <p className="text-xs text-slate-500">{r.permissions.length} {t('permissions_count')}</p>
                         </div>
                         <button 
                            onClick={() => setEditingRole(r)}
                            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-lg"
                         >
                             <Edit size={18} />
                         </button>
                     </div>
                 ))}
             </div>
          </div>

          {/* Editor */}
          {editingRole ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Shield size={20} />
                      {t('permissions_for')} <span className="text-blue-600">{editingRole.name}</span>
                  </h2>
                  <div className="space-y-2 mb-6">
                      {allPermissions.map(permId => (
                          <label key={permId} className="flex items-center space-x-3 p-3 border border-slate-100 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <input 
                                type="checkbox"
                                checked={editingRole.permissions.includes(permId)}
                                onChange={() => togglePermission(permId)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-slate-700 dark:text-slate-200">{t(permissionLabels[permId])}</span>
                          </label>
                      ))}
                  </div>
                  <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setEditingRole(null)}
                        className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                          {t('cancel')}
                      </button>
                      <button 
                        onClick={saveRolePermissions}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Check size={18} />
                        {t('update_permissions')}
                      </button>
                  </div>
              </div>
          ) : (
              <div className="flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
                  {t('select_role_placeholder')}
              </div>
          )}
      </div>
    </div>
  );
};
