import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Home, IndianRupee, Calendar } from 'lucide-react';
import { getUnits } from '../../api/landlord/units';
import { createTenant } from '../../api/landlord/tenants';
import { useToast } from '../../components/shared/Toast';

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#64748B' }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
            {icon}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

const inputStyle = (hasIcon = true) => ({
  width: '100%',
  paddingLeft: hasIcon ? '2.75rem' : '1rem',
  paddingRight: '1rem',
  paddingTop: '0.875rem',
  paddingBottom: '0.875rem',
  borderRadius: '0.75rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  outline: 'none',
  background: '#F8FAFF',
  border: '2px solid #E2E8F0',
  color: '#0F172A',
  transition: 'border-color 0.15s',
  appearance: 'none',
});

const onFocus = (e) => { e.target.style.borderColor = '#6366F1'; };
const onBlur  = (e) => { e.target.style.borderColor = '#E2E8F0'; };

export default function AddTenant() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vacantUnits, setVacantUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    unit_id: '', rent_amount: '', deposit_amount: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    getUnits()
      .then((res) => setVacantUnits(res.data.filter((u) => u.status === 'vacant')))
      .catch(console.error);
  }, []);

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      if (field === 'unit_id') {
        const unit = vacantUnits.find((u) => u.id === parseInt(val));
        if (unit) next.rent_amount = String(unit.rent_amount);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createTenant({
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        unit_id: parseInt(form.unit_id),
        rent_amount: parseFloat(form.rent_amount),
        deposit_amount: parseFloat(form.deposit_amount) || 0,
        start_date: form.start_date,
      });
      toast('Tenant added successfully');
      navigate('/tenants');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add tenant. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="page-enter max-w-2xl">
      <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-6 font-semibold text-sm"
              style={{ color: '#6366F1' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="text-2xl sm:text-3xl font-black mb-6" style={{ color: '#0F172A' }}>Add Tenant</h1>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-5 text-sm font-medium"
             style={{ background: '#FFF1F2', color: '#E11D48', border: '1px solid #FFE4E6' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl p-6"
             style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#94A3B8' }}>Tenant Info</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Full Name *" icon={<User size={15} />}>
                <input style={inputStyle()} value={form.name} onChange={set('name')}
                       onFocus={onFocus} onBlur={onBlur} required placeholder="Ravi Kumar" />
              </Field>
            </div>
            <Field label="Phone" icon={<Phone size={15} />}>
              <input style={inputStyle()} type="tel" value={form.phone} onChange={set('phone')}
                     onFocus={onFocus} onBlur={onBlur} placeholder="9876543210" />
            </Field>
            <Field label="Email" icon={<Mail size={15} />}>
              <input style={inputStyle()} type="email" value={form.email} onChange={set('email')}
                     onFocus={onFocus} onBlur={onBlur} placeholder="ravi@example.com" />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl p-6"
             style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#94A3B8' }}>Lease Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Unit *" icon={<Home size={15} />}>
                <select style={inputStyle()} value={form.unit_id} onChange={set('unit_id')}
                        onFocus={onFocus} onBlur={onBlur} required>
                  <option value="">Select a vacant unit</option>
                  {vacantUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      Room {u.unit_number} – ₹{Number(u.rent_amount).toLocaleString('en-IN')}/mo
                    </option>
                  ))}
                </select>
                {vacantUnits.length === 0 && (
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: '#F97316' }}>No vacant units available</p>
                )}
              </Field>
            </div>
            <Field label="Rent Amount (₹) *" icon={<IndianRupee size={15} />}>
              <input style={inputStyle()} type="number" min="0" value={form.rent_amount} onChange={set('rent_amount')}
                     onFocus={onFocus} onBlur={onBlur} required placeholder="5000" />
            </Field>
            <Field label="Security Deposit (₹)" icon={<IndianRupee size={15} />}>
              <input style={inputStyle()} type="number" min="0" value={form.deposit_amount} onChange={set('deposit_amount')}
                     onFocus={onFocus} onBlur={onBlur} placeholder="10000" />
            </Field>
            <Field label="Start Date *" icon={<Calendar size={15} />}>
              <input style={inputStyle()} type="date" value={form.start_date} onChange={set('start_date')}
                     onFocus={onFocus} onBlur={onBlur} required />
            </Field>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || vacantUnits.length === 0}
          className="w-full sm:w-auto sm:px-16 py-4 rounded-2xl font-bold text-sm text-white transition-opacity"
          style={{
            background: 'linear-gradient(135deg,#6366F1,#4F46E5)',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
            opacity: (loading || vacantUnits.length === 0) ? 0.6 : 1,
          }}
        >
          {loading ? 'Saving…' : 'Add Tenant'}
        </button>
      </form>
    </div>
  );
}
