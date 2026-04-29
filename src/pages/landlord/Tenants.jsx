import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Phone, ChevronRight } from 'lucide-react';
import { getTenants } from '../../api/landlord/tenants';
import StatusBadge from '../../components/shared/StatusBadge';
import MarkPaymentModal from '../../components/landlord/MarkPaymentModal';
import { TenantCardSkeleton } from '../../components/shared/Skeleton';

const fmt = (n) => Number(n ?? 0).toLocaleString('en-IN');

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6366F1,#4F46E5)',
  'linear-gradient(135deg,#8B5CF6,#7C3AED)',
  'linear-gradient(135deg,#EC4899,#DB2777)',
  'linear-gradient(135deg,#F97316,#EA580C)',
  'linear-gradient(135deg,#059669,#047857)',
  'linear-gradient(135deg,#0EA5E9,#0284C7)',
];

const avatarGrad = (name) => AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];

const getMonthOptions = () => {
  const opts = [];
  const d = new Date();
  for (let i = 0; i < 6; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    opts.push(`${y}-${m}`);
    d.setMonth(d.getMonth() - 1);
  }
  return opts;
};

export default function Tenants() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [month, setMonth]     = useState(() => new Date().toISOString().slice(0, 7));
  const [modal, setModal]     = useState({ open: false, tenantName: '', amountDue: 0, rentRecordId: null });
  const monthOptions          = getMonthOptions();

  const fetchTenants = async () => {
    setLoading(true);
    try { setTenants((await getTenants(month)).data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTenants(); }, [month]);

  const openPayModal = (tenant) => {
    const rr = tenant.active_lease?.current_rent_record;
    setModal({ open: true, tenantName: tenant.name, amountDue: rr ? rr.amount_due - rr.amount_paid : 0, rentRecordId: rr?.id });
  };

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) || t.phone?.includes(search)
  );

  const monthLabel = (m) =>
    new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-black" style={{ color: '#0F172A' }}>Tenants</h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: '#94A3B8' }}>{tenants.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="text-xs sm:text-sm font-semibold focus:outline-none rounded-xl px-2.5 py-2"
            style={{ background: '#fff', border: '1.5px solid #E2E8F0', color: '#0F172A', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
          <button
            onClick={() => navigate('/add-tenant')}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
          >
            <UserPlus size={14} /> Add Tenant
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
        <input
          type="text"
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none transition-all"
          style={{ background: '#fff', border: '1.5px solid #E2E8F0', color: '#0F172A', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          onFocus={(e) => e.target.style.borderColor = '#6366F1'}
          onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <TenantCardSkeleton key={i} />)}
        </div>
      ) : tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl"
             style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
          <p className="font-bold text-lg mb-1" style={{ color: '#0F172A' }}>No tenants yet</p>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>Add your first tenant to get started</p>
          <button onClick={() => navigate('/add-tenant')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            <UserPlus size={15} /> Add Tenant
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl"
             style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
          <p className="font-bold text-lg" style={{ color: '#0F172A' }}>No results</p>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {filtered.map((tenant) => {
            const rr = tenant.active_lease?.current_rent_record;
            const canPay = rr && rr.status !== 'paid';
            const balance = rr ? rr.amount_due - rr.amount_paid : 0;
            return (
              <div key={tenant.id}
                   className="rounded-2xl overflow-hidden flex flex-col transition-shadow hover:shadow-lg"
                   style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-3 p-4 cursor-pointer flex-1"
                     onClick={() => navigate(`/tenants/${tenant.id}`)}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                       style={{ background: avatarGrad(tenant.name) }}>
                    {tenant.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate" style={{ color: '#0F172A' }}>{tenant.name}</p>
                    <p className="text-xs truncate" style={{ color: '#94A3B8' }}>
                      {tenant.active_lease ? `Room ${tenant.active_lease.unit_number}` : 'No active lease'}
                      {tenant.phone && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5">
                          <Phone size={9} />{tenant.phone}
                        </span>
                      )}
                    </p>
                  </div>
                  <ChevronRight size={15} style={{ color: '#CBD5E1', flexShrink: 0 }} />
                </div>
                <div className="flex items-center justify-between px-4 pb-3">
                  <StatusBadge status={rr?.status ?? 'unpaid'} />
                  <span className="text-sm font-bold" style={{ color: '#0F172A' }}>
                    ₹{fmt(tenant.active_lease?.rent_amount)}<span style={{ color: '#94A3B8', fontWeight: 500 }}>/mo</span>
                  </span>
                </div>
                {canPay && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => openPayModal(tenant)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}
                    >
                      Pay · ₹{fmt(balance)}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <MarkPaymentModal
        open={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        tenantName={modal.tenantName}
        amountDue={modal.amountDue}
        rentRecordId={modal.rentRecordId}
        onSuccess={fetchTenants}
      />
    </div>
  );
}
