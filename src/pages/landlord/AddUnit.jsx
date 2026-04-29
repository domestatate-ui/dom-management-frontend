import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hash, Layers, IndianRupee, Building2 } from 'lucide-react';
import { getProperties, createProperty } from '../../api/landlord/properties';
import { createUnit } from '../../api/landlord/units';
import { useToast } from '../../components/shared/Toast';

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
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>{icon}</div>
        {children}
      </div>
    </div>
  );
}

export default function AddUnit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties]       = useState([]);
  const [form, setForm]                   = useState({ property_id: '', unit_number: '', floor: '', rent_amount: '' });
  const [loading, setLoading]             = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError]                 = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await getProperties();
        if (data.length > 0) {
          setProperties(data);
          setForm((p) => ({ ...p, property_id: String(data[0].id) }));
        } else {
          const { data: newProp } = await createProperty({ name: 'My Property', address: '' });
          setProperties([newProp]);
          setForm((p) => ({ ...p, property_id: String(newProp.id) }));
        }
      } catch {
        setError('Could not load property info. Please try again.');
      } finally {
        setBootstrapping(false);
      }
    };
    init();
  }, []);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.property_id) return;
    setLoading(true); setError('');
    try {
      await createUnit({
        property_id: parseInt(form.property_id),
        unit_number: form.unit_number,
        floor:       form.floor || null,
        rent_amount: parseFloat(form.rent_amount),
      });
      toast('Unit added successfully');
      navigate('/units');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add unit. Please try again.');
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

      <h1 className="text-2xl sm:text-3xl font-black mb-6" style={{ color: '#0F172A' }}>Add Unit</h1>

      {error && (
        <div className="px-4 py-3 rounded-2xl mb-5 text-sm font-medium"
             style={{ background: '#FFF1F2', color: '#E11D48', border: '1px solid #FFE4E6' }}>
          {error}
        </div>
      )}

      {bootstrapping ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl p-6 mb-4"
               style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#94A3B8' }}>Unit Details</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#64748B' }}>
                  Building {properties.length === 1 && <span style={{ color: '#94A3B8', fontWeight: 400, textTransform: 'none' }}>({properties[0].name})</span>}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}><Building2 size={15} /></div>
                  <select style={selectStyle} value={form.property_id} onChange={set('property_id')}
                          onFocus={onFocus} onBlur={onBlur} required>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}{p.city ? ` — ${p.city}` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Field label="Unit Number *" icon={<Hash size={15} />}>
                <input style={inputStyle} value={form.unit_number} onChange={set('unit_number')}
                       onFocus={onFocus} onBlur={onBlur} required placeholder="101, A1, Ground Floor…" />
              </Field>
              <Field label="Floor" icon={<Layers size={15} />}>
                <input style={inputStyle} value={form.floor} onChange={set('floor')}
                       onFocus={onFocus} onBlur={onBlur} placeholder="Ground, 1st, 2nd…" />
              </Field>
              <Field label="Monthly Rent (₹) *" icon={<IndianRupee size={15} />}>
                <input style={inputStyle} type="number" min="0" value={form.rent_amount} onChange={set('rent_amount')}
                       onFocus={onFocus} onBlur={onBlur} required placeholder="5000" />
              </Field>
            </div>
          </div>

          <button type="submit" disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-opacity"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Adding unit…' : 'Add Unit'}
          </button>
        </form>
      )}
    </div>
  );
}
