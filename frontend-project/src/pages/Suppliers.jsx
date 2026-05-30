import { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';

const emptyForm = {
  supplierCode: '',
  supplierName: '',
  telephone: '',
  address: '',
  email: '',
};

export default function Suppliers() {
  const [form, setForm] = useState(emptyForm);
  const [suppliers, setSuppliers] = useState([]);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const loadSuppliers = () => {
    api.get('/suppliers').then(({ data }) => setSuppliers(data.data)).catch(console.error);
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: '', message: '' });
    try {
      await api.post('/suppliers', form);
      setAlert({ type: 'success', message: 'Supplier registered successfully' });
      setForm(emptyForm);
      loadSuppliers();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to save supplier' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Register supplier details (insert only per procurement policy)"
      />

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="grid gap-6 lg:grid-cols-5">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
        >
          <h3 className="mb-4 font-semibold text-slate-900">Add Supplier</h3>
          <div className="space-y-4">
            {[
              ['supplierCode', 'Supplier Code', 'SUP003'],
              ['supplierName', 'Supplier Name', 'Company Name Ltd'],
              ['telephone', 'Telephone', '+250788000000'],
              ['address', 'Address', 'Street, City'],
              ['email', 'Email', 'email@company.rw'],
            ].map(([name, label, placeholder]) => (
              <div key={name}>
                <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className={inputClass}
                  required
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Register Supplier'}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h3 className="mb-4 font-semibold text-slate-900">Registered Suppliers ({suppliers.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-medium">Code</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.supplierCode} className="border-b border-slate-50">
                    <td className="py-3 font-medium">{s.supplierCode}</td>
                    <td className="py-3">{s.supplierName}</td>
                    <td className="py-3">{s.telephone}</td>
                    <td className="py-3 text-slate-600">{s.email}</td>
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
