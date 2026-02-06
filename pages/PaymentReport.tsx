import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LOGO_URL } from '../constants';
import { Download, FileSpreadsheet, Search, ChevronLeft, ChevronRight, AlertCircle, CreditCard } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { getBase64ImageFromURL } from '../utils/reportUtils';

export const PaymentReport: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data State
  const [data, setData] = useState<any[]>([]); 
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  
  // Dynamic Columns State
  const [columns, setColumns] = useState<string[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const handleSearch = async () => {
      if (!startDate || !endDate || !user?.voen) {
          alert(t('select_dates_first'));
          return;
      }

      setLoading(true);
      setHasSearched(true);
      setErrorMsg('');
      setCurrentPage(1);

      try {
          console.log(`Searching payments for ${user.voen} from ${startDate} to ${endDate}`);
          const result = await api.reports.fetchPayments(user.voen, startDate, endDate);
          console.log('Fetched payment data:', result);
          
          if (result && result.length > 0) {
              const firstItem = result[0];
              const cols = Object.keys(firstItem);
              setColumns(cols);
              setData(result);
          } else {
              setData([]);
              setColumns([]);
          }
      } catch (e: any) {
          console.error("Failed to fetch payment report", e);
          setErrorMsg(e.message || "Failed to load data");
          setData([]);
      } finally {
          setLoading(false);
      }
  };

  // Pagination Effect
  useEffect(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setDisplayedData(data.slice(startIndex, endIndex));
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Helper to sum columns robustly
  const sumColumn = (key: string) => {
      return data.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
  };

  const totalCash = sumColumn('Cash');
  const totalCard = sumColumn('Card');
  const totalBank = sumColumn('Bank');
  const totalCredit = sumColumn('Credit');

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
             if (typeof value === 'string' && value.includes('T')) {
                 const d = new Date(value);
                 if (!isNaN(d.getTime())) {
                      return d.toLocaleDateString(language === 'en' ? 'en-US' : (language === 'tr' ? 'tr-TR' : (language === 'ru' ? 'ru-RU' : 'az-AZ')));
                 }
             }
             return String(value).split('T')[0];
          } catch (e) {}
      }
      return String(value);
  };

  // --- Export Logic ---
  const handlePdfExport = async () => {
    if (data.length === 0) return;
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
    
    doc.setFontSize(14); doc.text(t('payment_report'), 14, 30);
    doc.setFontSize(10); doc.text(`${t('generated_date')}: ${new Date().toLocaleDateString()}`, 14, 36);

    const headers = columns.map(c => translateHeader(c));
    const tableBody = data.map(row => columns.map(col => formatCellValue(col, row[col])));

    autoTable(doc, {
        startY: 45,
        head: [headers],
        body: tableBody,
        theme: 'striped',
        styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246], font: 'Roboto' } // Blue
    });

    doc.save(`payment_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExcelExport = async () => {
    if (data.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payment Report');

    const logoDataUrl = await getBase64ImageFromURL(LOGO_URL);
    if (logoDataUrl) {
        const logoId = workbook.addImage({ base64: logoDataUrl, extension: 'png' });
        worksheet.addImage(logoId, { tl: { col: 0, row: 0 }, ext: { width: 120, height: 40 } });
    } else {
        worksheet.getCell('A1').value = "INTEKO";
    }

    worksheet.mergeCells('A4:F4');
    worksheet.getCell('A4').value = t('payment_report');
    worksheet.getCell('A4').font = { size: 16, bold: true };
    
    const headerRow = worksheet.getRow(7);
    headerRow.values = columns.map(c => translateHeader(c));
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
    });
    
    data.forEach((row) => {
        const rowValues = columns.map(col => formatCellValue(col, row[col]));
        worksheet.addRow(rowValues);
    });

    worksheet.columns = columns.map(() => ({ width: 15 }));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `payment_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
  };

  const SummaryCard = ({ title, amount, colorClass }: { title: string, amount: number, colorClass: string }) => (
      <div className={`p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col`}>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</span>
          <span className={`text-2xl font-bold ${colorClass}`}>₼{amount.toLocaleString()}</span>
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('payment_report')}</h1>
          {data.length > 0 && (
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
                   <CreditCard className="text-blue-500" size={32} />
               </div>
               <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('payment_report')}</h3>
               <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                   {t('select_dates_first')}
               </p>
           </div>
      ) : (
        <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4">
                <SummaryCard title={t('cash')} amount={totalCash} colorClass="text-emerald-600 dark:text-emerald-400" />
                <SummaryCard title={t('card')} amount={totalCard} colorClass="text-blue-600 dark:text-blue-400" />
                <SummaryCard title={t('bank')} amount={totalBank} colorClass="text-amber-600 dark:text-amber-400" />
                <SummaryCard title={t('credit')} amount={totalCredit} colorClass="text-red-600 dark:text-red-400" />
            </div>

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

                {data.length > 0 && (
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