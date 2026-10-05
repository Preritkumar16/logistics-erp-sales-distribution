import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, InventoryItem, AnalyticsOverview, Customer } from '../types';

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportOrdersToCsv(orders: Order[]) {
  const headers = ['Order ID', 'Customer', 'Date', 'Status', 'Total Amount', 'Region', 'Carrier', 'Waybill No', 'Item Summary'];
  const rows = orders.map(o => [
    o.id,
    `"${o.customerName.replace(/"/g, '""')}"`,
    o.date,
    o.status,
    `"$${o.totalAmount.toFixed(2)}"`,
    o.region,
    o.carrier || 'N/A',
    o.waybillNo || 'N/A',
    `"${o.itemSummary}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadBlob(csvContent, `ERP_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportInventoryToCsv(items: InventoryItem[], warehouseName = 'All Facilities') {
  const headers = ['SKU', 'Product Name', 'Category', 'Warehouse', 'In Stock', 'Committed', 'Incoming', 'Unit Cost', 'Status', 'Last Synced'];
  const rows = items.map(i => [
    i.sku,
    `"${i.name.replace(/"/g, '""')}"`,
    i.category,
    `"${i.warehouseName.replace(/"/g, '""')}"`,
    i.inStock,
    i.committed,
    i.incoming,
    `"$${i.unitCost.toFixed(2)}"`,
    i.status,
    i.lastSyncDate,
  ]);

  const csvContent = [`# Inventory Report - ${warehouseName}`, headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadBlob(csvContent, `ERP_Inventory_Stock_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportAnalyticsToCsv(analytics: AnalyticsOverview) {
  let content = 'ERP SALES & DISTRIBUTION - ANALYTICS REPORT\n';
  content += `Generated: ${new Date().toLocaleString()}\n\n`;
  content += 'EXECUTIVE PERFORMANCE KPIS\n';
  content += `Total Revenue,$${analytics.kpis.totalRevenue.toLocaleString()}\n`;
  content += `Active Orders,${analytics.kpis.activeOrders.toLocaleString()}\n`;
  content += `Avg Fulfillment Time,${analytics.kpis.avgFulfillmentDays} days\n`;
  content += `Customer Satisfaction,${analytics.kpis.customerSatisfactionPct}%\n\n`;

  content += 'SALES FORECASTING\n';
  content += 'Month,Actual ($),Projected ($)\n';
  analytics.salesForecasting.forEach(f => {
    content += `${f.month},${f.actualAmount || ''},${f.projectedAmount || ''}\n`;
  });

  content += '\nREGIONAL PERFORMANCE MATRIX (VOLUME)\n';
  content += 'Region,Electronics,Apparel,Home Goods,Industrial\n';
  analytics.regionalHeatmap.rows.forEach(r => {
    const vals = r.categories.map(c => c.rating).join(',');
    content += `${r.region},${vals}\n`;
  });

  downloadBlob(content, `ERP_Analytics_Summary_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportOrdersToPdf(orders: Order[], title = 'Sales Orders Master Report') {
  const doc = new jsPDF();

  // Header banner
  doc.setFillColor(0, 88, 190);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LOGISTICS ERP', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Sales & Distribution Real-Time Management System', 14, 18);

  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, 196, 15, { align: 'right' });

  // Document Title
  doc.setTextColor(27, 27, 29);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 36);

  const totalVolume = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(69, 70, 77);
  doc.text(`Total Records: ${orders.length} | Cumulative Value: $${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 14, 43);

  // Table
  const tableData = orders.map(o => [
    o.id,
    o.customerName,
    o.date,
    o.status,
    `$${o.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    o.region,
    o.waybillNo || 'Pending',
  ]);

  autoTable(doc, {
    startY: 48,
    head: [['Order ID', 'Customer', 'Date', 'Status', 'Amount', 'Region', '3PL Waybill']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [19, 27, 46],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [27, 27, 29],
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [0, 88, 190] },
      4: { halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [246, 243, 245],
    },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(118, 119, 125);
    doc.text(`Confidential - For Internal ERP Operations Only | Page ${i} of ${pageCount}`, 105, 288, { align: 'center' });
  }

  doc.save(`ERP_Orders_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportAnalyticsToPdf(analytics: AnalyticsOverview) {
  const doc = new jsPDF();

  // Header banner
  doc.setFillColor(0, 88, 190);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LOGISTICS ERP', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Sales & Distribution Deep-Dive Performance Report', 14, 18);

  doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, 196, 15, { align: 'right' });

  // Title
  doc.setTextColor(27, 27, 29);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Performance & Regional Heatmap', 14, 36);

  // KPI Summary boxes
  doc.setFillColor(246, 243, 245);
  doc.roundedRect(14, 42, 42, 22, 2, 2, 'F');
  doc.roundedRect(60, 42, 42, 22, 2, 2, 'F');
  doc.roundedRect(106, 42, 42, 22, 2, 2, 'F');
  doc.roundedRect(152, 42, 44, 22, 2, 2, 'F');

  doc.setFontSize(7);
  doc.setTextColor(69, 70, 77);
  doc.text('TOTAL REVENUE', 18, 48);
  doc.text('ACTIVE ORDERS', 64, 48);
  doc.text('AVG FULFILLMENT', 110, 48);
  doc.text('CSAT SCORE', 156, 48);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 88, 190);
  doc.text(`$${((analytics.kpis?.totalRevenue || 1200000) / 1000000).toFixed(1)}M`, 18, 58);
  doc.setTextColor(27, 27, 29);
  doc.text((analytics.kpis?.activeOrders || 3482).toLocaleString(), 64, 58);
  doc.text(`${analytics.kpis?.avgFulfillmentDays || 2.4} Days`, 110, 58);
  doc.text(`${analytics.kpis?.customerSatisfactionPct || 94}%`, 156, 58);

  // Section 1: Forecasting
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 27, 29);
  doc.text('Sales Forecasting Trajectory', 14, 76);

  const forecastData = (analytics.salesForecasting || []).map(f => [
    f.month,
    f.actualAmount ? `$${f.actualAmount.toLocaleString()}` : 'N/A',
    f.projectedAmount ? `$${f.projectedAmount.toLocaleString()} (Projected)` : 'N/A',
    f.actualAmount ? 'Confirmed' : 'Forecast Model',
  ]);

  autoTable(doc, {
    startY: 82,
    head: [['Month', 'Actual Revenue', 'Projected Target', 'Validation Status']],
    body: forecastData,
    theme: 'grid',
    headStyles: { fillColor: [19, 27, 46], textColor: [255, 255, 255] },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  // Section 2: Regional Performance Heatmap
  const lastY = (doc as any).lastAutoTable?.finalY || 140;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Regional Category Performance Matrix', 14, lastY + 12);

  const matrixData = (analytics.regionalHeatmap?.rows || []).map(r => [
    r.region,
    r.categories[0]?.rating || 'Med',
    r.categories[1]?.rating || 'Med',
    r.categories[2]?.rating || 'Med',
    r.categories[3]?.rating || 'Med',
  ]);

  autoTable(doc, {
    startY: lastY + 16,
    head: [['Region / Territory', 'Electronics', 'Apparel', 'Home Goods', 'Industrial']],
    body: matrixData,
    theme: 'grid',
    headStyles: { fillColor: [0, 88, 190], textColor: [255, 255, 255] },
    styles: { fontSize: 8, cellPadding: 4, halign: 'center' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
  });

  doc.save(`ERP_Analytics_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportOrderInvoiceSlip(order: Order) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(0, 88, 190);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNMENT PACKING SLIP & INVOICE', 14, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order Number: ${order.id} | Date: ${order.date}`, 14, 21);

  // Customer Info Box
  doc.setTextColor(27, 27, 29);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNEE DETAILS:', 14, 38);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Customer: ${order.customerName} (${order.customerId})`, 14, 45);
  doc.text(`Shipping Address: ${order.shippingAddress}`, 14, 51);
  doc.text(`Region: ${order.region} | Warehouse Hub: ${order.warehouseId}`, 14, 57);
  doc.text(`3PL Carrier: ${order.carrier || 'Pending Dispatch'} | Waybill: ${order.waybillNo || 'Unassigned'}`, 14, 63);

  // Line items table
  const itemsData = (order.items || []).map(itm => [
    itm.sku,
    itm.name,
    itm.quantity.toString(),
    `$${itm.unitPrice.toFixed(2)}`,
    `$${itm.totalPrice.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 70,
    head: [['SKU', 'Item Description', 'Qty', 'Unit Price', 'Total']],
    body: itemsData,
    theme: 'grid',
    headStyles: { fillColor: [19, 27, 46], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [0, 88, 190] },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right', fontStyle: 'bold' },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 130;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Grand Total: $${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 196, finalY + 12, { align: 'right' });

  doc.save(`Packing_Slip_${order.id}.pdf`);
}

export const exportUtils = {
  exportOrdersToCsv,
  exportOrdersToPdf,
  exportInventoryToCsv,
  exportAnalyticsToPdf,
  exportAnalyticsToCsv,
  exportOrderInvoiceSlip,
};
