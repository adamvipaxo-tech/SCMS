const COLUMN_LABELS = {
  supplierCode: 'Supplier Code',
  supplierName: 'Supplier Name',
  telephone: 'Telephone',
  address: 'Address',
  email: 'Email',
  createdAt: 'Registered On',
  shipmentNumber: 'Shipment No.',
  shipmentDate: 'Shipment Date',
  shipmentStatus: 'Status',
  destination: 'Destination',
  deliveryCode: 'Delivery Code',
  deliveryDate: 'Delivery Date',
  quantityDelivered: 'Quantity',
  deliveryStatus: 'Delivery Status',
};

function formatCell(key, val) {
  if (val == null) return '—';
  if (key.toLowerCase().includes('date') || key === 'createdAt') {
    const s = String(val);
    return s.length >= 10 ? s.slice(0, 10) : s;
  }
  return String(val);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function printReport({ report, entity, period, username }) {
  if (!report) return;

  const entityLabel = report.summary?.entity || entity;
  const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
  const generatedAt = new Date().toLocaleString('en-RW', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const rows = report.data || [];
  const columns = rows.length ? Object.keys(rows[0]) : [];

  const summaryItems = [
    ['Report Type', entityLabel],
    ['Period', periodLabel],
    ['Date Range', `${report.dateRange?.start || '—'} to ${report.dateRange?.end || '—'}`],
    ['Total Records', String(report.summary?.total ?? 0)],
  ];
  if (report.summary?.totalQuantity !== undefined) {
    summaryItems.push(['Total Quantity Delivered', String(report.summary.totalQuantity)]);
  }
  if (report.summary?.byStatus) {
    Object.entries(report.summary.byStatus).forEach(([status, count]) => {
      summaryItems.push([`Status: ${status}`, String(count)]);
    });
  }

  const summaryHtml = summaryItems
    .map(
      ([label, value]) =>
        `<div class="summary-item"><span class="summary-label">${escapeHtml(label)}</span><span class="summary-value">${escapeHtml(value)}</span></div>`
    )
    .join('');

  const headerCells = columns
    .map((key) => `<th>${escapeHtml(COLUMN_LABELS[key] || key.replace(/([A-Z])/g, ' $1'))}</th>`)
    .join('');

  const bodyRows =
    rows.length > 0
      ? rows
          .map(
            (row) =>
              `<tr>${columns.map((key) => `<td>${escapeHtml(formatCell(key, row[key]))}</td>`).join('')}</tr>`
          )
          .join('')
      : `<tr><td colspan="${columns.length || 1}" class="empty">No records found for this period.</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SCMS Report — ${escapeHtml(entityLabel)} (${escapeHtml(periodLabel)})</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Georgia, serif;
      font-size: 11pt;
      color: #0f172a;
      padding: 24px 32px;
      line-height: 1.4;
    }
    .letterhead {
      border-bottom: 3px solid #0d9488;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .company { font-size: 10pt; color: #0d9488; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .title { font-size: 22pt; font-weight: 700; margin: 4px 0; color: #1e3a8a; }
    .subtitle { font-size: 10pt; color: #64748b; }
    .meta {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
      font-size: 9pt;
      color: #475569;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .summary-item { display: flex; flex-direction: column; gap: 2px; }
    .summary-label { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600; }
    .summary-value { font-size: 12pt; font-weight: 700; color: #0f172a; }
    h2.section { font-size: 12pt; margin-bottom: 10px; color: #1e40af; border-left: 4px solid #0d9488; padding-left: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th {
      background: #1e3a8a;
      color: #fff;
      text-align: left;
      padding: 10px 12px;
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; font-size: 10pt; }
    tr:nth-child(even) td { background: #f8fafc; }
    .empty { text-align: center; color: #94a3b8; padding: 24px !important; }
    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #cbd5e1;
      font-size: 8pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    .signature { margin-top: 40px; }
    .signature-line {
      width: 220px;
      border-top: 1px solid #334155;
      margin-top: 48px;
      padding-top: 6px;
      font-size: 9pt;
      color: #475569;
    }
    @media print {
      body { padding: 12px 16px; }
      @page { margin: 15mm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="letterhead">
    <div class="company">SupplyNet Ltd</div>
    <h1 class="title">Supply Chain Management Report</h1>
    <p class="subtitle">Musanze District, Northern Province, Rwanda — Procurement Office</p>
  </div>

  <div class="meta">
    <span><strong>Generated:</strong> ${escapeHtml(generatedAt)}</span>
    <span><strong>Prepared by:</strong> ${escapeHtml(username || 'Officer')}</span>
    <span><strong>Document ID:</strong> SCMS-${escapeHtml(entity)}-${escapeHtml(period)}-${Date.now().toString(36).toUpperCase()}</span>
  </div>

  <div class="summary">${summaryHtml}</div>

  <h2 class="section">Detailed Records</h2>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>

  <div class="signature">
    <div class="signature-line">Authorized Signature — Procurement Officer</div>
  </div>

  <div class="footer">
    <span>SupplyNet Ltd SCMS — Confidential Internal Report</span>
    <span>Page 1</span>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Please allow pop-ups to print the report.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}
