import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../api/axios';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';

const emptyForm = {
  shipmentNumber: '',
  shipmentDate: '',
  shipmentStatus: 'Pending',
  destination: '',
  supplierCode: '',
};

const statuses = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];

export default function Shipments() {
  const [form, setForm] = useState(emptyForm);
  const [shipments, setShipments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get('/shipments').then(({ data }) => setShipments(data.data)).catch(console.error);
    api.get('/suppliers').then(({ data }) => setSuppliers(data.data)).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: '', message: '' });
    try {
      if (editing) {
        await api.put(`/shipments/${editing}`, form);
        setAlert({ type: 'success', message: 'Shipment updated' });
      } else {
        await api.post('/shipments', form);
        setAlert({ type: 'success', message: 'Shipment created' });
      }
      setForm(emptyForm);
      setEditing(null);
      load();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (s) => {
    setEditing(s.shipmentNumber);
    setForm({
      shipmentNumber: s.shipmentNumber,
      shipmentDate: s.shipmentDate?.slice(0, 10) || '',
      shipmentStatus: s.shipmentStatus,
      destination: s.destination,
      supplierCode: s.supplierCode,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shipment?')) return;
    try {
      await api.delete(`/shipments/${id}`);
      setAlert({ type: 'success', message: 'Shipment deleted' });
      load();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

  return (
    <div>
      <PageHeader title="Shipments" subtitle="Create, view, update and delete shipment records" />
      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-semibold">{editing ? 'Update Shipment' : 'New Shipment'}</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Shipment Number</label>
              <input
                name="shipmentNumber"
                value={form.shipmentNumber}
                onChange={handleChange}
                className={inputClass}
                disabled={!!editing}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Date</label>
              <input type="date" name="shipmentDate" value={form.shipmentDate} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select name="shipmentStatus" value={form.shipmentStatus} onChange={handleChange} className={inputClass}>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Destination</label>
              <input name="destination" value={form.destination} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Supplier</label>
              <select name="supplierCode" value={form.supplierCode} onChange={handleChange} className={inputClass} required>
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.supplierCode} value={s.supplierCode}>
                    {s.supplierCode} — {s.supplierName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500">
              {loading ? 'Saving...' : editing ? 'Update' : 'Create Shipment'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => { setEditing(null); setForm(emptyForm); }}
                className="rounded-xl border border-slate-200 px-4 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h3 className="mb-4 font-semibold">All Shipments</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-medium">Number</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Destination</th>
                  <th className="pb-3 font-medium">Supplier</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s.shipmentNumber} className="border-b border-slate-50">
                    <td className="py-3 font-medium">{s.shipmentNumber}</td>
                    <td className="py-3">{new Date(s.shipmentDate).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {s.shipmentStatus}
                      </span>
                    </td>
                    <td className="py-3">{s.destination}</td>
                    <td className="py-3">{s.supplierName}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => startEdit(s)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                          <Pencil size={16} />
                        </button>
                        <button type="button" onClick={() => handleDelete(s.shipmentNumber)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
