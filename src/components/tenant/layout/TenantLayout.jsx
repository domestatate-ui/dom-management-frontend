import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Wrench, Bell, FileText, LogOut } from 'lucide-react';
import { useTenantAuth } from '../../../hooks/useTenantAuth';

const NAV = [
  { label: 'Home',        icon: LayoutDashboard, path: '/tenant/dashboard'     },
  { label: 'Rent',        icon: CreditCard,      path: '/tenant/rent'          },
  { label: 'Maintenance', icon: Wrench,          path: '/tenant/maintenance'   },
  { label: 'Agreement',   icon: FileText,        path: '/tenant/agreement'     },
  { label: 'Updates',     icon: Bell,            path: '/tenant/announcements' },
];

export default function TenantLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant, logoutTenant } = useTenantAuth();

  const active = (path) => location.pathname === path;

  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF' }}>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs"
            style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)' }}>D</div>
          <span className="font-bold text-sm" style={{ color: '#1E293B' }}>DOM Tenant</span>
        </div>
        <span className="text-sm font-medium" style={{ color: '#64748B' }}>{tenant?.name}</span>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 z-30"
        style={{ background: '#0B0F1A' }}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
            style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)' }}>D</div>
          <div>
            <p className="font-bold text-white text-sm tracking-tight">DOM</p>
            <p className="text-xs" style={{ color: '#64748B' }}>Tenant Portal</p>
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
              {tenant?.name?.[0] ?? 'T'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{tenant?.name}</p>
              <p className="text-xs" style={{ color: '#475569' }}>Tenant</p>
            </div>
          </div>
          <button
            onClick={() => { logoutTenant(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ color: '#475569' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#F87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-8 px-4 lg:px-8 max-w-4xl lg:max-w-none mx-auto">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20"
        style={{ background: '#fff', borderTop: '1px solid #E2E8F0', boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}>
        <div className="flex items-center">
          {NAV.map(({ label, icon: Icon, path }) => {
            const on = active(path);
            return (
              <button key={path} onClick={() => navigate(path)}
                className="flex-1 flex flex-col items-center py-3 gap-0.5 relative"
                style={{ color: on ? '#6366F1' : '#94A3B8' }}>
                {on && <div className="w-10 h-1 rounded-full absolute top-0" style={{ background: '#6366F1' }} />}
                <Icon size={20} strokeWidth={on ? 2.5 : 1.8} />
                <span style={{ fontSize: '9px', fontWeight: on ? 700 : 500 }}>{label}</span>
              </button>
            );
          })}
          <button onClick={() => { logoutTenant(); navigate('/login'); }}
            className="flex-1 flex flex-col items-center py-3 gap-0.5"
            style={{ color: '#94A3B8' }}>
            <LogOut size={20} strokeWidth={1.8} />
            <span style={{ fontSize: '9px', fontWeight: 500 }}>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
