import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import TenantLayout from '../../components/tenant/layout/TenantLayout';
import { getTenantAnnouncements } from '../../api/tenant/portal';

export default function TenantAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantAnnouncements().then(setAnnouncements).finally(() => setLoading(false));
  }, []);

  return (
    <TenantLayout>
      <div className="py-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>Announcements</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Updates from your landlord</p>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={40} className="mx-auto mb-3" style={{ color: '#E2E8F0' }} />
            <p className="text-sm" style={{ color: '#94A3B8' }}>No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="rounded-2xl px-5 py-4"
                style={{ background: '#fff', border: '1.5px solid #E2E8F0' }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)' }}>
                    <Bell size={14} style={{ color: '#6366F1' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{a.title}</p>
                    {a.body && (
                      <p className="text-sm mt-1 leading-relaxed" style={{ color: '#475569' }}>{a.body}</p>
                    )}
                    <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>
                      {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TenantLayout>
  );
}
