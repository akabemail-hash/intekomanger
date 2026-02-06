import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Banknote, TrendingUp, TrendingDown, LayoutDashboard, FileText, ShoppingCart, CreditCard, RefreshCcw, Package, Users, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, getPermissionsForUser } = useAuth();
  const navigate = useNavigate();
  
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productStats, setProductStats] = useState<{name: string, totalQuantity: number}[]>([]);
  const [loading, setLoading] = useState(false);

  // Mobile View State: 'menu' (grid) or 'stats' (charts)
  const [mobileView, setMobileView] = useState<'menu' | 'stats'>('menu');
  const permissions = user ? getPermissionsForUser(user) : [];

  // Date Calculation (Use Local Time to avoid UTC mismatches)
  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth(); // 0-11
  
  // Helper for local YYYY-MM-DD
  const formatYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0); // Last day of current month

  const startOfMonthString = formatYMD(startOfMonth);
  const todayString = formatYMD(todayDate);
  const endOfMonthString = formatYMD(endOfMonth);

  useEffect(() => {
    const fetchData = async () => {
        if (!user?.voen) return;
        
        setLoading(true);

        // 1. Fetch General Sales (Daily/Monthly Totals)
        try {
            console.log(`Fetching sales totals: ${startOfMonthString} to ${endOfMonthString}`);
            // Fetch for the entire month to ensure we get all monthly data
            const externalData = await api.reports.fetchExternalSales(user.voen, startOfMonthString, endOfMonthString);
            
            console.log('Processed Sales Data:', externalData);

            if (externalData && Array.isArray(externalData)) {
                setSalesData(externalData);
            } else {
                setSalesData([]); 
            }
        } catch (error) {
            console.error("Sales Fetch Error:", error);
            // Don't clear salesData here if possible, but for now safe to leave or set empty
            setSalesData([]); 
        }

        // 2. Fetch Sales Details (Top/Worst Products)
        try {
            console.log(`Fetching details for Top 5: ${startOfMonthString} to ${endOfMonthString}`);
            const detailsData = await api.reports.fetchSalesDetails(user.voen, startOfMonthString, endOfMonthString);
            
            const statsMap = new Map<string, number>();
            
            if (detailsData && Array.isArray(detailsData)) {
                detailsData.forEach(item => {
                    // Normalize keys
                    const name = item.ProductName || item.productName || item.MalinAdi || item.Name || item.name || 'Unknown Product';
                    // Sum quantity
                    const qty = Number(item.Quantity || item.quantity || item.Amount || item.amount || item.Miqdar || 0);
                    
                    const currentQty = statsMap.get(name) || 0;
                    statsMap.set(name, currentQty + qty);
                });
            }

            const processedStats = Array.from(statsMap.entries()).map(([name, totalQuantity]) => ({
                name,
                totalQuantity
            }));
            
            console.log('Processed Product Stats:', processedStats);
            setProductStats(processedStats);

        } catch (error) {
            console.error("Details Fetch Error:", error);
            // Do not clear salesData here, only productStats
            setProductStats([]);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [user?.voen]);

  // --- Data Processing ---

  // Helper to safely extract date from API response (Keys: TARİX, date, etc.)
  const processDate = (item: any) => {
      // Check for Date (capitalized), date, or local variations
      const rawDate = String(item.Date || item.date || item.DATE || item.tarix || item.TARIX || '').trim();
      
      if (!rawDate || rawDate === 'undefined') return '';
      
      // Handle ISO string like 2026-01-26T00:00:00.000Z
      if (rawDate.includes('T')) return rawDate.split('T')[0];
      
      // Handle DD.MM.YYYY
      if (rawDate.includes('.') && rawDate.length === 10) {
          const parts = rawDate.split('.');
          if (parts.length === 3) {
             return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
      }
      
      return rawDate;
  };

  // Helper to sum a specific column across data array
  const sumColumn = (data: any[], key: string) => {
      return data.reduce((acc, item) => {
          // Robust key checking: exact, Title Case, UPPER CASE, lower case
          const titleCaseKey = key.charAt(0).toUpperCase() + key.slice(1);
          
          let val = item[key] 
                 || item[titleCaseKey]      // e.g. 'Cash'
                 || item[key.toUpperCase()] // e.g. 'CASH'
                 || item[key.toLowerCase()]; // e.g. 'cash'
          
          // Fallback for Credit/Nisye synonyms
          if (key === 'credit' && (val === undefined || val === null)) {
              val = item['Nisye'] || item['NISYE'] || item['Credit'] || item['CREDIT'];
          }

          // Handle potential string formatting '120,50'
          if (typeof val === 'string') {
             val = val.replace(/\s/g, '').replace(',', '.');
          }
          return acc + (Number(val) || 0);
      }, 0);
  };

  // 1. Daily Stats (Today)
  const dailySalesData = salesData.filter(s => processDate(s) === todayString);
  
  const dailyCash = sumColumn(dailySalesData, 'cash');
  const dailyCard = sumColumn(dailySalesData, 'card');
  const dailyBank = sumColumn(dailySalesData, 'bank');
  const dailyNisye = sumColumn(dailySalesData, 'credit');

  // 2. Monthly Stats (Current Month - based on all fetched data)
  const monthlyCash = sumColumn(salesData, 'cash');
  const monthlyCard = sumColumn(salesData, 'card');
  const monthlyBank = sumColumn(salesData, 'bank');
  const monthlyNisye = sumColumn(salesData, 'credit');

  // 3. Top / Worst Products Logic (Real Data)
  const top5 = [...productStats].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 5);
  
  const worst5 = [...productStats]
                    .filter(p => p.totalQuantity >= 0) 
                    .sort((a, b) => a.totalQuantity - b.totalQuantity)
                    .slice(0, 5);

  const dataDaily = [
    { name: t('cash'), value: dailyCash, color: '#10B981' },
    { name: t('card'), value: dailyCard, color: '#3B82F6' },
    { name: t('bank'), value: dailyBank, color: '#F59E0B' },
    { name: t('nisye'), value: dailyNisye, color: '#EF4444' },
  ];

  const dataMonthly = [
    { name: t('cash'), value: monthlyCash },
    { name: t('card'), value: monthlyCard },
    { name: t('bank'), value: monthlyBank },
    { name: t('nisye'), value: monthlyNisye },
  ];

  const CardKPI = ({ title, cash, card, bank, nisye, icon: Icon }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        <Icon className="text-slate-400" />
      </div>
      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
         <div className="border-r border-slate-100 dark:border-slate-700 pr-2">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{t('cash')}</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
                {loading ? '...' : `₼${cash.toLocaleString()}`}
            </p>
         </div>
         <div className="pl-2">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{t('card')}</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 truncate">
                {loading ? '...' : `₼${card.toLocaleString()}`}
            </p>
         </div>
         <div className="border-r border-slate-100 dark:border-slate-700 pr-2 border-t pt-2">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{t('bank')}</p>
            <p className="text-xl font-bold text-amber-500 dark:text-amber-400 truncate">
                {loading ? '...' : `₼${bank.toLocaleString()}`}
            </p>
         </div>
         <div className="pl-2 border-t border-slate-100 dark:border-slate-700 pt-2">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{t('nisye')}</p>
            <p className="text-xl font-bold text-red-500 dark:text-red-400 truncate">
                {loading ? '...' : `₼${nisye.toLocaleString()}`}
            </p>
         </div>
      </div>
    </div>
  );

  // --- Mobile Menu Configuration ---
  const menuItems = [
    { key: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, color: 'bg-blue-500', link: null, action: () => setMobileView('stats') },
    { key: 'sales', label: t('sales_report'), icon: FileText, color: 'bg-emerald-500', link: '/sales' },
    { key: 'purchases', label: t('purchase_report'), icon: ShoppingCart, color: 'bg-amber-500', link: '/purchases' },
    { key: 'profit', label: t('profit_report'), icon: TrendingUp, color: 'bg-violet-500', link: '/profit' },
    { key: 'payments', label: t('payment_report'), icon: CreditCard, color: 'bg-cyan-500', link: '/payments' },
    { key: 'sale_refund', label: t('sale_refund_report'), icon: RefreshCcw, color: 'bg-rose-500', link: '/sale-refund' },
    { key: 'stock', label: t('stock_report'), icon: Package, color: 'bg-indigo-500', link: '/stock' },
    { key: 'admin_users', label: t('admin_panel'), icon: Users, color: 'bg-slate-600', link: '/admin', customCheck: () => permissions.some(p => p.startsWith('admin_')) },
  ];

  return (
    <div className="space-y-6">
      
      {/* Mobile Menu Grid (Visible only on mobile AND menu view) */}
      <div className={`md:hidden ${mobileView === 'menu' ? 'block' : 'hidden'} animate-in fade-in`}>
          <div className="grid grid-cols-3 gap-4">
             {menuItems.map(item => {
                // Check permissions
                if (item.key !== 'dashboard' && item.key !== 'admin_users' && !permissions.includes(item.key)) return null;
                if (item.customCheck && !item.customCheck()) return null;

                return (
                  <button
                    key={item.key}
                    onClick={() => {
                        if (item.action) item.action();
                        else if (item.link) navigate(item.link);
                    }}
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform h-32"
                  >
                     <div className={`${item.color} text-white p-3 rounded-xl mb-3 shadow-md`}>
                        <item.icon size={28} />
                     </div>
                     <span className="text-xs font-semibold text-center text-slate-700 dark:text-slate-200 leading-tight">
                        {item.label}
                     </span>
                  </button>
                )
             })}
          </div>
      </div>

      {/* Stats View (Visible on Desktop OR when toggled on Mobile) */}
      <div className={`md:block ${mobileView === 'stats' ? 'block' : 'hidden'}`}>
        
        {/* Mobile Back Button */}
        <div className="md:hidden mb-4">
            <button 
                onClick={() => setMobileView('menu')} 
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium p-2 -ml-2 rounded-lg active:bg-slate-100 dark:active:bg-slate-800"
            >
                <ChevronLeft size={20} /> 
                {t('previous')}
            </button>
        </div>

        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('dashboard')}</h1>
            <div className="text-xs text-slate-400 font-mono hidden md:block">
                {/* Debug info */}
                API Sync: {user?.voen} | {startOfMonthString} - {endOfMonthString}
            </div>
        </div>
        
        {/* Sales KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <CardKPI 
                title={t('daily_sales')} 
                cash={dailyCash} 
                card={dailyCard} 
                bank={dailyBank}
                nisye={dailyNisye}
                icon={TrendingUp} 
            />
            <CardKPI 
                title={t('monthly_sales')} 
                cash={monthlyCash} 
                card={monthlyCard} 
                bank={monthlyBank}
                nisye={monthlyNisye}
                icon={Banknote} 
            />
        </div>

        {/* Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-80">
            <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">{t('daily_sales')}</h3>
            {(dailyCash + dailyCard + dailyBank + dailyNisye) === 0 && !loading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No sales data for today</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={dataDaily}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                >
                    {dataDaily.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => `₼${Number(value).toLocaleString()}`} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                <Legend />
                </PieChart>
            </ResponsiveContainer>
            )}
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-80">
                <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">{t('monthly_sales')}</h3>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataMonthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" tick={{fill: '#94a3b8'}} />
                    <YAxis tick={{fill: '#94a3b8'}} />
                    <Tooltip formatter={(value) => `₼${Number(value).toLocaleString()}`} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                        {dataMonthly.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={
                                index === 0 ? '#10B981' : // Cash
                                index === 1 ? '#3B82F6' : // Card
                                index === 2 ? '#F59E0B' : // Bank
                                '#EF4444' // Nisye
                            } />
                        ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Top/Worst Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Top 5 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-green-500" size={20} />
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">{t('top_products')}</h3>
            </div>
            <div className="space-y-3">
                {loading ? <p className="text-sm text-slate-400">Loading...</p> : top5.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-700 pb-2 last:border-0">
                    <span className="flex-1 font-medium text-slate-600 dark:text-slate-300 truncate mr-2">{i+1}. {p.name}</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        {Number(Number(p.totalQuantity).toFixed(2))} {t('quantity')}
                    </span>
                </div>
                ))}
                {!loading && top5.length === 0 && <p className="text-sm text-slate-400 italic">No sales data found.</p>}
            </div>
            </div>

            {/* Worst 5 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="text-red-500" size={20} />
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">{t('worst_products')}</h3>
            </div>
            <div className="space-y-3">
                {loading ? <p className="text-sm text-slate-400">Loading...</p> : worst5.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-700 pb-2 last:border-0">
                    <span className="flex-1 font-medium text-slate-600 dark:text-slate-300 truncate mr-2">{i+1}. {p.name}</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                        {Number(Number(p.totalQuantity).toFixed(2))} {t('quantity')}
                    </span>
                </div>
                ))}
                {!loading && worst5.length === 0 && <p className="text-sm text-slate-400 italic">No sales data found.</p>}
            </div>
            </div>
        </div>
      </div>

    </div>
  );
};
