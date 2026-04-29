import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DoorOpen, DoorClosed, Plus, Building2 } from 'lucide-react';
import { getUnits } from '../../api/landlord/units';
import { getProperties } from '../../api/landlord/properties';
import { UnitCardSkeleton } from '../../components/shared/Skeleton';

function UnitCard({ unit }) {
  const occ = unit.status === 'occupied';
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 transition-shadow hover:shadow-md"
         style={{ background: '#fff', border: `1.5px solid ${occ ? '#C7D2FE' : '#E2E8F0'}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: occ ? 'linear-gradient(135deg,#6366F1,#4F46E5)' : '#F1F5F9' }}>
          {occ ? <DoorClosed size={18} color="#fff" /> : <DoorOpen size={18} style={{ color: '#94A3B8' }} />}
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={occ ? { background: '#EEF2FF', color: '#4F46E5' } : { background: '#F1F5F9', color: '#64748B' }}>
          {occ ? 'Occupied' : 'Vacant'}
        </span>
      </div>
      <div>
        <p className="text-lg font-black" style={{ color: '#0F172A' }}>Room {unit.unit_number}</p>
        {unit.floor && <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{unit.floor} floor</p>}
      </div>
      <p className="text-sm font-bold" style={{ color: '#475569' }}>
        ₹{Number(unit.rent_amount).toLocaleString('en-IN')}
        <span style={{ color: '#94A3B8', fontWeight: 500 }}>/mo</span>
      </p>
      {occ && unit.tenant_name && (
        <div className="flex items-center gap-2 pt-1" style={{ borderTop: '1px solid #E2E8F0' }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
               style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
            {unit.tenant_name[0]}
          </div>
          <p className="text-xs font-medium truncate" style={{ color: '#475569' }}>{unit.tenant_name}</p>
        </div>
      )}
    </div>
  );
}

function PropertySection({ name, units }) {
  const occupied = units.filter((u) => u.status === 'occupied');
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
          <Building2 size={14} color="#fff" />
        </div>
        <h2 className="font-black text-base" style={{ color: '#0F172A' }}>{name}</h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#EEF2FF', color: '#6366F1' }}>
          {occupied.length}/{units.length} occupied
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {units.map((u) => <UnitCard key={u.id} unit={u} />)}
      </div>
    </section>
  );
}

export default function Units() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterPropertyId = searchParams.get('property_id') ? parseInt(searchParams.get('property_id')) : null;

  const [units, setUnits]           = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      getUnits(filterPropertyId).then((r) => r.data),
      getProperties().then((r) => r.data),
    ])
      .then(([u, p]) => { setUnits(u); setProperties(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterPropertyId]);

  const occupied  = units.filter((u) => u.status === 'occupied');
  const pct       = units.length > 0 ? Math.round((occupied.length / units.length) * 100) : 0;
  const multiProp = properties.length > 1;

  const grouped = properties.reduce((acc, p) => {
    acc[p.id] = { name: p.name, units: units.filter((u) => u.property_id === p.id) };
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="page-enter">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 8, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 140, height: 14, borderRadius: 6 }} />
          </div>
        </div>
        <div className="skeleton rounded-3xl mb-6" style={{ height: 140 }} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <UnitCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (units.length === 0 && !filterPropertyId) {
    return (
      <div className="page-enter">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-black" style={{ color: '#0F172A' }}>Units</h1>
          <button onClick={() => navigate('/add-unit')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            <Plus size={15} /> Add Unit
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl"
             style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
          <Building2 size={48} className="mb-4" style={{ color: '#C7D2FE' }} />
          <p className="font-bold text-lg mb-1" style={{ color: '#0F172A' }}>No units yet</p>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>Add your first unit to get started</p>
          <button onClick={() => navigate('/add-unit')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            <Plus size={15} /> Add Unit
          </button>
        </div>
      </div>
    );
  }

  const activeProperty = filterPropertyId ? properties.find((p) => p.id === filterPropertyId) : null;

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black" style={{ color: '#0F172A' }}>Units</h1>
          <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
            {occupied.length} occupied · {units.length - occupied.length} vacant
          </p>
        </div>
        <div className="flex items-center gap-2">
          {properties.length > 1 && (
            <select
              value={filterPropertyId ?? ''}
              onChange={(e) => {
                if (e.target.value) setSearchParams({ property_id: e.target.value });
                else setSearchParams({});
              }}
              className="text-sm font-semibold focus:outline-none rounded-xl px-3 py-2"
              style={{ background: '#fff', border: '1.5px solid #E2E8F0', color: '#0F172A', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}
            >
              <option value="">All Buildings</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button onClick={() => navigate('/add-unit')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            <Plus size={15} /> Add Unit
          </button>
        </div>
      </div>

      {/* Occupancy hero */}
      <div className="rounded-3xl p-6 mb-6 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg,#4F46E5 0%,#6366F1 50%,#7C3AED 100%)', boxShadow: '0 20px 60px rgba(99,102,241,0.3)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle,#fff,transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {activeProperty ? activeProperty.name : 'All Properties'} · Occupancy
            </p>
            <p className="text-4xl sm:text-5xl font-black text-white">{pct}%</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Total',    value: units.length },
              { label: 'Occupied', value: occupied.length },
              { label: 'Vacant',   value: units.length - occupied.length },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <div className="h-2 rounded-full transition-all duration-700"
               style={{ width: `${pct}%`, background: 'rgba(255,255,255,0.9)' }} />
        </div>
      </div>

      {multiProp && !filterPropertyId
        ? Object.values(grouped).filter((g) => g.units.length > 0).map((g) => (
            <PropertySection key={g.name} name={g.name} units={g.units} />
          ))
        : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {units.map((u) => <UnitCard key={u.id} unit={u} />)}
          </div>
        )
      }
    </div>
  );
}
