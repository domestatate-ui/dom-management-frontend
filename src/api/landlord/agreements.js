import client from '../client';

export const getAgreementForLease = (leaseId) =>
  client.get(`/agreements/lease/${leaseId}`).then(r => r.data);

export const generateAgreement = (leaseId, body) =>
  client.post(`/agreements/generate/${leaseId}`, body).then(r => r.data);

export const downloadAgreementPdf = (agreementId) =>
  client.get(`/agreements/${agreementId}/pdf`, { responseType: 'blob' }).then(r => r.data);

export const voidAgreement = (agreementId) =>
  client.post(`/agreements/${agreementId}/void`).then(r => r.data);
