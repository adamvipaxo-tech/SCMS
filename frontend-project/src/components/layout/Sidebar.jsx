import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Truck,
  PackageCheck,
  BarChart3,
  UserCircle,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/suppliers', icon: Users, label: 'Suppliers' },
  { to: '/shipments', icon: Truck, label: 'Shipments' },
  { to: '/deliveries', icon: PackageCheck, label: 'Deliveries' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-300 shadow-inner'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-700/50 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">
              SupplyNet Ltd
            </p>
            <h2 className="text-lg font-bold text-white">SCMS</h2>
            <p className="text-xs text-slate-400">Musanze, Rwanda</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={onClose}>
              <Icon size={20} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-700/50 p-4">
          <div className="mb-3 rounded-xl bg-slate-800/50 px-4 py-3">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="truncate font-medium text-white">{user?.username || 'Officer'}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
