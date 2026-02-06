import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { LOGO_URL } from '../constants';
import { Language } from '../types';
import { Sun, Moon, Briefcase, User, Lock, CreditCard, Globe, ChevronDown, Check } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const [voen, setVoen] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
        const result = await login(voen, username, password);
        if (!result.success) {
            // Check if error message is a translation key (e.g., account_inactive)
            const msg = result.message;
            if (msg === 'account_inactive') {
                setError(t('account_inactive'));
            } else {
                setError(t('error_login'));
            }
        }
    } catch (e) {
        setError(t('error_login'));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Left Side - Brand Image/Info (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
            <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
                alt="Corporate Building" 
                className="w-full h-full object-cover"
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-slate-900/90" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white h-full w-full">
            <div className="mb-8">
                <img src={LOGO_URL} alt="Inteko" className="h-16 bg-white rounded-lg p-2 mb-6 inline-block shadow-lg" />
                <h1 className="text-5xl font-bold mb-4">{t('login_hero_title')}</h1>
                <p className="text-xl text-blue-100 max-w-md leading-relaxed">
                    {t('login_hero_subtitle')}
                </p>
            </div>
            <div className="mt-8 flex gap-4 text-sm font-medium text-blue-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                        <Briefcase size={16} />
                    </div>
                    <span>{t('corporate_tools')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                        <User size={16} />
                    </div>
                    <span>{t('user_management')}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">
        
        {/* Top Controls */}
        <div className="absolute top-6 right-6 flex items-center gap-4">
             {/* Language Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
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
                className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                title={theme === 'dark' ? t('light_mode') : t('dark_mode')}
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>

        <div className="max-w-md w-full">
            <div className="lg:hidden mb-8 text-center">
                 <img src={LOGO_URL} alt="Inteko" className="h-12 mx-auto mb-4" />
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('login_hero_title')}</h2>
            </div>

            <div className="text-center lg:text-left mb-10">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('login_title')}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t('login_subtitle')}</p>
            </div>
            
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-3 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* VOEN Input */}
                <div className="group">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">{t('voen')}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CreditCard className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            required
                            placeholder="1234567890"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={voen}
                            onChange={(e) => setVoen(e.target.value)}
                        />
                    </div>
                </div>

                {/* Username Input */}
                <div className="group">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">{t('username')}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            required
                            placeholder="admin"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="group">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">{t('password')}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             Processing...
                        </span>
                    ) : t('login_button')}
                </button>
            </form>

            <div className="mt-8 text-center">
                 <p className="text-xs text-slate-400 dark:text-slate-500">
                     © {new Date().getFullYear()} Inteko LLC. {t('rights_reserved')}
                 </p>
            </div>
        </div>
      </div>
    </div>
  );
};