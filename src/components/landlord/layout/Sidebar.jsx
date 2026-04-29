import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, LogOut, Wrench } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import client from '../../../api/client';

const NAV = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/'            },
  { label: 'Tenants',     icon: Users,           path: '/tenants'     },
  { label: 'Properties',  icon: Home,            path: '/properties'  },
  { label: 'Maintenance', icon: Wrench,          path: '/maintenance' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const active = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 z-30"
      style={{ background: '#0B0F1A' }}>

      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
          style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)' }}>D</div>
        <div>
          <p className="font-bold text-white text-sm tracking-tight">DOM</p>
          <p className="text-xs" style={{ color: '#64748B' }}>Property Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map(({ label, icon: Icon, path }) => {
          const on = active(path);
          return (
            <button key={path} onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left"
              style={on
                ? { background: 'linear-gradient(135deg,#6366F1,#4F46E5)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }
                : { color: '#64748B' }}
              onMouseEnter={(e) => { if (!on) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; } }}
              onMouseLeave={(e) => { if (!on) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; } }}
            >
              <Icon size={17} strokeWidth={on ? 2.5 : 2} />
              {label}
              {on && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
            {user?.name?.[0] ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs" style={{ color: '#475569' }}>Landlord</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: '#475569' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#F87171'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
        >
          <LogOut size={17} /> Sign out
        </button>
        <button
          onClick={async () => {
            if (!window.confirm('Reset all demo data? This cannot be undone.')) return;
            try { await client.post('/seed/reset'); window.location.reload(); }
            catch { alert('Reset failed — make sure ALLOW_SEED_RESET=true is set on the backend.'); }
          }}
          className="w-full text-center mt-1 py-1 text-xs transition-colors"
          style={{ color: '#1E293B', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#64748B'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#1E293B'; }}
        >
          reset demo
        </button>
      </div>
    </aside>
  );
}
