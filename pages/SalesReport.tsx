import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LOGO_URL } from '../constants';
import { Download, FileSpreadsheet, Search, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { getBase64ImageFromURL } from '../utils/reportUtils';

export const SalesReport: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');

  // Data State
  const [rawData, setRawData] = useState<any[]>([]); 
  const [filteredData, setFilteredData] = useState<any[]>([]); 
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  
  // Dynamic Columns State
  const [columns, setColumns] = useState<string[]>([]);
  
  // Specific keys for logic (Filtering/Totaling)
  const [productKey, setProductKey] = useState<string>('');
  const [groupKey, setGroupKey] = useState<string>('');
  const [totalKey, setTotalKey] = useState<string>('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uniqueProducts, setUniqueProducts] = useState<string[]>([]);
  const [uniqueGroups, setUniqueGroups] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Helper to find key case-insensitively or exact match
  const findKey = (obj: any, candidates: string[]): string | undefined => {
      if (!obj) return undefined;
      const keys = Object.keys(obj);
      for (const candidate of candidates) {
          if (keys.includes(candidate)) return candidate;
          const found = keys.find(k => k.toLowerCase() === candidate.toLowerCase());
          if (found) return found;
      }
      return undefined;
  };

  const handleSearch = async () => {
      if (!startDate || !endDate || !user?.voen) {
          alert(t('select_dates_first'));
          return;
      }

      setLoading(true);
      setHasSearched(true);
      setErrorMsg('');
      setCurrentPage(1);
      
      // Reset logic keys
      setProductKey('');
      setGroupKey('');
      setTotalKey('');

      try {
          console.log(`Searching sales for ${user.voen} from ${startDate} to ${endDate}`);
          const data = await api.reports.fetchSalesDetails(user.voen, startDate, endDate);
          console.log('Fetched data:', data);
          
          if (data && data.length > 0) {
              // 1. Detect Columns & Keys
              const firstItem = data[0];
              let cols = Object.keys(firstItem);
              
              // Conditional Filter: Only show "Doctor" column if customer_type is "clinic"
              if (user?.customer_type !== 'clinic') {
                  const doctorKeywords = ['DoctorName', 'doctorName', 'doctorname', 'Doctor', 'doctor', 'HekimAdi', 'hekimadi', 'Hekim', 'hekim', 'Həkim adı', 'Həkim', 'Doktor'];
                  cols = cols.filter(col => !doctorKeywords.some(k => k.toLowerCase() === col.toLowerCase()));
              }

              setColumns(cols);

              // 2. Logic Keys
              const pKey = findKey(firstItem, ['ProductName', 'productName', 'malinadi', 'Name']);
              const gKey = findKey(firstItem, ['CategoryName', 'categoryName', 'ProductGroup', 'group', 'qrup']);
              const tKey = findKey(firstItem, ['TotalAmount', 'totalAmount', 'Total', 'amount', 'mebleg']);

              if (pKey) setProductKey(pKey);
              if (gKey) setGroupKey(gKey);
              if (tKey) setTotalKey(tKey);

              // 3. Extract Uniques
              if (pKey) {
                  const products = Array.from(new Set(data.map((i: any) => i[pKey]))).filter(Boolean).sort() as string[];
                  setUniqueProducts(products);
              } else {
                  setUniqueProducts([]);
              }

              if (gKey) {
                  const groups = Array.from(new Set(data.map((i: any) => i[gKey]))).filter(Boolean).sort() as string[];
                  setUniqueGroups(groups);
              } else {
                  setUniqueGroups([]);
              }

              setRawData(data);
              // We do NOT set filteredData here manually anymore to avoid race conditions. 
              // The useEffect below will handle it when rawData updates.
          } else {
              setRawData([]);
              setFilteredData([]);
              setColumns([]);
          }
      } catch (e: any) {
          console.error("Failed to fetch report", e);
          setErrorMsg(e.message || "Failed to load data");
          setRawData([]);
          setFilteredData([]);
      } finally {
          setLoading(false);
      }
  };

  // Filter Effect - Runs when rawData or filters change
  useEffect(() => {
      let res = [...rawData];

      if (selectedProduct !== 'all' && productKey) {
          res = res.filter(item => item[productKey] === selectedProduct);
      }

      if (selectedGroup !== 'all' && groupKey) {
          res = res.filter(item => item[groupKey] === selectedGroup);
      }

      setFilteredData(res);
      // We don't reset currentPage here to prevent jumping on data refresh if not needed,
      // but usually reset is good UI practice on filter change.
  }, [rawData, selectedProduct, selectedGroup, productKey, groupKey]);

  // Pagination Effect
  useEffect(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setDisplayedData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage, itemsPerPage]);

  // Sum Logic
  const totalSalesAmount = totalKey 
    ? filteredData.reduce((acc, curr) => acc + (Number(curr[totalKey]) || 0), 0) 
    : 0;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const translateHeader = (header: string) => {
      const key = header.toLowerCase();
      const translated = t(key);
      if (translated === key) {
          return header.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      }
      return translated;
  };

  const formatCellValue = (header: string, value: any) => {
      if (!value) return '';
      if (header.toLowerCase().includes('date') || header.toLowerCase() === 'tarix') {
          try {
             // Handle ISO Strings specifically (remove T and Z)
             if (typeof value === 'string' && value.includes('T')) {
                 const d = new Date(value);
                 if (!isNaN(d.getTime())) {
                      return d.toLocaleDateString(language === 'en' ? 'en-US' : (language === 'tr' ? 'tr-TR' : (language === 'ru' ? 'ru-RU' : 'az-AZ'))) + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
                 }
             }
             return String(value).split('T')[0]; // Simple fallback
          } catch (e) {}
      }
      return String(value);
  };

  // --- Export Logic ---
  const handlePdfExport = async () => {
    if (filteredData.length === 0) return;
    const doc = new jsPDF('l');

    try {
        const fontResponse = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf');
        const fontBlob = await fontResponse.blob();
        const reader = new FileReader();
        
        reader.onloadend = async () => {
            const base64data = reader.result?.toString().split(',')[1];
            if (base64data) {
                doc.addFileToVFS('Roboto-Regular.ttf', base64data);
                doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
                doc.setFont('Roboto');
                await generatePdfContent(doc);
            }
        };
        reader.readAsDataURL(fontBlob);
    } catch (e) {
        console.error("Font loading failed", e);
        await generatePdfContent(doc);
    }
  };

  const generatePdfContent = async (doc: jsPDF) => {
    const logoData = await getBase64ImageFromURL(LOGO_URL);
    if (logoData) {
        doc.addImage(logoData, 'PNG', 14, 10, 30, 10); 
    } else {
        doc.setFontSize(18); doc.text("INTEKO", 14, 20);
    }
    
    doc.setFontSize(14); doc.text(t('sales_report'), 14, 30);
    doc.setFontSize(10); doc.text(`${t('generated_date')}: ${new Date().toLocaleDateString()}`, 14, 36);

    const headers = columns.map(c => translateHeader(c));
    const tableBody = filteredData.map(row => columns.map(col => formatCellValue(col, row[col])));

    autoTable(doc, {
        startY: 45,
        head: [headers],
        body: tableBody,
        theme: 'striped',
        styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235], font: 'Roboto' }
    });

    doc.save(`sales_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExcelExport = async () => {
    if (filteredData.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    const logoDataUrl = await getBase64ImageFromURL(LOGO_URL);
    if (logoDataUrl) {
        const logoId = workbook.addImage({ base64: logoDataUrl, extension: 'png' });
        worksheet.addImage(logoId, { tl: { col: 0, row: 0 }, ext: { width: 120, height: 40 } });
    } else {
        worksheet.getCell('A1').value = "INTEKO";
    }

    worksheet.mergeCells('A4:F4');
    worksheet.getCell('A4').value = t('sales_report');
    worksheet.getCell('A4').font = { size: 16, bold: true };
    
    const headerRow = worksheet.getRow(7);
    headerRow.values = columns.map(c => translateHeader(c));
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    });
    
    filteredData.forEach((row) => {
        const rowValues = columns.map(col => formatCellValue(col, row[col]));
        worksheet.addRow(rowValues);
    });

    worksheet.columns = columns.map(() => ({ width: 15 }));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `sales_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
  };

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('sales_report')}</h1>
          
          {filteredData.length > 0 && (
            <div className="flex gap-2">
                <button 
                    onClick={handleExcelExport}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <FileSpreadsheet size={18} /> Excel
                </button>
                <button 
                    onClick={handlePdfExport}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Download size={18} /> PDF
                </button>
            </div>
          )}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('start_date')}</label>
              <input 
                type="date" 
                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white p-2 text-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('end_date')}</label>
              <input 
                type="date" 
                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white p-2 text-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div>
                <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 h-[38px]"
                >
                    {loading ? (
                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Search size={16} />
                            {t('get_report')}
                        </>
                    )}
                </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('product')}</label>
              <select 
                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white p-2 text-sm disabled:opacity-50"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                disabled={!hasSearched || rawData.length === 0 || !productKey}
              >
                <option value="all">{t('all_products')}</option>
                {uniqueProducts.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('group')}</label>
              <select 
                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white p-2 text-sm disabled:opacity-50"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                disabled={!hasSearched || rawData.length === 0 || !groupKey}
              >
                <option value="all">{t('all_groups')}</option>
                {uniqueGroups.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
      </div>

      {errorMsg && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
          </div>
      )}

      {!hasSearched ? (
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-12 text-center">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
                   <Search className="text-blue-500" size={32} />
               </div>
               <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('sales_report')}</h3>
               <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                   {t('select_dates_first')}
               </p>
           </div>
      ) : (
        <>
            {totalKey && (
                <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md flex justify-between items-center animate-in fade-in slide-in-from-top-4">
                    <span className="font-medium text-blue-100">{t('total')}:</span>
                    <span className="text-2xl font-bold">₼{totalSalesAmount.toLocaleString()}</span>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                    <thead className="text-xs text-slate-700 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                        {columns.length > 0 ? columns.map((col, idx) => (
                            <th key={idx} className="px-6 py-3 whitespace-nowrap">
                                {translateHeader(col)}
                            </th>
                        )) : (
                           <th className="px-6 py-3">{t('no_records')}</th>
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {displayedData.map((row, rIdx) => (
                        <tr key={rIdx} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                            {columns.map((col, cIdx) => (
                                <td key={`${rIdx}-${cIdx}`} className="px-6 py-4 whitespace-nowrap">
                                    {formatCellValue(col, row[col])}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {displayedData.length === 0 && (
                        <tr>
                        <td colSpan={columns.length || 1} className="px-6 py-12 text-center text-slate-400">
                            {t('no_records')}
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>

                {filteredData.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {t('page')} <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> {t('of')} <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
      )}
    </div>
  );
};
