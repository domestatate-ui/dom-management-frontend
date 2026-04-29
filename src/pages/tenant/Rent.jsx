import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, MinusCircle } from 'lucide-react';
import TenantLayout from '../../components/tenant/layout/TenantLayout';
import { getTenantRentHistory } from '../../api/tenant/portal';

function StatusIcon({ status }) {
  const map = {
    paid:    { Icon: CheckCircle2, color: '#16A34A' },
    partial: { Icon: Clock,        color: '#D97706' },
    unpaid:  { Icon: AlertCircle,  color: '#DC2626' },
    not_due: { Icon: MinusCircle,  color: '#94A3B8' },
  };
  const { Icon, color } = map[status] ?? map.not_due;
  return <Icon size={18} style={{ color }} />;
}

function badge(status) {
  const map = {
    paid:    { bg: '#F0FDF4', color: '#16A34A', label: 'Paid' },
    partial: { bg: '#FFFBEB', color: '#D97706', label: 'Partial' },
    unpaid:  { bg: '#FEF2F2', color: '#DC2626', label: 'Unpaid' },
    not_due: { bg: '#F8FAFC', color: '#64748B', label: 'Not Due' },
  };
  const s = map[status] ?? map.not_due;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>{s.label}</span>
  );
}

export default function TenantRent() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantRentHistory().then(setHistory).finally(() => setLoading(false));
  }, []);

  const paid  = history.filter(r => r.status === 'paid').length;
  const total = history.length;

  return (
    <TenantLayout>
      <div className="py-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>Payment History</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{paid} of {total} months paid on time</p>
        </div>

        {total > 0 && (
          <div className="rounded-2xl px-5 py-4" style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: '#374151' }}>Payment rate</span>
              <span className="text-xs font-bold" style={{ color: '#6366F1' }}>{Math.round(paid / total * 100)}%</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: '#E2E8F0' }}>
              <div className="h-2 rounded-full transition-all"
                style={{ width: `${paid / total * 100}%`, background: 'linear-gradient(90deg,#6366F1,#3B82F6)' }} />
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : history.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: '#94A3B8' }}>No payment records yet</p>
        ) : (
          <div className="space-y-2">
            {history.map(r => (
              <div key={r.id} className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
                <StatusIcon status={r.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{r.month}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>
                    ₹{r.amount_paid.toLocaleString('en-IN')} / ₹{r.amount_due.toLocaleString('en-IN')}
                    {r.payment_mode ? ` · ${r.payment_mode}` : ''}
                  </p>
                </div>
                {badge(r.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </TenantLayout>
  );
}
