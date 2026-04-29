import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Hash, Layers } from 'lucide-react';
import { createProperty } from '../../api/landlord/properties';
import { useToast } from '../../components/shared/Toast';

const PROPERTY_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial',  label: 'Commercial'  },
  { value: 'mixed',       label: 'Mixed Use'   },
];

const inputStyle = {
  width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem',
  paddingTop: '0.875rem', paddingBottom: '0.875rem',
  borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500,
  outline: 'none', background: '#F8FAFF', border: '2px solid #E2E8F0',
  color: '#0F172A', transition: 'border-color 0.15s',
};
const selectStyle = { ...inputStyle, paddingLeft: '1rem', appearance: 'none' };
const onFocus = (e) => { e.target.style.borderColor = '#6366F1'; };
const onBlur  = (e) => { e.target.style.borderColor = '#E2E8F0'; };

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#64748B' }}>{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>{icon}</div>}
        {children}
      </div>
    </div>
  );
}

export default function AddProperty() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm] = useState({
    name: '', address: '', city: '', pincode: '', type: 'residential', total_floors: '',
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await createProperty({
        name:         form.name,
        address:      form.address  || null,
        city:         form.city     || null,
        pincode:      form.pincode  || null,
        type:         form.type,
        total_floors: form.total_floors ? parseInt(form.total_floors) : null,
      });
      toast('Property added successfully');
      navigate('/properties');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add property.');
      setLoading(false);
    }
  };

  return (
    <div className="page-enter max-w-lg">
      <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-6 font-semibold text-sm"
              style={{ color: '#6366F1' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="text-2xl sm:text-3xl font-black mb-6" style={{ color: '#0F172A' }}>Add Property</h1>

      {error && (
        <div className="px-4 py-3 rounded-2xl mb-5 text-sm font-medium"
             style={{ background: '#FFF1F2', color: '#E11D48', border: '1px solid #FFE4E6' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl p-6 mb-4"
             style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#94A3B8' }}>Property Details</p>
          <div className="space-y-4">
            <Field label="Building Name *" icon={<Building2 size={15} />}>
              <input style={inputStyle} value={form.name} onChange={set('name')}
                     onFocus={onFocus} onBlur={onBlur} required placeholder="e.g. Noor Residency" />
            </Field>
            <Field label="Type">
              <select style={selectStyle} value={form.type} onChange={set('type')}
                      onFocus={onFocus} onBlur={onBlur}>
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Address" icon={<MapPin size={15} />}>
              <input style={inputStyle} value={form.address} onChange={set('address')}
                     onFocus={onFocus} onBlur={onBlur} placeholder="Street address" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" icon={<MapPin size={15} />}>
                <input style={inputStyle} value={form.city} onChange={set('city')}
                       onFocus={onFocus} onBlur={onBlur} placeholder="Chennai" />
              </Field>
              <Field label="Pincode" icon={<Hash size={15} />}>
                <input style={inputStyle} value={form.pincode} onChange={set('pincode')}
                       onFocus={onFocus} onBlur={onBlur} placeholder="600 040" />
              </Field>
            </div>
            <Field label="Total Floors" icon={<Layers size={15} />}>
              <input style={inputStyle} type="number" min="1" value={form.total_floors} onChange={set('total_floors')}
                     onFocus={onFocus} onBlur={onBlur} placeholder="e.g. 4" />
            </Field>
          </div>
        </div>

        <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-opacity"
                style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Adding property…' : 'Add Property'}
        </button>
      </form>
    </div>
  );
}
