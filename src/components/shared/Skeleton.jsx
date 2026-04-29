function Block({ w = '100%', h = 16, radius = 8, style = {} }) {
  return (
    <div className="skeleton" style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...style }} />
  );
}

export function TenantCardSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
        <Block w={44} h={44} radius={12} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Block w="60%" h={14} />
          <Block w="40%" h={11} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 14px' }}>
        <Block w={64} h={22} radius={99} />
        <Block w={72} h={14} />
      </div>
    </div>
  );
}

export function UnitCardSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Block w={40} h={40} radius={12} />
        <Block w={64} h={22} radius={99} />
      </div>
      <Block w="55%" h={18} />
      <Block w="40%" h={12} />
      <Block w="50%" h={14} />
    </div>
  );
}

export function TenantDetailSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
      {/* Hero */}
      <div style={{ background: '#C7D2FE', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Block w={64} h={64} radius={16} style={{ background: 'rgba(255,255,255,0.3)', animation: 'none' }} />
        <Block w="55%" h={20} style={{ background: 'rgba(255,255,255,0.3)', animation: 'none' }} />
        <Block w="35%" h={14} style={{ background: 'rgba(255,255,255,0.3)', animation: 'none' }} />
      </div>
      {/* Details card */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Block w={16} h={16} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Block w="30%" h={10} />
              <Block w="60%" h={13} />
            </div>
          </div>
        ))}
      </div>
      {/* History rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Block w={100} h={14} />
              <Block w={70} h={11} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <Block w={60} h={22} radius={99} />
              <Block w={80} h={13} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
