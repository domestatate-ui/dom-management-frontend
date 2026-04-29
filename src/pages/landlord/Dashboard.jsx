import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, RefreshCw, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getDashboard } from '../../api/landlord/dashboard';
import { generateRentRecords } from '../../api/landlord/rentRecords';
import { getProperties } from '../../api/landlord/properties';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/shared/Toast';
import MarkPaymentModal from '../../components/landlord/MarkPaymentModal';

const fmt = (n) => Number(n ?? 0).toLocaleString('en-IN');

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

const monthLabel = (m) =>
  new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

function KpiCard({ label, value, sub, gradient, textLight }) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: gradient }}>
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <p className="relative text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: textLight }}>{label}</p>
      <p className="relative text-3xl font-black text-white">₹{fmt(value)}</p>
      {sub && <p className="relative text-xs mt-1.5" style={{ color: textLight }}>{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [month, setMonth]           = useState(() => new Date().toISOString().slice(0, 7));
  const [propertyId, setPropertyId] = useState('');
  const [properties, setProperties] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [generating, setGen]        = useState(false);
  const [modal, setModal]           = useState({ open: false });
  const monthOptions                = getMonthOptions();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = { month };
      if (propertyId) params.property_id = parseInt(propertyId);
      setStats((await getDashboard(params)).data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    getProperties().then((r) => setProperties(r.data)).catch(console.error);
  }, []);

  useEffect(() => { fetchStats(); }, [month, propertyId]);

  const generate = async () => {
    setGen(true);
    try {
      await generateRentRecords(month);
      await fetchStats();
      toast('Rent records synced');
    } catch {
      toast('Sync failed', 'error');
    } finally {
      setGen(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pct = stats?.total_expected > 0
    ? Math.round((stats.collected / stats.total_expected) * 100)
    : 0;

  const activeProperty = propertyId ? properties.find((p) => p.id === parseInt(propertyId)) : null;

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-medium mb-0.5" style={{ color: '#6366F1' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-black" style={{ color: '#0F172A' }}>
            {greeting()}, {user?.name ?? 'Landlord'} 👋
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {properties.length > 1 && (
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="text-sm font-semibold focus:outline-none rounded-xl px-3 py-2"
              style={{ background: '#fff', border: '1.5px solid #E2E8F0', color: '#0F172A', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}
            >
              <option value="">All Properties</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="text-sm font-semibold focus:outline-none rounded-xl px-3 py-2"
            style={{ background: '#fff', border: '1.5px solid #E2E8F0', color: '#0F172A', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}
          >
            {monthOptions.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <button onClick={generate} disabled={generating} title="Sync rent records"
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <RefreshCw size={16} className={generating ? 'animate-spin text-indigo-500' : 'text-slate-500'} />
          </button>
        </div>
      </div>

      {/* Hero collected card */}
      <div className="rounded-3xl p-6 mb-4 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg,#4F46E5 0%,#6366F1 50%,#7C3AED 100%)', boxShadow: '0 20px 60px rgba(99,102,241,0.3)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle,#fff,transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle,#fff,transparent)', transform: 'translate(-30%,30%)' }} />

        <div className="relative flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {activeProperty ? activeProperty.name : 'All Properties'} · Rent Collected · {monthLabel(month)}
            </p>
            <p className="text-4xl sm:text-5xl font-black text-white">₹{fmt(stats?.collected)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(255,255,255,0.15)' }}>
            <TrendingUp size={18} color="white" />
          </div>
        </div>

        <div className="relative">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <span>{pct}% collected</span>
            <span>of ₹{fmt(stats?.total_expected)} expected</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div className="h-2 rounded-full transition-all duration-700"
                 style={{ width: `${pct}%`, background: 'rgba(255,255,255,0.9)' }} />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Pending"    value={stats?.pending}  sub={`${stats?.defaulters_count ?? 0} tenants`}
                 gradient="linear-gradient(135deg,#F97316,#EA580C)" textLight="rgba(255,255,255,0.65)" />
        <KpiCard label="Defaulters" value={stats?.pending}
                 gradient="linear-gradient(135deg,#EF4444,#DC2626)" textLight="rgba(255,255,255,0.65)" />
        {[
          { label: 'Total Units', value: stats?.total_units    ?? 0, icon: '🏢', color: '#6366F1' },
          { label: 'Occupied',    value: stats?.occupied_units ?? 0, icon: '🔑', color: '#059669' },
          { label: 'Vacant',      value: stats?.vacant_units   ?? 0, icon: '🔓', color: '#D97706' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="rounded-2xl p-4 flex flex-col gap-2"
               style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>{label}</p>
          </div>
        ))}
        <div className="hidden xl:block" />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={() => navigate('/tenants')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
          View Tenants <ArrowRight size={15} />
        </button>
        <button onClick={() => navigate('/add-tenant')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: '#fff', color: '#475569', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <UserPlus size={15} /> Add Tenant
        </button>
      </div>

      {/* Defaulters */}
      {stats?.defaulters?.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-base" style={{ color: '#0F172A' }}>Defaulters</h2>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: '#FFF1F2', color: '#E11D48' }}>
              {stats.defaulters.length} pending
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {stats.defaulters.map((d) => (
              <div key={d.rent_record_id}
                   className="rounded-2xl p-4 flex items-center justify-between gap-3 transition-shadow hover:shadow-md"
                   style={{ background: '#fff', border: '1.5px solid #FFE4E6', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                       style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)' }}>
                    {d.tenant_name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: '#0F172A' }}>{d.tenant_name}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>
                      Room {d.unit_number}
                      {d.property_name && <span className="ml-1" style={{ color: '#C7D2FE' }}>· {d.property_name}</span>}
                      {' '}· ₹{fmt(d.balance)}
                      {d.amount_paid > 0 && <span className="text-amber-500 ml-1">partial</span>}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModal({ open: true, tenantName: d.tenant_name, amountDue: d.balance, rentRecordId: d.rent_record_id })}
                  className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}>
                  Pay
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 rounded-3xl"
             style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
          <CheckCircle2 size={48} className="mb-3" style={{ color: '#10B981' }} />
          <p className="font-bold" style={{ color: '#0F172A' }}>All rents collected!</p>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>No defaulters this month.</p>
        </div>
      )}

      <MarkPaymentModal
        open={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        tenantName={modal.tenantName}
        amountDue={modal.amountDue}
        rentRecordId={modal.rentRecordId}
        onSuccess={fetchStats}
      />
    </div>
  );
}
