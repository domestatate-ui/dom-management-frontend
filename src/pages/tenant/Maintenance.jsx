import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import TenantLayout from '../../components/tenant/layout/TenantLayout';
import { getTenantMaintenance, createMaintenanceRequest } from '../../api/tenant/portal';

const CATEGORIES = ['plumbing', 'electrical', 'appliance', 'other'];
const PRIORITIES  = ['low', 'medium', 'high'];

function priorityColor(p) {
  return p === 'high' ? '#DC2626' : p === 'medium' ? '#D97706' : '#16A34A';
}

function statusBadge(s) {
  const map = {
    open:        { bg: '#FEF2F2', color: '#DC2626' },
    in_progress: { bg: '#FFFBEB', color: '#D97706' },
    resolved:    { bg: '#F0FDF4', color: '#16A34A' },
  };
  const style = map[s] ?? { bg: '#F8FAFC', color: '#64748B' };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: style.bg, color: style.color }}>
      {s.replace('_', ' ')}
    </span>
  );
}

const emptyForm = { title: '', description: '', category: 'other', priority: 'medium' };

export default function TenantMaintenance() {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    getTenantMaintenance().then(setRequests).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const newReq = await createMaintenanceRequest(form);
      setRequests(prev => [newReq, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <TenantLayout>
      <div className="py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>Maintenance</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{requests.length} requests</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}
          >
            <Plus size={15} /> New
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1.5px solid #6366F1' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm" style={{ color: '#1E293B' }}>New Maintenance Request</h2>
              <button onClick={() => setShowForm(false)}><X size={16} style={{ color: '#94A3B8' }} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required placeholder="Issue title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: '1.5px solid #E2E8F0', color: '#1E293B' }}
              />
              <textarea
                rows={3} placeholder="Describe the issue (optional)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{ border: '1.5px solid #E2E8F0', color: '#1E293B' }}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Category</label>
                  <select value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none capitalize"
                    style={{ border: '1.5px solid #E2E8F0', color: '#1E293B' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Priority</label>
                  <select value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none capitalize"
                    style={{ border: '1.5px solid #E2E8F0', color: '#1E293B' }}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', color: '#DC2626' }}>{error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: '#94A3B8' }}>No maintenance requests yet</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm font-semibold" style={{ color: '#6366F1' }}>
              Submit your first request
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map(r => (
              <div key={r.id} className="rounded-xl px-4 py-3"
                style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{r.title}</p>
                  {statusBadge(r.status)}
                </div>
                {r.description && (
                  <p className="text-xs mb-2" style={{ color: '#64748B' }}>{r.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs" style={{ color: '#94A3B8' }}>
                  <span className="capitalize">{r.category}</span>
                  <span className="font-semibold capitalize" style={{ color: priorityColor(r.priority) }}>{r.priority}</span>
                  <span>{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TenantLayout>
  );
}
