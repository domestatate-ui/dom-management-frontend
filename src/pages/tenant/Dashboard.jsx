import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, CreditCard, Wrench, Bell } from 'lucide-react';
import TenantLayout from '../../components/tenant/layout/TenantLayout';
import { getTenantDashboard } from '../../api/tenant/portal';

function statusBadge(status) {
  const map = {
    paid:    { bg: '#F0FDF4', color: '#16A34A', label: 'Paid' },
    partial: { bg: '#FFFBEB', color: '#D97706', label: 'Partial' },
    unpaid:  { bg: '#FEF2F2', color: '#DC2626', label: 'Unpaid' },
    not_due: { bg: '#F0F4FF', color: '#6366F1', label: 'Not Due' },
  };
  const s = map[status] ?? { bg: '#F8FAFC', color: '#64748B', label: status };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>{s.label}</span>
  );
}

export default function TenantDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <TenantLayout>
      <div className="py-8 space-y-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </TenantLayout>
  );

  const rec = data?.current_record;

  return (
    <TenantLayout>
      <div className="py-6 space-y-5">
        {/* Hero */}
        <div className="rounded-2xl px-6 py-5 text-white"
          style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}>
          <p className="text-sm opacity-75 mb-1">Welcome back,</p>
          <h1 className="text-2xl font-bold mb-3">{data?.name}</h1>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Home size={14} />
            <span>Unit {data?.unit_number} · {data?.property_name}</span>
          </div>
        </div>

        {/* Rent status card */}
        <div className="rounded-2xl px-5 py-4" style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: '#374151' }}>
              Rent — {data?.current_month}
            </p>
            {rec ? statusBadge(rec.status) : statusBadge('not_due')}
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold" style={{ color: '#1E293B' }}>
              ₹{(rec?.amount_due ?? data?.rent_amount ?? 0).toLocaleString('en-IN')}
            </span>
            <span className="text-sm mb-1" style={{ color: '#94A3B8' }}>due</span>
          </div>
          {rec && rec.amount_paid > 0 && (
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>
              ₹{rec.amount_paid.toLocaleString('en-IN')} paid
              {rec.payment_mode ? ` via ${rec.payment_mode}` : ''}
            </p>
          )}
          <button
            onClick={() => navigate('/tenant/rent')}
            className="mt-3 text-xs font-semibold"
            style={{ color: '#6366F1' }}
          >
            View full history →
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl px-4 py-4 flex flex-col gap-1"
            style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-1">
              <Wrench size={15} style={{ color: '#6366F1' }} />
              <span className="text-xs font-semibold" style={{ color: '#64748B' }}>Open Requests</span>
            </div>
            <span className="text-2xl font-bold" style={{ color: '#1E293B' }}>{data?.open_requests ?? 0}</span>
            <button onClick={() => navigate('/tenant/maintenance')}
              className="text-xs font-semibold text-left mt-1" style={{ color: '#6366F1' }}>
              View all →
            </button>
          </div>

          <div className="rounded-2xl px-4 py-4 flex flex-col gap-1"
            style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={15} style={{ color: '#6366F1' }} />
              <span className="text-xs font-semibold" style={{ color: '#64748B' }}>Deposit</span>
            </div>
            <span className="text-2xl font-bold" style={{ color: '#1E293B' }}>
              ₹{(data?.deposit_amount ?? 0).toLocaleString('en-IN')}
            </span>
            <span className="text-xs" style={{ color: '#94A3B8' }}>held</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-2xl px-5 py-4 space-y-2" style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>Quick actions</p>
          {[
            { icon: Wrench, label: 'New maintenance request', path: '/tenant/maintenance' },
            { icon: Bell,   label: 'View announcements',      path: '/tenant/announcements' },
          ].map(({ icon: Icon, label, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
              style={{ color: '#374151' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Icon size={16} style={{ color: '#6366F1' }} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </TenantLayout>
  );
}
