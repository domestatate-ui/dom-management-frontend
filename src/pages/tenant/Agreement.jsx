import { useEffect, useState } from 'react';
import { FileText, Download, PenLine, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import TenantLayout from '../../components/tenant/layout/TenantLayout';
import { getMyAgreement, signAgreement, downloadAgreementPdf } from '../../api/tenant/agreement';
import { useToast } from '../../components/shared/Toast';
import { useTenantAuth } from '../../hooks/useTenantAuth';

function statusStyle(status) {
  if (status === 'signed')          return { bg: '#F0FDF4', color: '#16A34A', label: 'Signed' };
  if (status === 'awaiting_tenant') return { bg: '#FFFBEB', color: '#D97706', label: 'Awaiting your signature' };
  return { bg: '#F8FAFC', color: '#64748B', label: status };
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: '#0F172A' }}>{value}</span>
    </div>
  );
}

export default function TenantAgreement() {
  const { tenant } = useTenantAuth();
  const { toast } = useToast();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [nameInput, setNameInput] = useState('');
  const [signing, setSigning]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getMyAgreement()
      .then(setAgreement)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSign(e) {
    e.preventDefault();
    setSigning(true);
    try {
      const updated = await signAgreement(agreement.id, { name_confirm: nameInput });
      setAgreement(updated);
      setNameInput('');
      toast('Agreement signed successfully', 'success');
    } catch (err) {
      const msg = err?.response?.data?.detail ?? 'Failed to sign agreement';
      toast(msg, 'error');
    } finally {
      setSigning(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
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
      setDownloading(false);
    }
  }

  return (
    <TenantLayout>
      <div className="py-6 space-y-5 max-w-lg">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1E293B' }}>Rental Agreement</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>View and sign your rental agreement</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
          </div>
        ) : !agreement ? (
          <div className="rounded-2xl p-10 flex flex-col items-center gap-3 text-center"
            style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
            <FileText size={32} style={{ color: '#CBD5E1' }} />
            <p className="font-semibold" style={{ color: '#475569' }}>No agreement yet</p>
            <p className="text-sm" style={{ color: '#94A3B8' }}>Your landlord hasn't generated a rental agreement for your lease.</p>
          </div>
        ) : (
          <>
            {/* Status banner */}
            {(() => {
              const st = statusStyle(agreement.status);
              const Icon = agreement.status === 'signed' ? CheckCircle2 : Clock;
              return (
                <div className="rounded-2xl px-5 py-4 flex items-center gap-3"
                  style={{ background: st.bg, border: `1.5px solid ${st.color}33` }}>
                  <Icon size={20} style={{ color: st.color, flexShrink: 0 }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: st.color }}>{st.label}</p>
                    {agreement.status === 'awaiting_tenant' && (
                      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Please review and sign below to activate your agreement.</p>
                    )}
                    {agreement.status === 'signed' && agreement.tenant_signed_at && (
                      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                        Signed on {new Date(agreement.tenant_signed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Agreement details */}
            <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} style={{ color: '#6366F1' }} />
                <p className="text-sm font-bold" style={{ color: '#1E293B' }}>
                  Agreement DOM-{String(agreement.id).padStart(4, '0')}
                </p>
              </div>
              <InfoRow label="Property"     value={agreement.property_name ?? '—'} />
              <InfoRow label="Unit"         value={`Room ${agreement.unit_number}`} />
              <InfoRow label="Landlord"     value={agreement.landlord_name} />
              <InfoRow label="Tenant"       value={agreement.tenant_name} />
              <InfoRow label="Monthly Rent" value={`₹${Number(agreement.rent_amount).toLocaleString('en-IN')}`} />
              <InfoRow label="Deposit"      value={`₹${Number(agreement.deposit_amount).toLocaleString('en-IN')}`} />
              <InfoRow label="Start Date"   value={new Date(agreement.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              <InfoRow label="Duration"     value={`${agreement.duration_months} months`} />

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                style={{ border: '1.5px solid #6366F1', color: '#6366F1', background: '#F0F4FF', opacity: downloading ? 0.7 : 1 }}>
                <Download size={15} />
                {downloading ? 'Downloading…' : 'Download PDF'}
              </button>
            </div>

            {/* Sign form */}
            {agreement.status === 'awaiting_tenant' && (
              <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1.5px solid #6366F1' }}>
                <div className="flex items-center gap-2 mb-1">
                  <PenLine size={16} style={{ color: '#6366F1' }} />
                  <p className="text-sm font-bold" style={{ color: '#1E293B' }}>Sign Agreement</p>
                </div>
                <p className="text-xs mb-4" style={{ color: '#64748B' }}>
                  Type your full name exactly as registered to electronically sign this agreement.
                </p>
                <div className="rounded-xl px-4 py-3 mb-4 flex items-start gap-2"
                  style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <AlertCircle size={14} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
                  <p className="text-xs" style={{ color: '#92400E' }}>
                    By typing your name and clicking Sign, you agree to all terms of this rental agreement.
                    This constitutes a valid electronic signature under the IT Act, 2000.
                  </p>
                </div>
                <form onSubmit={handleSign} className="space-y-3">
                  <input
                    required
                    placeholder={`Type your full name: ${tenant?.name ?? ''}`}
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ border: '1.5px solid #E2E8F0', color: '#1E293B' }}
                  />
                  <button
                    type="submit"
                    disabled={signing || !nameInput.trim()}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', opacity: signing || !nameInput.trim() ? 0.6 : 1 }}>
                    {signing ? 'Signing…' : 'Sign Agreement'}
                  </button>
                </form>
              </div>
            )}

            {/* Signature record */}
            {agreement.status === 'signed' && (
              <div className="rounded-2xl p-5 space-y-3" style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Signatures</p>
                {[
                  { role: 'Landlord', name: agreement.landlord_name_signed, at: agreement.landlord_signed_at },
                  { role: 'Tenant',   name: agreement.tenant_name_signed,   at: agreement.tenant_signed_at   },
                ].map(({ role, name, at }) => (
                  <div key={role} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>{role}</p>
                      <p className="text-sm font-semibold italic" style={{ color: '#1E293B' }}>{name}</p>
                    </div>
                    {at && (
                      <p className="text-xs" style={{ color: '#94A3B8' }}>
                        {new Date(at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </TenantLayout>
  );
}
