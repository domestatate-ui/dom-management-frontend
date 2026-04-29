import { useEffect, useState } from 'react';
import { Wrench, Bell, Plus, Trash2, X } from 'lucide-react';
import { getMaintenanceRequests, updateMaintenanceRequest } from '../../api/landlord/maintenance';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../../api/landlord/announcements';
import { getProperties } from '../../api/landlord/properties';
import { useToast } from '../../components/shared/Toast';

function priorityColor(p) {
  return p === 'high' ? '#DC2626' : p === 'medium' ? '#D97706' : '#16A34A';
}

function statusBadge(s) {
  const map = {
    open:        { bg: '#FEF2F2', color: '#DC2626' },
    in_progress: { bg: '#FFFBEB', color: '#D97706' },
    resolved:    { bg: '#F0FDF4', color: '#16A34A' },
  };
  const st = map[s] ?? { bg: '#F8FAFC', color: '#64748B' };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: st.bg, color: st.color }}>
      {s.replace('_', ' ')}
    </span>
  );
}

const emptyAnn = { title: '', body: '', property_id: '' };

export default function Maintenance() {
  const { toast } = useToast();
  const [tab, setTab]                     = useState('requests');
  const [requests, setRequests]           = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [properties, setProperties]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [statusFilter, setStatusFilter]   = useState('');
  const [showAnnForm, setShowAnnForm]     = useState(false);
  const [annForm, setAnnForm]             = useState(emptyAnn);
  const [annSubmitting, setAnnSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      getMaintenanceRequests(),
      getAnnouncements(),
      getProperties(),
    ]).then(([reqs, anns, propsRes]) => {
      setRequests(reqs);
      setAnnouncements(anns);
      setProperties(propsRes.data ?? propsRes);
    }).finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(req, newStatus) {
    try {
      const updated = await updateMaintenanceRequest(req.id, { status: newStatus });
      setRequests(prev => prev.map(r => r.id === req.id ? updated : r));
      toast(`Marked as ${newStatus.replace('_', ' ')}`, 'success');
    } catch {
      toast('Update failed', 'error');
    }
  }

  async function handleCreateAnn(e) {
    e.preventDefault();
    setAnnSubmitting(true);
    try {
      const ann = await createAnnouncement({
        title: annForm.title,
        body: annForm.body || null,
        property_id: annForm.property_id ? Number(annForm.property_id) : null,
      });
      setAnnouncements(prev => [ann, ...prev]);
      setAnnForm(emptyAnn);
      setShowAnnForm(false);
      toast('Announcement posted', 'success');
    } catch {
      toast('Failed to post announcement', 'error');
    } finally {
      setAnnSubmitting(false);
    }
  }

  async function handleDeleteAnn(id) {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast('Deleted', 'success');
    } catch {
      toast('Delete failed', 'error');
    }
  }

  const filtered = statusFilter ? requests.filter(r => r.status === statusFilter) : requests;

  return (
    <div className="py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1E293B' }}>Maintenance & Notices</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Manage repair requests and post announcements</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#E2E8F0' }}>
        {[{ key: 'requests', label: 'Requests', icon: Wrench }, { key: 'announcements', label: 'Announcements', icon: Bell }].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === key
              ? { background: '#fff', color: '#6366F1', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }
              : { color: '#64748B' }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Requests tab */}
      {tab === 'requests' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['', 'open', 'in_progress', 'resolved'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={statusFilter === s
                  ? { background: '#6366F1', color: '#fff' }
                  : { background: '#E2E8F0', color: '#64748B' }}>
                {s ? s.replace('_', ' ') : 'All'}
              </button>
            ))}
            <span className="ml-auto text-xs self-center" style={{ color: '#94A3B8' }}>{filtered.length} requests</span>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: '#94A3B8' }}>No requests found</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(r => (
                <div key={r.id} className="rounded-xl px-4 py-3"
                  style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{r.title}</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>
                        {r.tenant_name} · {r.unit_number} · {r.property_name}
                      </p>
                    </div>
                    {statusBadge(r.status)}
                  </div>
                  {r.description && (
                    <p className="text-xs my-1.5" style={{ color: '#475569' }}>{r.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-xs" style={{ color: '#94A3B8' }}>
                      <span className="capitalize">{r.category}</span>
                      <span className="font-semibold capitalize" style={{ color: priorityColor(r.priority) }}>{r.priority}</span>
                    </div>
                    {r.status !== 'resolved' && (
                      <div className="flex gap-2">
                        {r.status === 'open' && (
                          <button onClick={() => handleStatusChange(r, 'in_progress')}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                            style={{ background: '#FFFBEB', color: '#D97706' }}>
                            Start
                          </button>
                        )}
                        <button onClick={() => handleStatusChange(r, 'resolved')}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: '#F0FDF4', color: '#16A34A' }}>
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Announcements tab */}
      {tab === 'announcements' && (
        <div className="space-y-4">
          <button onClick={() => setShowAnnForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
            <Plus size={15} /> New Announcement
          </button>

          {showAnnForm && (
            <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1.5px solid #6366F1' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm" style={{ color: '#1E293B' }}>Post Announcement</h2>
                <button onClick={() => setShowAnnForm(false)}><X size={16} style={{ color: '#94A3B8' }} /></button>
              </div>
              <form onSubmit={handleCreateAnn} className="space-y-3">
                <input required placeholder="Title"
                  value={annForm.title}
                  onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #E2E8F0', color: '#1E293B' }} />
                <textarea rows={3} placeholder="Message (optional)"
                  value={annForm.body}
                  onChange={e => setAnnForm(f => ({ ...f, body: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ border: '1.5px solid #E2E8F0', color: '#1E293B' }} />
                <select value={annForm.property_id}
                  onChange={e => setAnnForm(f => ({ ...f, property_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #E2E8F0', color: '#1E293B' }}>
                  <option value="">All properties (broadcast)</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button type="submit" disabled={annSubmitting}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', opacity: annSubmitting ? 0.7 : 1 }}>
                  {annSubmitting ? 'Posting…' : 'Post Announcement'}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
          ) : announcements.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: '#94A3B8' }}>No announcements yet</p>
          ) : (
            <div className="space-y-2">
              {announcements.map(a => (
                <div key={a.id} className="rounded-2xl px-5 py-4"
                  style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{a.title}</p>
                      {a.body && <p className="text-sm mt-1" style={{ color: '#475569' }}>{a.body}</p>}
                      <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>
                        {a.property_id
                          ? (properties.find(p => p.id === a.property_id)?.name ?? 'One property')
                          : 'All properties'}
                        {' · '}{new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteAnn(a.id)}
                      className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                      style={{ color: '#94A3B8' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
