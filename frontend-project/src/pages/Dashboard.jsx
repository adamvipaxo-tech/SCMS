import { useEffect, useState } from 'react';
import { Users, Truck, PackageCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PageHeader from '../components/ui/PageHeader';

const statCards = [
  { key: 'suppliers', label: 'Suppliers', icon: Users, color: 'from-blue-500 to-blue-600', link: '/suppliers' },
  { key: 'shipments', label: 'Shipments', icon: Truck, color: 'from-teal-500 to-teal-600', link: '/shipments' },
  { key: 'deliveries', label: 'Deliveries', icon: PackageCheck, color: 'from-violet-500 to-violet-600', link: '/deliveries' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ suppliers: 0, shipments: 0, deliveries: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reports/dashboard')
      .then(({ data }) => {
        setStats(data.stats);
        setRecent(data.recentShipments || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of supply chain operations at SupplyNet Ltd"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ key, label, icon: Icon, color, link }) => (
          <Link
            key={key}
            to={link}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-xl bg-gradient-to-br ${color} p-3 text-white shadow-lg`}>
                <Icon size={24} />
              </div>
              <ArrowRight className="text-slate-300 transition group-hover:text-teal-500" size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              {loading ? '—' : stats[key]}
            </p>
            <p className="text-sm text-slate-500">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900">Recent Shipments</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-3 font-medium">Number</th>
                <th className="pb-3 font-medium">Destination</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    {loading ? 'Loading...' : 'No shipments yet'}
                  </td>
                </tr>
              ) : (
                recent.map((s) => (
                  <tr key={s.shipmentNumber} className="border-b border-slate-50">
                    <td className="py-3 font-medium">{s.shipmentNumber}</td>
                    <td className="py-3">{s.destination}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                        {s.shipmentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(s.shipmentDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
