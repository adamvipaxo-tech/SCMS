import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../api/axios';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';

const emptyForm = {
  deliveryCode: '',
  deliveryDate: '',
  quantityDelivered: '',
  deliveryStatus: 'Scheduled',
  shipmentNumber: '',
};

const statuses = ['Scheduled', 'In Progress', 'Completed', 'Failed'];

export default function Deliveries() {
  const [form, setForm] = useState(emptyForm);
  const [deliveries, setDeliveries] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get('/deliveries').then(({ data }) => setDeliveries(data.data)).catch(console.error);
    api.get('/shipments').then(({ data }) => setShipments(data.data)).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: '', message: '' });
    const payload = { ...form, quantityDelivered: Number(form.quantityDelivered) };
    try {
      if (editing) {
        await api.put(`/deliveries/${editing}`, payload);
        setAlert({ type: 'success', message: 'Delivery updated' });
      } else {
        await api.post('/deliveries', payload);
        setAlert({ type: 'success', message: 'Delivery recorded' });
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

  const startEdit = (d) => {
    setEditing(d.deliveryCode);
    setForm({
      deliveryCode: d.deliveryCode,
      deliveryDate: d.deliveryDate?.slice(0, 10) || '',
      quantityDelivered: d.quantityDelivered,
      deliveryStatus: d.deliveryStatus,
      shipmentNumber: d.shipmentNumber,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this delivery?')) return;
    try {
      await api.delete(`/deliveries/${id}`);
      setAlert({ type: 'success', message: 'Delivery deleted' });
      load();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

  return (
    <div>
      <PageHeader title="Deliveries" subtitle="Record and manage product delivery information" />
      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-semibold">{editing ? 'Update Delivery' : 'New Delivery'}</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Delivery Code</label>
              <input name="deliveryCode" value={form.deliveryCode} onChange={handleChange} className={inputClass} disabled={!!editing} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Delivery Date</label>
              <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Quantity Delivered</label>
              <input type="number" min="1" name="quantityDelivered" value={form.quantityDelivered} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select name="deliveryStatus" value={form.deliveryStatus} onChange={handleChange} className={inputClass}>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Shipment</label>
              <select name="shipmentNumber" value={form.shipmentNumber} onChange={handleChange} className={inputClass} required>
                <option value="">Select shipment</option>
                {shipments.map((s) => (
                  <option key={s.shipmentNumber} value={s.shipmentNumber}>
                    {s.shipmentNumber} → {s.destination}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500">
              {loading ? 'Saving...' : editing ? 'Update' : 'Record Delivery'}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-xl border px-4 text-sm">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h3 className="mb-4 font-semibold">All Deliveries</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-medium">Code</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Shipment</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.deliveryCode} className="border-b border-slate-50">
                    <td className="py-3 font-medium">{d.deliveryCode}</td>
                    <td className="py-3">{new Date(d.deliveryDate).toLocaleDateString()}</td>
                    <td className="py-3">{d.quantityDelivered}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                        {d.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3">{d.shipmentNumber}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => startEdit(d)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                          <Pencil size={16} />
                        </button>
                        <button type="button" onClick={() => handleDelete(d.deliveryCode)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
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
