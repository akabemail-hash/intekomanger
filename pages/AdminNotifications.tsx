import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Send, Users, User, Layers, Check } from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const { t } = useLanguage();
  const { users, roles } = useAuth();
  const { sendNotification } = useNotifications();
  
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'role' | 'users'>('all');
  const [selectedRole, setSelectedRole] = useState(roles[0]?.name || '');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    let targetValue;
    if (targetType === 'role') targetValue = selectedRole;
    if (targetType === 'users') targetValue = selectedUserIds;

    sendNotification(message, targetType, targetValue);
    
    setMessage('');
    setSelectedUserIds([]);
    alert(t('notification_sent'));
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
        setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
        setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('admin_notifications')}</h1>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <form onSubmit={handleSend} className="space-y-6">
              
              {/* Message Input */}
              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('message')}</label>
                 <textarea 
                   rows={4}
                   required
                   className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white p-4 resize-none focus:ring-2 focus:ring-purple-500 outline-none"
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   placeholder={t('type_message_placeholder')}
                 />
              </div>

              {/* Target Selector */}
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('target_audience')}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div 
                        onClick={() => setTargetType('all')}
                        className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${targetType === 'all' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                      >
                          <Layers size={24} />
                          <span className="font-medium">{t('target_all')}</span>
                      </div>
                      <div 
                        onClick={() => setTargetType('role')}
                        className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${targetType === 'role' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                      >
                          <Users size={24} />
                          <span className="font-medium">{t('target_role')}</span>
                      </div>
                      <div 
                        onClick={() => setTargetType('users')}
                        className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${targetType === 'users' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                      >
                          <User size={24} />
                          <span className="font-medium">{t('target_users')}</span>
                      </div>
                  </div>
              </div>

              {/* Conditional Inputs based on Target */}
              {targetType === 'role' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('select_role')}</label>
                      <select 
                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white p-3"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                      >
                          {roles.map(r => (
                              <option key={r.name} value={r.name}>{r.name}</option>
                          ))}
                      </select>
                  </div>
              )}

              {targetType === 'users' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('select_users')}</label>
                      <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg p-2 space-y-1">
                          {users.map(u => (
                              <div 
                                key={u.id} 
                                onClick={() => toggleUserSelection(u.id)}
                                className={`flex items-center justify-between p-2 rounded cursor-pointer ${selectedUserIds.includes(u.id) ? 'bg-purple-100 dark:bg-purple-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                              >
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold">
                                          {u.username.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                          <p className="text-sm font-medium text-slate-800 dark:text-white">{u.username}</p>
                                          <p className="text-xs text-slate-500">{u.role}</p>
                                      </div>
                                  </div>
                                  {selectedUserIds.includes(u.id) && <Check size={16} className="text-purple-600" />}
                              </div>
                          ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{selectedUserIds.length} {t('users_selected')}</p>
                  </div>
              )}

              <div className="pt-4">
                  <button 
                    type="submit" 
                    className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-3"
                  >
                    <Send size={20} />
                    {t('send_notification')}
                  </button>
              </div>
          </form>
      </div>
    </div>
  );
};