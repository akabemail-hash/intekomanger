import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Tenant, Package } from '../../types';
import { Building2, UserPlus, Search, Edit, Power, Check, X, Stethoscope, User, RefreshCw, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Tenants: React.FC = () => {
    const { t } = useLanguage();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Action Loading States
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    // Form Fields
    const [voen, setVoen] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');
    const [selectedPackage, setSelectedPackage] = useState('');
    const [customerType, setCustomerType] = useState('normal');
    const [status, setStatus] = useState('active');

    const loadData = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
            setTenants([]); // Clear data to show visual refresh
        }
        try {
            const [tData, pData] = await Promise.all([
                api.tenants.list(),
                api.packages.list()
            ]);
            setTenants(tData);
            setPackages(pData);
            
            // Set default package only if not already set or invalid
            if(pData.length > 0) {
                if (!selectedPackage || !pData.find(p => p.id === selectedPackage)) {
                    setSelectedPackage(pData[0].id);
                }
            }
        } catch (e) {
            console.error("Load Data Error:", e);
        } finally {
            setLoading(false);
            if (isRefresh) setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- Create Logic ---
    const openCreateModal = () => {
        setVoen('');
        setCompanyName('');
        setAdminUser('');
        setAdminPass('');
        setCustomerType('normal');
        setStatus('active');
        if (packages.length > 0) setSelectedPackage(packages[0].id);
        setShowCreateModal(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.tenants.create(
                { voen, name: companyName, package_id: selectedPackage, customer_type: customerType },
                { username: adminUser, password: adminPass }
            );
            setShowCreateModal(false);
            await loadData(true); // Force refresh
            alert(t('tenant_created'));
        } catch (e: any) {
            alert(t('error_creating_tenant') + ': ' + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    // --- Edit Logic ---
    const openEditModal = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setVoen(tenant.voen || '');
        setCompanyName(tenant.name || '');
        setSelectedPackage(tenant.package_id || (packages.length > 0 ? packages[0].id : ''));
        setCustomerType(tenant.customer_type || 'normal');
        setStatus(tenant.status || 'active');
        setShowEditModal(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTenant) return;
        setSubmitting(true);

        try {
            await api.tenants.update(editingTenant.id, {
                voen,
                name: companyName,
                package_id: selectedPackage,
                customer_type: customerType as 'normal' | 'clinic',
                status: status as 'active' | 'inactive'
            });
            setShowEditModal(false);
            setEditingTenant(null);
            await loadData(true); // Force refresh
            alert(t('update_success'));
        } catch (e: any) {
            console.error("Update Error:", e);
            alert(t('error_creating_tenant') + ': ' + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    // --- Status Logic ---
    const handleToggleStatus = async (tenant: Tenant) => {
        // Normalize: if status is missing/null, treat as active (consistent with UI rendering below)
        const currentStatus = tenant.status || 'active';
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const confirmMsg = newStatus === 'inactive' ? t('deactivate') : t('activate');
        
        if (!window.confirm(`${confirmMsg}?`)) return;

        setUpdatingStatusId(tenant.id);

        // Optimistic Update: Update UI immediately
        const prevTenants = [...tenants];
        setTenants(tenants.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t));

        try {
            // Using generic update instead of updateStatus for consistency and reliability
            await api.tenants.update(tenant.id, { status: newStatus });
        } catch (e: any) {
            // Revert on error
            setTenants(prevTenants);
            alert("Error updating status: " + e.message);
        } finally {
            setUpdatingStatusId(null);
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('tenants_companies')}</h1>
                    <button 
                        type="button"
                        onClick={() => loadData(true)}
                        disabled={refreshing}
                        className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
                    </button>
                </div>
                <button 
                    type="button"
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <UserPlus size={18} /> {t('register_company')}
                </button>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">{t('voen')}</th>
                            <th className="px-6 py-3">{t('company_name')}</th>
                            <th className="px-6 py-3">{t('customer_type')}</th>
                            <th className="px-6 py-3">{t('package_name')}</th>
                            <th className="px-6 py-3">{t('status')}</th>
                            <th className="px-6 py-3">{t('joined')}</th>
                            <th className="px-6 py-3 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading || (refreshing && tenants.length === 0) ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center">
                                    <div className="flex justify-center items-center gap-2 text-slate-500">
                                        <Loader2 className="animate-spin" size={20} /> Loading...
                                    </div>
                                </td>
                            </tr>
                        ) : tenants.map(tData => {
                            // Normalize status for rendering. If missing, treat as active.
                            const normalizedStatus = tData.status || 'active';
                            
                            return (
                                <tr key={tData.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 font-mono">{tData.voen}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Building2 size={16} className="text-slate-400"/> {tData.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            tData.customer_type === 'clinic' 
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                        }`}>
                                            {tData.customer_type === 'clinic' ? <Stethoscope size={12}/> : <User size={12}/>}
                                            {tData.customer_type === 'clinic' ? t('clinic_customer') : t('normal_customer')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md text-xs font-semibold">
                                            {tData.package?.name || t('unknown')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${normalizedStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                            {normalizedStatus === 'active' ? t('active') : t('inactive')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {tData.created_at ? new Date(tData.created_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => openEditModal(tData)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title={t('edit')}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleToggleStatus(tData)}
                                                disabled={updatingStatusId === tData.id}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    normalizedStatus === 'active' 
                                                    ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20' 
                                                    : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                                                } disabled:opacity-50`}
                                                title={normalizedStatus === 'active' ? t('deactivate') : t('activate')}
                                            >
                                                {updatingStatusId === tData.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Power size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-xl font-bold dark:text-white">{t('register_company')}</h2>
                             <button onClick={() => setShowCreateModal(false)} className="text-slate-500"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 dark:text-slate-300">{t('voen')}</label>
                                    <input required value={voen} onChange={e => setVoen(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 dark:text-slate-300">{t('company_name')}</label>
                                    <input required value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm mb-1 dark:text-slate-300">{t('customer_type')}</label>
                                <select 
                                    value={customerType} 
                                    onChange={e => setCustomerType(e.target.value)} 
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="normal">{t('normal_customer')}</option>
                                    <option value="clinic">{t('clinic_customer')}</option>
                                </select>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                                <p className="text-sm font-semibold mb-2 dark:text-slate-400">{t('initial_admin')}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-1 dark:text-slate-300">{t('username')}</label>
                                        <input required value={adminUser} onChange={e => setAdminUser(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 dark:text-slate-300">{t('password')}</label>
                                        <input required type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm mb-1 dark:text-slate-300">{t('assign_package')}</label>
                                <select value={selectedPackage} onChange={e => setSelectedPackage(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    {packages.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.max_users} {t('users_selected')}) - ₼{p.price}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded">{t('cancel')}</button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {submitting && <Loader2 size={16} className="animate-spin" />}
                                    {t('create_tenant')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-xl font-bold dark:text-white">{t('edit_tenant')}</h2>
                             <button onClick={() => setShowEditModal(false)} className="text-slate-500"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1 dark:text-slate-300">{t('voen')}</label>
                                <input required value={voen} onChange={e => setVoen(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 dark:text-slate-300">{t('company_name')}</label>
                                <input required value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                            
                            <div>
                                <label className="block text-sm mb-1 dark:text-slate-300">{t('customer_type')}</label>
                                <select 
                                    value={customerType} 
                                    onChange={e => setCustomerType(e.target.value)} 
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="normal">{t('normal_customer')}</option>
                                    <option value="clinic">{t('clinic_customer')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-1 dark:text-slate-300">{t('status')}</label>
                                <select 
                                    value={status} 
                                    onChange={e => setStatus(e.target.value)} 
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="active">{t('active')}</option>
                                    <option value="inactive">{t('inactive')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-1 dark:text-slate-300">{t('assign_package')}</label>
                                <select value={selectedPackage} onChange={e => setSelectedPackage(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    {packages.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.max_users} {t('users_selected')}) - ₼{p.price}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded">{t('cancel')}</button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {submitting && <Loader2 size={16} className="animate-spin" />}
                                    {t('update')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};