import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LOGO_URL } from '../constants';
import { Download, FileSpreadsheet, ChevronLeft, ChevronRight, Package, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { getBase64ImageFromURL } from '../utils/reportUtils';

export const StockReport: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  // Filters
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');

  // Data State
  const [rawData, setRawData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  
  // Dynamic Columns State
  const [columns, setColumns] = useState<string[]>([]);

  // Logic Keys
  const [productKey, setProductKey] = useState<string>('');
  const [supplierKey, setSupplierKey] = useState<string>('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Uniques for Dropdowns
  const [uniqueProducts, setUniqueProducts] = useState<string[]>([]);
  const [uniqueSuppliers, setUniqueSuppliers] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

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

  useEffect(() => {
      const fetchData = async () => {
          if (!user?.voen) return;
          
          setLoading(true);
          setErrorMsg('');
          
          try {
           //   console.log(`Fetching stock for ${user.voen}`);
              const data = await api.reports.fetchStock(user.voen);
         //     console.log('Fetched stock data:', data);
              
              if (data && data.length > 0) {
                  const firstItem = data[0];
                  const cols = Object.keys(firstItem);
                  setColumns(cols);

                  // Identify logic keys
                  const pKey = findKey(firstItem, ['ProductName', 'productName', 'Name']);
                  const sKey = findKey(firstItem, ['SupplierName', 'supplierName', 'Supplier']);
                  
                  if (pKey) setProductKey(pKey);
                  if (sKey) setSupplierKey(sKey);

                  // Extract Uniques
                  if (pKey) {
                      setUniqueProducts(Array.from(new Set(data.map((i: any) => i[pKey]))).filter(Boolean).sort() as string[]);
                  }
                  if (sKey) {
                      setUniqueSuppliers(Array.from(new Set(data.map((i: any) => i[sKey]))).filter(Boolean).sort() as string[]);
                  }

                  setRawData(data);
                  setFilteredData(data); // Initial set
              } else {
                  setRawData([]);
                  setFilteredData([]);
                  setColumns([]);
              }
          } catch (e: any) {
              console.error("Failed to fetch stock report", e);
              setErrorMsg(e.message || "Failed to load data");
              setRawData([]);
              setFilteredData([]);
          } finally {
              setLoading(false);
          }
      };

      fetchData();
  }, [user?.voen]);

  // Filter Effect
  useEffect(() => {
      let res = [...rawData];

      if (selectedProduct !== 'all' && productKey) {
          res = res.filter(item => item[productKey] === selectedProduct);
      }
      
      if (selectedSupplier !== 'all' && supplierKey) {
          res = res.filter(item => item[supplierKey] === selectedSupplier);
      }

      setFilteredData(res);
      setCurrentPage(1); // Reset to first page on filter change
  }, [rawData, selectedProduct, selectedSupplier, productKey, supplierKey]);

  // Pagination Effect
  useEffect(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setDisplayedData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage, itemsPerPage]);

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
      if (value === null || value === undefined) return '';
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
    
    doc.setFontSize(14); doc.text(t('stock_report'), 14, 30);
    doc.setFontSize(10); doc.text(`${t('generated_date')}: ${new Date().toLocaleDateString()}`, 14, 36);

    const headers = columns.map(c => translateHeader(c));
    const tableBody = filteredData.map(row => columns.map(col => formatCellValue(col, row[col])));

    autoTable(doc, {
        startY: 45,
        head: [headers],
        body: tableBody,
        theme: 'striped',
        styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 8 },
        headStyles: { fillColor: [79, 70, 229], font: 'Roboto' } // Indigo
    });

    doc.save(`stock_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExcelExport = async () => {
    if (filteredData.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Report');

    const logoDataUrl = await getBase64ImageFromURL(LOGO_URL);
    if (logoDataUrl) {
        const logoId = workbook.addImage({ base64: logoDataUrl, extension: 'png' });
        worksheet.addImage(logoId, { tl: { col: 0, row: 0 }, ext: { width: 120, height: 40 } });
    } else {
        worksheet.getCell('A1').value = "INTEKO";
    }

    worksheet.mergeCells('A4:F4');
    worksheet.getCell('A4').value = t('stock_report');
    worksheet.getCell('A4').font = { size: 16, bold: true };
    
    const headerRow = worksheet.getRow(7);
    headerRow.values = columns.map(c => translateHeader(c));
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
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
    a.href = url; a.download = `stock_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('stock_report')}</h1>
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
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Download size={18} /> PDF
                </button>
            </div>
          )}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('product')}</label>
              <select 
                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white p-2 text-sm disabled:opacity-50"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                disabled={loading || rawData.length === 0 || !productKey}
              >
                <option value="all">{t('all_products')}</option>
                {uniqueProducts.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('suppliername')}</label>
              <select 
                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white p-2 text-sm disabled:opacity-50"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                disabled={loading || rawData.length === 0 || !supplierKey}
              >
                <option value="all">{t('all_suppliers')}</option>
                {uniqueSuppliers.map(s => (
                  <option key={s} value={s}>{s}</option>
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
      
      {loading && !errorMsg && (
          <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600 mb-4"></div>
              <p className="text-slate-500">Loading stock data...</p>
          </div>
      )}

      {!loading && displayedData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                    <thead className="text-xs text-slate-700 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className="px-6 py-3 whitespace-nowrap">
                                {translateHeader(col)}
                            </th>
                        ))}
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
                    </tbody>
                </table>
                </div>

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
          </div>
      )}
      
      {!loading && !errorMsg && displayedData.length === 0 && (
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-12 text-center">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                   <Package className="text-slate-400" size={32} />
               </div>
               <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('stock_report')}</h3>
               <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                   {t('no_records')}
               </p>
           </div>
      )}
    </div>
  );
};
