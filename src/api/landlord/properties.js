import client from '../client';

export const getProperties    = ()             => client.get('/properties');
export const createProperty   = (data)         => client.post('/properties', data);
export const updateProperty   = (id, data)     => client.patch(`/properties/${id}`, data);
export const deleteProperty   = (id)           => client.delete(`/properties/${id}`);
