import { useState } from 'react';
import { FileText, Printer } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import { printReport } from '../utils/printReport';

const entities = [
  { id: 'suppliers', label: 'Suppliers' },
  { id: 'shipments', label: 'Shipments' },
  { id: 'deliveries', label: 'Deliveries' },
];

const periods = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

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

export default function Reports() {
  const { user } = useAuth();
  const [entity, setEntity] = useState('shipments');
  const [period, setPeriod] = useState('weekly');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/reports/${entity}/${period}`);
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!report) {
      setError('Generate a report before printing');
      return;
    }
    printReport({
      report,
      entity,
      period,
      username: user?.username,
    });
  };

  const columns = report?.data?.[0] ? Object.keys(report.data[0]) : [];

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate daily, weekly and monthly supply chain reports"
      />

      <Alert type="error" message={error} onClose={() => setError('')} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">Report Type</label>
            <div className="flex flex-wrap gap-2">
              {entities.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setEntity(e.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    entity === e.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">Period</label>
            <div className="flex flex-wrap gap-2">
              {periods.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    period === p.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={generateReport}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
          >
            <FileText size={18} />
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {report && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Entity</p>
              <p className="text-xl font-bold">{report.summary?.entity}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Period</p>
              <p className="text-xl font-bold capitalize">{report.period}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total Records</p>
              <p className="text-xl font-bold">{report.summary?.total ?? 0}</p>
            </div>
          </div>

          {report.summary?.totalQuantity !== undefined && (
            <p className="text-sm text-slate-600">
              Total quantity delivered: <strong>{report.summary.totalQuantity}</strong>
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              <Printer size={16} />
              Print Report
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Print opens a formatted document with company letterhead, summary, and full data table — not a screenshot of this page.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-2 text-xs text-slate-400">
              Date range: {report.dateRange?.start} to {report.dateRange?.end}
            </p>
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  {columns.map((key) => (
                    <th key={key} className="pb-3 pr-4 font-medium">
                      {COLUMN_LABELS[key] || key.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.data?.length ? (
                  report.data.map((row, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {columns.map((key) => (
                        <td key={key} className="py-3 pr-4">
                          {formatCell(key, row[key])}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length || 1} className="py-8 text-center text-slate-400">
                      No records for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
