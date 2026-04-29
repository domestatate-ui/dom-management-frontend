import tenantClient from './client';

export const getTenantDashboard     = ()     => tenantClient.get('/tenant/portal/dashboard').then(r => r.data);
export const getTenantRentHistory   = ()     => tenantClient.get('/tenant/portal/rent-history').then(r => r.data);
export const getTenantMaintenance   = ()     => tenantClient.get('/tenant/portal/maintenance').then(r => r.data);
export const createMaintenanceRequest = (data) => tenantClient.post('/tenant/portal/maintenance', data).then(r => r.data);
export const getTenantAnnouncements = ()     => tenantClient.get('/tenant/portal/announcements').then(r => r.data);
