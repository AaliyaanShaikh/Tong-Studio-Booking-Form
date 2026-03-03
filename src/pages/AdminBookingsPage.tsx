import { useCallback, useEffect, useState, type FC, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminFetch } from '../api/client';

export type Booking = {
  id: number;
  studio_id: string;
  booking_date: string;
  timing_slot: string;
  addons: string[];
  extra_requests: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at?: string;
};

const INPUT_CLASS =
  'rounded-xl border-2 border-stone-200 font-sans px-4 py-3 focus:outline-none focus:ring-2 focus:ring-champagne-400 focus:border-transparent w-full text-sm';

const STATUS_OPTIONS: { value: Booking['status']; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STUDIO_IDS = ['1', '2', '3', '4'];
const TIMING_SLOTS = ['2h', '4h', '12h', '24h'];

const AdminBookingsPage: FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState<Partial<Booking>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch('bookings.php');
      const data = await res.json().catch(() => ({}));
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        setError(data.error ?? 'Failed to load bookings');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const openEdit = (b: Booking) => {
    setEditing(b);
    setForm({
      status: b.status,
      customer_name: b.customer_name,
      customer_email: b.customer_email,
      customer_phone: b.customer_phone,
      booking_date: b.booking_date,
      timing_slot: b.timing_slot,
      studio_id: b.studio_id,
      extra_requests: b.extra_requests ?? '',
      addons: b.addons ?? [],
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setForm({});
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const res = await adminFetch(`bookings.php?id=${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        closeEdit();
        loadBookings();
      } else {
        setError(data.error ?? 'Update failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this booking?')) return;
    setDeletingId(id);
    try {
      const res = await adminFetch(`bookings.php?id=${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
      } else {
        setError(data.error ?? 'Delete failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString();
  const formatDateTime = (d: string) => new Date(d).toLocaleString();

  return (
    <div className="min-h-screen bg-alabaster">
      <header className="sticky top-0 z-10 bg-alabaster/95 backdrop-blur-sm border-b border-stone-200 px-4 py-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">Bookings</h1>
            <p className="font-sans text-xs text-stone-500">Logged in as {user?.username}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="font-sans text-sm text-stone-600 hover:text-champagne-600 transition-colors"
            >
              Public booking
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-stone-300 text-charcoal-900 font-sans text-sm font-semibold hover:bg-stone-100 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 pb-[env(safe-area-inset-bottom)]">
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-sans text-sm px-4 py-3">
            {error}
          </p>
        )}

        {loading ? (
          <p className="font-sans text-stone-500">Loading bookings…</p>
        ) : bookings.length === 0 ? (
          <p className="font-sans text-stone-500">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-sans text-sm border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-left text-stone-500 uppercase tracking-wider text-xs">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Studio</th>
                  <th className="py-3 pr-4">Slot</th>
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Created</th>
                  <th className="py-3 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                    <td className="py-3 pr-4 text-charcoal-900">{formatDate(b.booking_date)}</td>
                    <td className="py-3 pr-4 text-charcoal-900">{b.studio_id}</td>
                    <td className="py-3 pr-4 text-charcoal-900">{b.timing_slot}</td>
                    <td className="py-3 pr-4">
                      <span className="text-charcoal-900 font-medium">{b.customer_name}</span>
                      <span className="block text-stone-500 text-xs">{b.customer_email}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          b.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : b.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-stone-500 text-xs">{formatDateTime(b.created_at)}</td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(b)}
                        className="p-2 text-stone-500 hover:text-champagne-600 transition-colors rounded-lg hover:bg-champagne-100"
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        disabled={deletingId === b.id}
                        className="p-2 text-stone-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50">
          <div className="bg-alabaster rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <h2 className="font-serif text-xl text-charcoal-900">Edit booking #{editing.id}</h2>
              <button
                type="button"
                onClick={closeEdit}
                className="p-2 text-stone-500 hover:text-charcoal-900 rounded-lg hover:bg-stone-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-4 space-y-4">
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={form.status ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Booking['status'] }))}
                  className={INPUT_CLASS}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">Booking date</label>
                <input
                  type="date"
                  value={form.booking_date ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, booking_date: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">Studio</label>
                <select
                  value={form.studio_id ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, studio_id: e.target.value }))}
                  className={INPUT_CLASS}
                >
                  {STUDIO_IDS.map((id) => (
                    <option key={id} value={id}>Studio {id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">Timing slot</label>
                <select
                  value={form.timing_slot ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, timing_slot: e.target.value }))}
                  className={INPUT_CLASS}
                >
                  {TIMING_SLOTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">Customer name</label>
                <input
                  type="text"
                  value={form.customer_name ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={form.customer_email ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, customer_email: e.target.value }))}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.customer_phone ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, customer_phone: e.target.value }))}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">Extra requests</label>
                <textarea
                  rows={3}
                  value={form.extra_requests ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, extra_requests: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 py-3 rounded-full border-2 border-stone-300 text-charcoal-900 font-sans font-semibold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-full bg-charcoal-900 text-white font-sans font-bold uppercase tracking-wider text-sm disabled:opacity-70"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
