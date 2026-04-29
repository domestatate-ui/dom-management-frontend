import { createContext, useContext, useState } from 'react';

const TenantAuthContext = createContext(null);

export function TenantAuthProvider({ children }) {
  const [tenant, setTenant] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tenant_user')); } catch { return null; }
  });

  const token = localStorage.getItem('tenant_token');

  function loginTenant(data) {
    localStorage.setItem('tenant_token', data.access_token);
    localStorage.setItem('tenant_user', JSON.stringify({ id: data.tenant_id, name: data.name }));
    setTenant({ id: data.tenant_id, name: data.name });
  }

  function logoutTenant() {
    localStorage.removeItem('tenant_token');
    localStorage.removeItem('tenant_user');
    setTenant(null);
  }

  return (
    <TenantAuthContext.Provider value={{ tenant, token, loginTenant, logoutTenant }}>
      {children}
    </TenantAuthContext.Provider>
  );
}

export function useTenantAuth() {
  return useContext(TenantAuthContext);
}
