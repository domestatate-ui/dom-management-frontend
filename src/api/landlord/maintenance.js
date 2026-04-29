import client from '../client';

export const getMaintenanceRequests  = (params = {}) => client.get('/maintenance', { params }).then(r => r.data);
export const updateMaintenanceRequest = (id, data)   => client.patch(`/maintenance/${id}`, data).then(r => r.data);
