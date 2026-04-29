import client from '../client';

export const endLease = (id) => client.patch(`/leases/${id}/end`);
