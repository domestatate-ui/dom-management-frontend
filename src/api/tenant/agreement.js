import client from './client';

export const getMyAgreement = () =>
  client.get('/tenant/portal/agreement').then(r => r.data);

export const signAgreement = (agreementId, body) =>
  client.post(`/tenant/portal/agreement/${agreementId}/sign`, body).then(r => r.data);

export const downloadAgreementPdf = (agreementId) =>
  client.get(`/tenant/portal/agreement/${agreementId}/pdf`, { responseType: 'blob' }).then(r => r.data);
