import client from '../client';

export const getAnnouncements    = ()       => client.get('/announcements').then(r => r.data);
export const createAnnouncement  = (data)   => client.post('/announcements', data).then(r => r.data);
export const deleteAnnouncement  = (id)     => client.delete(`/announcements/${id}`);
