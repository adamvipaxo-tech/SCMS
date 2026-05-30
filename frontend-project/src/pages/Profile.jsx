import { useEffect, useState } from 'react';
import { UserPlus, Shield, KeyRound, Users, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';

export default function Profile() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: '',
    fullName: '',
  });
  const [creating, setCreating] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const loadAdmins = () => {
    setLoadingAdmins(true);
    api
      .get('/users')
      .then(({ data }) => setAdmins(data.data))
      .catch(() => setAlert({ type: 'error', message: 'Failed to load admin accounts' }))
      .finally(() => setLoadingAdmins(false));
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreating(true);
    setAlert({ type: '', message: '' });
    try {
      await api.post('/users', newAdmin);
      setAlert({ type: 'success', message: `Admin "${newAdmin.username}" created successfully` });
      setNewAdmin({ username: '', password: '', fullName: '' });
      loadAdmins();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to create admin' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (admin.username === user?.username) {
      setAlert({ type: 'error', message: 'You cannot delete your own account' });
      return;
    }
    if (!window.confirm(`Delete admin account "${admin.username}"? This cannot be undone.`)) {
      return;
    }
    setAlert({ type: '', message: '' });
    try {
      await api.delete(`/users/${admin.id}`);
      setAlert({ type: 'success', message: `Admin "${admin.username}" deleted` });
      loadAdmins();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to delete admin' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    setChangingPassword(true);
    setAlert({ type: '', message: '' });
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setAlert({ type: 'success', message: 'Your password has been updated' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

  return (
    <div>
      <PageHeader
        title="Profile & Administration"
        subtitle="Manage your account, change password, and create procurement officer accounts"
      />

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="mb-6 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg">
            <Shield size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Logged in as</p>
            <p className="text-xl font-bold text-slate-900">{user?.username}</p>
            <p className="text-sm text-slate-600">Procurement Officer — SupplyNet Ltd</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="text-teal-600" size={22} />
            <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className={inputClass}
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className={inputClass}
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="text-blue-600" size={22} />
            <h3 className="text-lg font-semibold text-slate-900">Create Admin Account</h3>
          </div>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
              <input
                value={newAdmin.fullName}
                onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                className={inputClass}
                placeholder="Jean Baptiste"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input
                value={newAdmin.username}
                onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                className={inputClass}
                placeholder="admin2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                className={inputClass}
                minLength={6}
                placeholder="Min. 6 characters"
                required
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {creating ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="text-violet-600" size={22} />
            <h3 className="text-lg font-semibold text-slate-900">
              Available Admins ({admins.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={loadAdmins}
            className="text-sm font-medium text-teal-600 hover:text-teal-500"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Username</th>
                <th className="pb-3 font-medium">Full Name</th>
                <th className="pb-3 font-medium">Created</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingAdmins ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading admins...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No admin accounts found
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr key={admin.id} className="border-b border-slate-50">
                    <td className="py-3 text-slate-500">{index + 1}</td>
                    <td className="py-3 font-medium">
                      {admin.username}
                      {admin.username === user?.username && (
                        <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-700">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-3">{admin.fullName || '—'}</td>
                    <td className="py-3 text-slate-600">
                      {admin.createdAt
                        ? new Date(admin.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        Active
                      </span>
                    </td>
                    <td className="py-3">
                      {admin.username === user?.username ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteAdmin(admin)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          title={`Delete ${admin.username}`}
                          aria-label={`Delete ${admin.username}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
