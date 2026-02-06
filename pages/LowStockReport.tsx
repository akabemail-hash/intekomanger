import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MOCK_PRODUCTS, LOGO_URL } from '../constants';
import { AlertTriangle, Download, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { getBase64ImageFromURL } from '../utils/reportUtils';

export const LowStockReport: React.FC = () => {
  const { t, language } = useLanguage();
  const [threshold, setThreshold] = useState<number>(5);

  const lowStockProducts = MOCK_PRODUCTS.filter(p => p.stock < threshold);

  const handlePdfExport = async () => {
    const doc = new jsPDF();
    
    // Fetch Font
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
        console.error("Font error", e);
        await generatePdfContent(doc);
    }
  };

  const generatePdfContent = async (doc: jsPDF) => {
    const logoData = await getBase64ImageFromURL(LOGO_URL);

    if (logoData) {
        doc.addImage(logoData, 'PNG', 14, 10, 30, 10); 
    } else {
        doc.setFontSize(18);
        doc.text("INTEKO", 14, 20);
    }
    
    doc.setFontSize(14);
    doc.text(t('low_stock'), 14, 30);
    doc.setFontSize(10);
    doc.text(`${t('generated_date')}: ${new Date().toLocaleDateString(language === 'en' ? 'en-US' : (language === 'tr' ? 'tr-TR' : (language === 'ru' ? 'ru-RU' : 'az-AZ')))}`, 14, 36);
    doc.text(`${t('threshold_filter')}: < ${threshold}`, 14, 42);

    const tableBody = lowStockProducts.map(p => [
        p.name,
        p.group,
        p.stock.toString()
    ]);

    autoTable(doc, {
        startY: 50,
        head: [[t('product'), t('group'), t('items_left')]],
        body: tableBody,
        theme: 'striped',
        styles: { font: 'Roboto', fontStyle: 'normal' },
        headStyles: { fillColor: [220, 38, 38], font: 'Roboto' } // Red header for alert
    });

    doc.save(`low_stock_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExcelExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Low Stock Report');

    // Add Logo
    const logoDataUrl = await getBase64ImageFromURL(LOGO_URL);
    if (logoDataUrl) {
        const logoId = workbook.addImage({
            base64: logoDataUrl,
            extension: 'png',
        });
        worksheet.addImage(logoId, {
            tl: { col: 0, row: 0 },
            ext: { width: 120, height: 40 }
        });
    } else {
        worksheet.getCell('A1').value = "INTEKO";
    }

    // Title & Date
    worksheet.mergeCells('A4:D4');
    const titleCell = worksheet.getCell('A4');
    titleCell.value = `${t('low_stock')} ( < ${threshold} )`;
    titleCell.font = { name: 'Arial', size: 16, bold: true };
    
    worksheet.mergeCells('A5:D5');
    const dateCell = worksheet.getCell('A5');
    dateCell.value = `${t('generated_date')}: ${new Date().toLocaleDateString(language === 'en' ? 'en-US' : (language === 'tr' ? 'tr-TR' : (language === 'ru' ? 'ru-RU' : 'az-AZ')))}`;
    dateCell.font = { name: 'Arial', size: 10, italic: true };

    // Headers
    const headerRow = worksheet.getRow(7);
    headerRow.values = [t('product'), t('group'), t('items_left')];
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDC2626' } // Red-600
        };
    });
    
    // Data
    lowStockProducts.forEach((p) => {
        worksheet.addRow([
            p.name,
            p.group,
            p.stock
        ]);
    });

    // Column widths
    worksheet.columns = [
        { width: 25 },
        { width: 15 },
        { width: 15 },
    ];

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `low_stock_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('low_stock')}</h1>
        <div className="flex gap-2">
            <button 
                onClick={handleExcelExport}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
                <FileSpreadsheet size={18} />
                Excel
            </button>
            <button 
                onClick={handlePdfExport}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
                <Download size={18} />
                PDF
            </button>
        </div>
      </div>

      {/* Threshold Filter */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-end gap-4 max-w-md">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('threshold')}</label>
          <input 
            type="number" 
            min="1"
            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white p-2 text-sm"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            {t('no_low_stock').replace('5', threshold.toString())}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lowStockProducts.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-l-4 border-l-red-500 border-slate-100 dark:border-slate-700 p-6 flex items-start justify-between">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">{p.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{p.group}</p>
                </div>
                <div className="text-right">
                    <span className="block text-3xl font-bold text-red-600 dark:text-red-500">{p.stock}</span>
                    <span className="text-xs text-red-500 dark:text-red-400 font-medium">{t('items_left')}</span>
                </div>
            </div>
        ))}
      </div>
      
      {lowStockProducts.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <AlertTriangle className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('stock_healthy')}</h3>
              <p className="text-slate-500 dark:text-slate-400">{t('no_low_stock')}</p>
          </div>
      )}
    </div>
  );
};