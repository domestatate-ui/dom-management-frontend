import client from '../client';

export const getRentRecords     = (month)         => client.get('/rent-records', { params: { month } });
export const payRentRecord      = (id, data)      => client.patch(`/rent-records/${id}/pay`, data);
export const generateRentRecords = (month)        => client.post('/rent-records/generate', null, { params: { month } });
