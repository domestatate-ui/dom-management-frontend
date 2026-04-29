import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Building2 } from 'lucide-react';
import { login as apiLogin } from '../../api/landlord/auth';
import { useAuth } from '../../hooks/useAuth';
import { useTenantAuth } from '../../hooks/useTenantAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { loginTenant } = useTenantAuth();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await apiLogin(email, password);
      if (data.role === 'tenant') {
        loginTenant({ access_token: data.access_token, tenant_id: data.user_id, name: data.user_name });
        navigate('/tenant/dashboard', { replace: true });
      } else {
        login(data.access_token, { id: data.user_id, name: data.user_name });
        navigate('/', { replace: true });
      }
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F0F4FF' }}>

      {/* Brand panel — desktop only */}
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
            Property<br />management,<br />
            <span style={{ background: 'linear-gradient(90deg,#818CF8,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              simplified.
            </span>
          </p>
          <p className="text-base" style={{ color: '#64748B' }}>
            Track rent, manage tenants, and collect payments in under 10 seconds.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {['Real-time rent tracking', 'One-tap payments', 'Mobile-first'].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(99,102,241,0.2)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.3)' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-xs" style={{ color: '#334155' }}>© 2026 DOM. Built for independent landlords.</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-12">
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl"
            style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)' }}>D</div>
          <span className="font-bold text-gray-900 text-2xl">DOM</span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-black mb-1" style={{ color: '#0F172A' }}>Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: '#64748B' }}>Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
              style={{ background: '#FFF1F2', color: '#E11D48', border: '1px solid #FFE4E6' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                  style={{ background: '#fff', border: '2px solid #E2E8F0', color: '#0F172A' }}
                  onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                  onBlur={(e)  => e.target.style.borderColor = '#E2E8F0'}
                  placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                  style={{ background: '#fff', border: '2px solid #E2E8F0', color: '#0F172A' }}
                  onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                  onBlur={(e)  => e.target.style.borderColor = '#E2E8F0'}
                  placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-opacity mt-2"
              style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#64748B' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#6366F1', fontWeight: 700 }}>Create one</Link>
          </p>

          <div className="mt-4 px-4 py-3 rounded-xl space-y-2" style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2">
              <Building2 size={13} style={{ color: '#6366F1' }} />
              <p className="text-xs font-bold" style={{ color: '#0F172A' }}>Demo accounts</p>
            </div>
            <p className="text-xs" style={{ color: '#64748B' }}>
              <span className="font-semibold" style={{ color: '#374151' }}>Landlord:</span> demo@dom.app / demo123
            </p>
            <p className="text-xs" style={{ color: '#64748B' }}>
              <span className="font-semibold" style={{ color: '#374151' }}>Tenant:</span> rahul@example.com / tenant123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
