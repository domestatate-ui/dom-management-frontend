import client from '../client';

export const getUnits    = (property_id) => client.get('/units', { params: property_id ? { property_id } : {} });
export const createUnit  = (data)        => client.post('/units', data);
