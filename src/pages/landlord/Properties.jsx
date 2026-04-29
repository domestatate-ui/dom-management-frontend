import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, MapPin, Layers, Pencil, Trash2 } from 'lucide-react';
import { getProperties, updateProperty, deleteProperty } from '../../api/landlord/properties';
import { useToast } from '../../components/shared/Toast';

const PROPERTY_TYPES = ['residential', 'commercial', 'mixed'];

const TYPE_STYLE = {
  residential: { bg: '#EEF2FF', color: '#4F46E5' },
  commercial:  { bg: '#FFF7ED', color: '#C2410C' },
  mixed:       { bg: '#F0FDF4', color: '#15803D' },
};

function OccupancyBar({ occupied, total }) {
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ color: '#94A3B8' }}>
        <span>{occupied} occupied</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#E2E8F0' }}>
        <div className="h-1.5 rounded-full transition-all duration-500"
             style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6366F1,#7C3AED)' }} />
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.625rem 0.75rem',
  borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 500,
  outline: 'none', background: '#F8FAFF', border: '1.5px solid #E2E8F0', color: '#0F172A',
  transition: 'border-color 0.15s',
};
const onFocus = (e) => { e.target.style.borderColor = '#6366F1'; };
const onBlur  = (e) => { e.target.style.borderColor = '#E2E8F0'; };

function EditForm({ prop, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:         prop.name,
    address:      prop.address ?? '',
    city:         prop.city ?? '',
    pincode:      prop.pincode ?? '',
    type:         prop.type ?? 'residential',
    total_floors: prop.total_floors ?? '',
  });
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  return (
    <div className="space-y-3 pt-1">
      {[
        { label: 'Name',    field: 'name',    type: 'text',   placeholder: 'Building name' },
        { label: 'Address', field: 'address', type: 'text',   placeholder: 'Street address' },
        { label: 'City',    field: 'city',    type: 'text',   placeholder: 'City' },
        { label: 'Pincode', field: 'pincode', type: 'text',   placeholder: 'Pincode' },
        { label: 'Floors',  field: 'total_floors', type: 'number', placeholder: 'No. of floors' },
      ].map(({ label, field, type, placeholder }) => (
        <div key={field}>
          <label className="block text-xs font-semibold mb-0.5" style={{ color: '#94A3B8' }}>{label}</label>
          <input type={type} value={form[field]} onChange={set(field)}
                 style={inputStyle} placeholder={placeholder}
                 onFocus={onFocus} onBlur={onBlur} />
        </div>
      ))}
      <div>
        <label className="block text-xs font-semibold mb-0.5" style={{ color: '#94A3B8' }}>Type</label>
        <select value={form.type} onChange={set('type')} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
          {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
                className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={{ background: '#F1F5F9', color: '#64748B' }}>
          Cancel
        </button>
        <button onClick={() => onSave(form)}
                className="flex-2 py-2 rounded-xl text-xs font-bold text-white"
                style={{ flex: 2, background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
          Save
        </button>
      </div>
    </div>
  );
}

function PropertyCard({ prop, onUpdated, onDeleted }) {
  const { toast } = useToast();
  const navigate   = useNavigate();
  const [editing, setEditing]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const typeStyle = TYPE_STYLE[prop.type] ?? TYPE_STYLE.residential;

  const handleSave = async (form) => {
    try {
      await updateProperty(prop.id, {
        name:         form.name || undefined,
        address:      form.address || null,
        city:         form.city || null,
        pincode:      form.pincode || null,
        type:         form.type || undefined,
        total_floors: form.total_floors ? parseInt(form.total_floors) : null,
      });
      toast('Property updated');
      setEditing(false);
      onUpdated();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update property', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${prop.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteProperty(prop.id);
      toast('Property deleted');
      onDeleted();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to delete property', 'error');
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 transition-shadow hover:shadow-lg"
         style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
            <Building2 size={20} color="#fff" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-base truncate" style={{ color: '#0F172A' }}>{prop.name}</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: typeStyle.bg, color: typeStyle.color }}>
              {prop.type}
            </span>
          </div>
        </div>
        {!editing && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => setEditing(true)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#EEF2FF', color: '#6366F1' }}>
              <Pencil size={13} />
            </button>
            <button onClick={handleDelete} disabled={deleting}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#FFF1F2', color: '#E11D48' }}>
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <EditForm prop={prop} onSave={handleSave} onCancel={() => setEditing(false)} />
      ) : (
        <>
          <div className="space-y-1">
            {prop.address && (
              <div className="flex items-start gap-1.5 text-xs" style={{ color: '#64748B' }}>
                <MapPin size={12} style={{ flexShrink: 0, marginTop: 1, color: '#94A3B8' }} />
                <span>{prop.address}{prop.city ? `, ${prop.city}` : ''}{prop.pincode ? ` – ${prop.pincode}` : ''}</span>
              </div>
            )}
            {prop.total_floors && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
                <Layers size={12} style={{ color: '#94A3B8' }} />
                <span>{prop.total_floors} floors</span>
              </div>
            )}
          </div>

          <OccupancyBar occupied={prop.occupied_count} total={prop.unit_count} />

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total',    value: prop.unit_count,                          color: '#6366F1' },
              { label: 'Occupied', value: prop.occupied_count,                      color: '#059669' },
              { label: 'Vacant',   value: prop.unit_count - prop.occupied_count,    color: '#D97706' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-2.5 text-center"
                   style={{ background: '#F8FAFF', border: '1px solid #E2E8F0' }}>
                <p className="text-lg font-black" style={{ color }}>{value}</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(`/units?property_id=${prop.id}`)}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: '#EEF2FF', color: '#4F46E5' }}
          >
            View Units
          </button>
        </>
      )}
    </div>
  );
}

export default function Properties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetchProperties = async () => {
    try { setProperties((await getProperties()).data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProperties(); }, []);

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black" style={{ color: '#0F172A' }}>Properties</h1>
          <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>{properties.length} building{properties.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('/add-property')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
        >
          <Plus size={15} /> Add Property
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: '#fff', border: '1.5px solid #E2E8F0', height: 280 }}>
              <div className="flex gap-3 mb-4">
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="skeleton" style={{ height: 16, width: '70%' }} />
                  <div className="skeleton" style={{ height: 12, width: '40%' }} />
                </div>
              </div>
              <div className="skeleton" style={{ height: 12, marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 8, borderRadius: 99, marginBottom: 16 }} />
              <div className="grid grid-cols-3 gap-2">
                {[0,1,2].map((j) => <div key={j} className="skeleton" style={{ height: 56, borderRadius: 12 }} />)}
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl"
             style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
          <Building2 size={48} className="mb-4" style={{ color: '#C7D2FE' }} />
          <p className="font-bold text-lg mb-1" style={{ color: '#0F172A' }}>No properties yet</p>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>Add your first building to get started</p>
          <button onClick={() => navigate('/add-property')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            <Plus size={15} /> Add Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((p) => (
            <PropertyCard key={p.id} prop={p} onUpdated={fetchProperties} onDeleted={fetchProperties} />
          ))}
        </div>
      )}
    </div>
  );
}
