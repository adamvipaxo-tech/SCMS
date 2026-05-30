import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/ui/Alert';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials and server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 p-12 text-white lg:flex">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">
            SupplyNet Ltd
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Supply Chain
            <br />
            Management System
          </h1>
          <p className="mt-4 max-w-md text-slate-300">
            Digital platform for procurement officers in Musanze District to manage suppliers,
            shipments, and deliveries with automated reporting.
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
          <Truck className="text-teal-300" size={40} />
          <div>
            <p className="font-semibold">Logistics & Supply Chain</p>
            <p className="text-sm text-slate-300">Northern Province, Rwanda</p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-semibold text-teal-600">SupplyNet Ltd</p>
            <h2 className="text-2xl font-bold text-slate-900">SCMS Login</h2>
          </div>

          <h2 className="hidden text-2xl font-bold text-slate-900 lg:block">Welcome back</h2>
          <p className="mt-1 text-slate-500">Sign in to your procurement account</p>

          <Alert type="error" message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none ring-teal-500/0 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:from-teal-500 hover:to-blue-500 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
