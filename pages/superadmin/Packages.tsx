import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Package } from '../../types';
import { Trash2, Plus, Box, Check, Edit, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Packages: React.FC = () => {
    const { t } = useLanguage();
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newMaxUsers, setNewMaxUsers] = useState(5);
    const [newPrice, setNewPrice] = useState(0);

    const loadPackages = async () => {
        try {
            const data = await api.packages.list();
            setPackages(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPackages();
    }, []);

    const handleOpenCreate = () => {
        setEditingId(null);
        setNewName('');
        setNewMaxUsers(5);
        setNewPrice(0);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (pkg: Package) => {
        setEditingId(pkg.id);
        setNewName(pkg.name);
        setNewMaxUsers(pkg.max_users);
        setNewPrice(pkg.price);
        setIsFormOpen(true);
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                await api.packages.update(editingId, {
                    name: newName,
                    max_users: newMaxUsers,
                    price: newPrice
                });
                alert(t('update_success'));
            } else {
                // Create
                await api.packages.create({
                    name: newName,
                    max_users: newMaxUsers,
                    price: newPrice,
                    features: ['dashboard', 'sales', 'purchases', 'profit', 'payments', 'sale_refund', 'stock'] // Default features
                });
            }
            setIsFormOpen(false);
            setEditingId(null);
            setNewName('');
            setNewMaxUsers(5);
            setNewPrice(0);
            loadPackages();
        } catch (e) {
            alert(editingId ? "Failed to update" : t('failed_create_package'));
        }
    };

    const handleDelete = async (id: string) => {
        if(!confirm(t('confirm_delete'))) return;
        try {
            await api.packages.delete(id);
            loadPackages();
        } catch (e) {
            alert(t('package_in_use'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('subscription_packages')}</h1>
                {!isFormOpen && (
                    <button 
                        onClick={handleOpenCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} /> {t('new_package')}
                    </button>
                )}
            </div>

            {isFormOpen && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-blue-200 dark:border-blue-900 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                            {editingId ? t('edit_package') : t('new_package')}
                        </h2>
                        <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">{t('package_name')}</label>
                            <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="e.g. Starter" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">{t('max_users')}</label>
                            <input required type="number" value={newMaxUsers} onChange={e => setNewMaxUsers(Number(e.target.value))} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">{t('price')} (AZN)</label>
                            <input required type="number" value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                        <div className="flex gap-2">
                             <button type="button" onClick={() => setIsFormOpen(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 p-2 rounded hover:bg-slate-300 dark:hover:bg-slate-600 flex-1 flex justify-center">
                                {t('cancel')}
                            </button>
                            <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700 flex-1 flex justify-center items-center gap-2">
                                <Check size={18} /> {editingId ? t('update') : t('save')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map(pkg => (
                    <div key={pkg.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEdit(pkg)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full transition-colors">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(pkg.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                                <Box size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{pkg.name}</h3>
                                <p className="text-slate-500 text-xs">ID: {pkg.id.substring(0,8)}...</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">{t('user_limit')}</span>
                                <span className="font-semibold dark:text-slate-200">{pkg.max_users} {t('users_selected')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">{t('price')}</span>
                                <span className="font-semibold text-green-600">₼{pkg.price}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};