import client from '../client';

export const getTenants   = (month)        => client.get('/tenants', { params: month ? { month } : {} });
export const getTenant    = (id, month)    => client.get(`/tenants/${id}`, { params: month ? { month } : {} });
export const createTenant = (data)         => client.post('/tenants', data);
export const updateTenant = (id, data)     => client.patch(`/tenants/${id}`, data);
export const enablePortal = (id, password) => client.post(`/tenants/${id}/enable-portal`, { password });
