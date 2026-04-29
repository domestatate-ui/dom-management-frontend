import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Home, Calendar, CheckCircle2, Pencil, X, Check, Globe, FileText, Download } from 'lucide-react';
import { getTenant, updateTenant, enablePortal } from '../../api/landlord/tenants';
import { endLease } from '../../api/landlord/leases';
import { getAgreementForLease, generateAgreement, downloadAgreementPdf, voidAgreement } from '../../api/landlord/agreements';
import StatusBadge from '../../components/shared/StatusBadge';
import MarkPaymentModal from '../../components/landlord/MarkPaymentModal';
import { TenantDetailSkeleton } from '../../components/shared/Skeleton';
import { useToast } from '../../components/shared/Toast';
import { useAuth } from '../../hooks/useAuth';

const fmt = (n) => Number(n ?? 0).toLocaleString('en-IN');

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
      <div className="mt-0.5 flex-shrink-0" style={{ color: '#94A3B8' }}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#94A3B8' }}>{label}</p>
        <p className="text-sm font-medium truncate" style={{ color: '#0F172A' }}>{value}</p>
      </div>
    </div>
  );
}

const editInputStyle = {
  width: '100%', padding: '0.5rem 0.75rem',
  borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500,
  outline: 'none', background: '#F8FAFF', border: '1.5px solid #E2E8F0', color: '#0F172A',
  transition: 'border-color 0.15s',
};

export default function TenantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [tenant, setTenant]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState({ open: false });
  const [endingLease, setEndingLease] = useState(false);
  const [editing, setEditing]       = useState(false);
  const [editForm, setEditForm]     = useState({ name: '', phone: '', email: '' });
  const [saving, setSaving]         = useState(false);
  const [portalForm, setPortalForm] = useState({ show: false, password: '', loading: false });
  const [agreement, setAgreement]   = useState(undefined); // undefined = not loaded yet, null = none
  const [agForm, setAgForm]         = useState({ show: false, name: '', months: 11, submitting: false });
  const [agDownloading, setAgDownloading] = useState(false);

  const fetchTenant = async () => {
    try {
      const res = await getTenant(id);
      setTenant(res.data);
    } catch {
      navigate('/tenants');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgreement = async (leaseId) => {
    try {
      const ag = await getAgreementForLease(leaseId);
      setAgreement(ag ?? null);
    } catch {
      setAgreement(null);
    }
  };

  useEffect(() => { fetchTenant(); }, [id]);

  useEffect(() => {
    if (tenant?.active_lease?.id) fetchAgreement(tenant.active_lease.id);
  }, [tenant?.active_lease?.id]);

  const startEdit = () => {
    setEditForm({ name: tenant.name, phone: tenant.phone ?? '', email: tenant.email ?? '' });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = async () => {
    setSaving(true);
    try {
      await updateTenant(id, {
        name: editForm.name || undefined,
        phone: editForm.phone || null,
        email: editForm.email || null,
      });
      await fetchTenant();
      setEditing(false);
      toast('Tenant updated');
    } catch {
      toast('Failed to update tenant', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAgreement = async (e) => {
    e.preventDefault();
    setAgForm(f => ({ ...f, submitting: true }));
    try {
      const ag = await generateAgreement(tenant.active_lease.id, {
        landlord_name_confirm: agForm.name,
        duration_months: Number(agForm.months),
      });
      setAgreement(ag);
      setAgForm({ show: false, name: '', months: 11, submitting: false });
      toast('Agreement generated', 'success');
    } catch (err) {
      toast(err?.response?.data?.detail ?? 'Failed to generate agreement', 'error');
      setAgForm(f => ({ ...f, submitting: false }));
    }
  };

  const handleDownloadAgreement = async () => {
    setAgDownloading(true);
    try {
      const blob = await downloadAgreementPdf(agreement.id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `agreement-DOM-${String(agreement.id).padStart(4, '0')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast('Download failed', 'error');
    } finally {
      setAgDownloading(false);
    }
  };

  const handleVoidAgreement = async () => {
    if (!window.confirm('Void this agreement? The tenant will need a new one.')) return;
    try {
      await voidAgreement(agreement.id);
      setAgreement(null);
      toast('Agreement voided');
    } catch (err) {
      toast(err?.response?.data?.detail ?? 'Failed to void agreement', 'error');
    }
  };

  const handleEndLease = async () => {
    if (!window.confirm(`End lease for ${tenant.name}? This will mark the unit as vacant.`)) return;
    setEndingLease(true);
    try {
      await endLease(tenant.active_lease.id);
      toast('Lease ended');
      navigate('/tenants');
    } catch {
      toast('Failed to end lease', 'error');
      setEndingLease(false);
    }
  };

  if (loading) return (
    <div className="page-enter">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 font-semibold text-sm" style={{ color: '#6366F1' }}>
        <ArrowLeft size={18} /> Back to Tenants
      </button>
      <TenantDetailSkeleton />
    </div>
  );
  if (!tenant) return null;

  const rr = tenant.active_lease?.current_rent_record;
  const canPay = rr && rr.status !== 'paid';
  const amountBalance = rr ? rr.amount_due - rr.amount_paid : 0;

  return (
    <div className="page-enter">
      <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-6 font-semibold text-sm"
              style={{ color: '#6366F1' }}>
        <ArrowLeft size={18} /> Back to Tenants
      </button>

      <div className="lg:grid lg:grid-cols-5 xl:grid-cols-4 lg:gap-6">

        {/* Left */}
        <div className="lg:col-span-2 xl:col-span-1 space-y-4 mb-6 lg:mb-0">

          {/* Avatar hero */}
          <div className="rounded-3xl p-6 relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg,#4F46E5 0%,#6366F1 60%,#7C3AED 100%)', boxShadow: '0 16px 48px rgba(99,102,241,0.3)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
                 style={{ background: 'radial-gradient(circle,#fff,transparent)', transform: 'translate(30%,-30%)' }} />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-3xl mb-4"
                   style={{ background: 'rgba(255,255,255,0.2)' }}>
                {tenant.name[0]}
              </div>
              <h1 className="text-xl font-black text-white">{tenant.name}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {rr ? <StatusBadge status={rr.status} /> : <StatusBadge status="unpaid" />}
                {tenant.active_lease && (
                  <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Room {tenant.active_lease.unit_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details card with inline edit */}
          <div className="rounded-2xl p-5"
               style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Details</p>
              {!editing ? (
                <button onClick={startEdit}
                        className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
                        style={{ color: '#6366F1', background: '#EEF2FF' }}>
                  <Pencil size={11} /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button onClick={cancelEdit}
                          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
                          style={{ color: '#64748B', background: '#F1F5F9' }}>
                    <X size={11} /> Cancel
                  </button>
                  <button onClick={saveEdit} disabled={saving}
                          className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg text-white"
                          style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', opacity: saving ? 0.7 : 1 }}>
                    <Check size={11} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="space-y-3 pt-1">
                {[
                  { label: 'Name', field: 'name', type: 'text', placeholder: 'Full name' },
                  { label: 'Phone', field: 'phone', type: 'tel', placeholder: 'Phone number' },
                  { label: 'Email', field: 'email', type: 'email', placeholder: 'Email address' },
                ].map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>{label}</label>
                    <input
                      type={type}
                      value={editForm[field]}
                      onChange={(e) => setEditForm((p) => ({ ...p, [field]: e.target.value }))}
                      style={editInputStyle}
                      placeholder={placeholder}
                      onFocus={(e) => { e.target.style.borderColor = '#6366F1'; }}
                      onBlur={(e)  => { e.target.style.borderColor = '#E2E8F0'; }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {tenant.phone && <InfoRow icon={<Phone size={14} />} label="Phone" value={tenant.phone} />}
                {tenant.email && <InfoRow icon={<Mail size={14} />} label="Email" value={tenant.email} />}
                {tenant.active_lease && (
                  <>
                    <InfoRow
                      icon={<Home size={14} />}
                      label="Unit"
                      value={`Room ${tenant.active_lease.unit_number} · ₹${fmt(tenant.active_lease.rent_amount)}/mo`}
                    />
                    <InfoRow
                      icon={<Calendar size={14} />}
                      label="Lease since"
                      value={new Date(tenant.active_lease.start_date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                    />
                  </>
                )}
              </>
            )}
          </div>

          {/* Current month status */}
          {rr && (
            <div className="rounded-2xl p-4"
                 style={{
                   background: rr.status === 'paid' ? '#ECFDF5' : rr.status === 'partial' ? '#FFFBEB' : '#FFF1F2',
                   border: `1.5px solid ${rr.status === 'paid' ? '#A7F3D0' : rr.status === 'partial' ? '#FDE68A' : '#FECDD3'}`,
                 }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>This Month</p>
                <StatusBadge status={rr.status} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#64748B' }}>Due</span>
                  <span className="font-bold" style={{ color: '#0F172A' }}>₹{fmt(rr.amount_due)}</span>
                </div>
                {rr.amount_paid > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#64748B' }}>Paid</span>
                    <span className="font-bold" style={{ color: '#059669' }}>₹{fmt(rr.amount_paid)}</span>
                  </div>
                )}
                {rr.status !== 'paid' && amountBalance > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#64748B' }}>Balance</span>
                    <span className="font-bold" style={{ color: '#E11D48' }}>₹{fmt(amountBalance)}</span>
                  </div>
                )}
                {rr.status === 'paid' && rr.payment_mode && (
                  <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                    via {rr.payment_mode.toUpperCase()} · {new Date(rr.paid_date).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          )}

          {canPay && (
            <button
              onClick={() => setModal({ open: true })}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 8px 24px rgba(5,150,105,0.3)' }}
            >
              <CheckCircle2 size={18} />
              Mark Paid · ₹{fmt(amountBalance)}
            </button>
          )}

          {/* Enable / Portal status */}
          {tenant.email && !tenant.portal_active && (
            portalForm.show ? (
              <div className="rounded-2xl p-4 space-y-3" style={{ background: '#F0F4FF', border: '1.5px solid #C7D2FE' }}>
                <p className="text-xs font-semibold" style={{ color: '#4338CA' }}>Set a portal password for {tenant.name}</p>
                <input
                  type="password" placeholder="New password"
                  value={portalForm.password}
                  onChange={e => setPortalForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #C7D2FE', color: '#1E293B' }}
                />
                <div className="flex gap-2">
                  <button onClick={() => setPortalForm({ show: false, password: '', loading: false })}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold"
                    style={{ border: '1.5px solid #E2E8F0', color: '#64748B' }}>Cancel</button>
                  <button
                    disabled={!portalForm.password || portalForm.loading}
                    onClick={async () => {
                      setPortalForm(f => ({ ...f, loading: true }));
                      try {
                        await enablePortal(id, portalForm.password);
                        await fetchTenant();
                        setPortalForm({ show: false, password: '', loading: false });
                        toast('Portal enabled — tenant can now log in');
                      } catch {
                        toast('Failed to enable portal', 'error');
                        setPortalForm(f => ({ ...f, loading: false }));
                      }
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', opacity: !portalForm.password || portalForm.loading ? 0.7 : 1 }}>
                    {portalForm.loading ? 'Enabling…' : 'Enable'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setPortalForm(f => ({ ...f, show: true }))}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                style={{ border: '1.5px solid #C7D2FE', color: '#6366F1', background: '#F0F4FF' }}
                onMouseEnter={e => e.currentTarget.style.background = '#E0E7FF'}
                onMouseLeave={e => e.currentTarget.style.background = '#F0F4FF'}>
                <Globe size={16} /> Enable Tenant Portal
              </button>
            )
          )}
          {tenant.portal_active && (
            <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
              style={{ background: '#F0FDF4', border: '1.5px solid #A7F3D0' }}>
              <Globe size={14} style={{ color: '#16A34A' }} />
              <span className="text-xs font-semibold" style={{ color: '#16A34A' }}>Tenant portal active</span>
            </div>
          )}

          {/* Agreement */}
          {tenant.active_lease && agreement !== undefined && (
            agreement ? (
              <div className="rounded-2xl p-4 space-y-3"
                style={{ background: '#fff', border: `1.5px solid ${agreement.status === 'signed' ? '#A7F3D0' : '#FDE68A'}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={14} style={{ color: '#6366F1' }} />
                    <p className="text-xs font-bold" style={{ color: '#1E293B' }}>
                      DOM-{String(agreement.id).padStart(4, '0')}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                    style={{
                      background: agreement.status === 'signed' ? '#F0FDF4' : '#FFFBEB',
                      color:      agreement.status === 'signed' ? '#16A34A' : '#D97706',
                    }}>
                    {agreement.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleDownloadAgreement} disabled={agDownloading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                    style={{ border: '1.5px solid #6366F1', color: '#6366F1', background: '#F0F4FF', opacity: agDownloading ? 0.7 : 1 }}>
                    <Download size={12} /> {agDownloading ? '…' : 'PDF'}
                  </button>
                  {agreement.status !== 'signed' && (
                    <button onClick={handleVoidAgreement}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold"
                      style={{ border: '1.5px solid #FECDD3', color: '#E11D48', background: '#FFF1F2' }}>
                      Void
                    </button>
                  )}
                </div>
              </div>
            ) : (
              agForm.show ? (
                <div className="rounded-2xl p-4" style={{ background: '#fff', border: '1.5px solid #6366F1' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold" style={{ color: '#1E293B' }}>Generate Agreement</p>
                    <button onClick={() => setAgForm(f => ({ ...f, show: false }))}><X size={14} style={{ color: '#94A3B8' }} /></button>
                  </div>
                  <form onSubmit={handleGenerateAgreement} className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>Your name (to sign)</label>
                      <input required placeholder={user?.name ?? 'Your full name'}
                        value={agForm.name}
                        onChange={e => setAgForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ border: '1.5px solid #E2E8F0', color: '#1E293B' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>Duration (months)</label>
                      <input type="number" min={1} max={60} required
                        value={agForm.months}
                        onChange={e => setAgForm(f => ({ ...f, months: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ border: '1.5px solid #E2E8F0', color: '#1E293B' }} />
                    </div>
                    <button type="submit" disabled={agForm.submitting}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', opacity: agForm.submitting ? 0.7 : 1 }}>
                      {agForm.submitting ? 'Generating…' : 'Generate & Sign'}
                    </button>
                  </form>
                </div>
              ) : (
                <button onClick={() => setAgForm(f => ({ ...f, show: true, name: user?.name ?? '' }))}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                  style={{ border: '1.5px solid #C7D2FE', color: '#6366F1', background: '#F0F4FF' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#E0E7FF'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F0F4FF'}>
                  <FileText size={16} /> Generate Agreement
                </button>
              )
            )
          )}

          {tenant.active_lease && (
            <button
              onClick={handleEndLease}
              disabled={endingLease}
              className="w-full py-3.5 rounded-2xl font-bold text-sm transition-colors"
              style={{ border: '2px solid #FECDD3', color: '#E11D48', background: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF1F2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {endingLease ? 'Ending lease…' : 'End Lease'}
            </button>
          )}
        </div>

        {/* Right: payment history */}
        <div className="lg:col-span-3 xl:col-span-3">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#94A3B8' }}>Payment History</h2>

          {tenant.rent_history?.length > 0 ? (
            <div className="space-y-2">
              {tenant.rent_history.map((record) => (
                <div key={record.id}
                     className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                     style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#0F172A' }}>
                      {new Date(record.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {record.payment_mode && (
                        <span className="text-xs font-semibold uppercase" style={{ color: '#94A3B8' }}>{record.payment_mode}</span>
                      )}
                      {record.paid_date && (
                        <span className="text-xs" style={{ color: '#94A3B8' }}>
                          · {new Date(record.paid_date).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="mb-1.5"><StatusBadge status={record.status} /></div>
                    <p className="text-sm font-bold" style={{ color: '#0F172A' }}>
                      ₹{fmt(record.amount_paid)}
                      <span style={{ color: '#94A3B8', fontWeight: 400 }}> / ₹{fmt(record.amount_due)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 rounded-3xl"
                 style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
              <p className="font-bold" style={{ color: '#0F172A' }}>No payment history yet</p>
              <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Records will appear here once rent is collected.</p>
            </div>
          )}
        </div>
      </div>

      <MarkPaymentModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        tenantName={tenant.name}
        amountDue={amountBalance}
        rentRecordId={rr?.id}
        onSuccess={fetchTenant}
      />
    </div>
  );
}
