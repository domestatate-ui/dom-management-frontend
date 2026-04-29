import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, LogOut, Wrench } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

const NAV = [
  { label: 'Home',        icon: LayoutDashboard, path: '/'            },
  { label: 'Tenants',     icon: Users,           path: '/tenants'     },
  { label: 'Properties',  icon: Home,            path: '/properties'  },
  { label: 'Maintenance', icon: Wrench,          path: '/maintenance' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const active = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20"
      style={{ background: '#fff', borderTop: '1px solid #E2E8F0', boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}>
      <div className="flex items-center safe-area-bottom">
        {NAV.map(({ label, icon: Icon, path }) => {
          const on = active(path);
          return (
            <button key={path} onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors relative"
              style={{ color: on ? '#6366F1' : '#94A3B8' }}>
              {on && <div className="w-10 h-1 rounded-full absolute top-0" style={{ background: '#6366F1' }} />}
              <Icon size={20} strokeWidth={on ? 2.5 : 1.8} />
              <span style={{ fontSize: '9px', fontWeight: on ? 700 : 500 }}>{label}</span>
            </button>
          );
        })}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex-1 flex flex-col items-center py-3 gap-0.5"
          style={{ color: '#94A3B8' }}>
          <LogOut size={20} strokeWidth={1.8} />
          <span style={{ fontSize: '9px', fontWeight: 500 }}>Logout</span>
        </button>
      </div>
    </nav>
  );
}
