import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../../api/landlord/auth';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRight, Lock, Mail, User, Phone, Building2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await apiRegister({
        name: form.name,
        phone: form.phone || null,
        email: form.email,
        password: form.password,
      });
      login(data.access_token, { id: data.user_id, name: data.user_name });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
    paddingTop: '0.875rem', paddingBottom: '0.875rem',
    borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500,
    outline: 'none', background: '#fff', border: '2px solid #E2E8F0', color: '#0F172A',
    transition: 'border-color 0.15s',
  };
  const onFocus = (e) => { e.target.style.borderColor = '#6366F1'; };
  const onBlur  = (e) => { e.target.style.borderColor = '#E2E8F0'; };

  return (
    <div className="min-h-screen flex" style={{ background: '#F0F4FF' }}>

      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
           style={{ background: 'linear-gradient(145deg,#0B0F1A 0%,#1A1F3A 60%,#2D1B69 100%)' }}>
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
             style={{ background: 'radial-gradient(circle,#6366F1,transparent)', transform: 'translate(-40%,-40%)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-15 blur-3xl"
             style={{ background: 'radial-gradient(circle,#8B5CF6,transparent)', transform: 'translate(40%,40%)' }} />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-lg"
               style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)' }}>D</div>
          <span className="font-bold text-white text-xl tracking-tight">DOM</span>
        </div>

        <div className="relative">
          <p className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
            Set up in<br />under<br />
            <span style={{ background: 'linear-gradient(90deg,#818CF8,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              2 minutes.
            </span>
          </p>
          <p className="text-base" style={{ color: '#64748B' }}>
            Create your account and start tracking rent from day one.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {['Free to start', 'No credit card', 'Mobile-first'].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.3)' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-xs" style={{ color: '#334155' }}>© 2026 DOM. Built for independent landlords.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-12">
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl"
               style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)' }}>D</div>
          <span className="font-bold text-gray-900 text-2xl">DOM</span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-black mb-1" style={{ color: '#0F172A' }}>Create your account</h2>
          <p className="text-sm mb-8" style={{ color: '#64748B' }}>Start managing your property in minutes</p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
                 style={{ background: '#FFF1F2', color: '#E11D48', border: '1px solid #FFE4E6' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <input type="text" value={form.name} onChange={set('name')} required
                       style={inputStyle} onFocus={onFocus} onBlur={onBlur} placeholder="Ravi Kumar" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>Phone <span style={{ color: '#94A3B8', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <input type="tel" value={form.phone} onChange={set('phone')}
                       style={inputStyle} onFocus={onFocus} onBlur={onBlur} placeholder="9876543210" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <input type="email" value={form.email} onChange={set('email')} required
                       style={inputStyle} onFocus={onFocus} onBlur={onBlur} placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <input type="password" value={form.password} onChange={set('password')} required minLength={6}
                       style={inputStyle} onFocus={onFocus} onBlur={onBlur} placeholder="Min. 6 characters" />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-opacity mt-2"
              style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : <><span>Create account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366F1', fontWeight: 700 }}>Sign in</Link>
          </p>

          <div className="mt-4 px-4 py-3 rounded-xl flex items-center gap-3"
               style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: '#EEF2FF' }}>
              <Building2 size={15} style={{ color: '#6366F1' }} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: '#0F172A' }}>Demo Account</p>
              <p className="text-xs" style={{ color: '#64748B' }}>demo@dom.app &nbsp;/&nbsp; demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
