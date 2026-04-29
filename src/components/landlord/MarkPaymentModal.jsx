import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Check, X, IndianRupee } from 'lucide-react';
import { payRentRecord } from '../../api/landlord/rentRecords';
import { useToast } from '../shared/Toast';

const MODES = [
  { value: 'upi',  label: 'UPI',  emoji: '📱' },
  { value: 'cash', label: 'Cash', emoji: '💵' },
  { value: 'bank', label: 'Bank', emoji: '🏦' },
];

export default function MarkPaymentModal({ open, onClose, tenantName, amountDue, rentRecordId, onSuccess }) {
  const { toast } = useToast();
  const [amount, setAmount]   = useState('');
  const [mode, setMode]       = useState('upi');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (open) { setAmount(amountDue ? String(amountDue) : ''); setMode('upi'); setError(''); }
  }, [open, amountDue]);

  const handleConfirm = async () => {
    if (!amount || isNaN(parseFloat(amount))) { setError('Enter a valid amount'); return; }
    setLoading(true); setError('');
    try {
      await payRentRecord(rentRecordId, {
        amount_paid: parseFloat(amount),
        payment_mode: mode,
        paid_date: new Date().toISOString().split('T')[0],
      });
      onSuccess?.();
      onClose();
      toast('Payment recorded successfully');
    } catch {
      setError('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs"
      PaperProps={{ style: { borderRadius: 24, padding: 0, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' } }}>

      <div className="px-6 pt-6 pb-4 flex items-start justify-between"
        style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
        <div>
          <DialogTitle sx={{ p: 0, color: '#fff', fontWeight: 700, fontSize: '1.125rem' }}>
            Record Payment
          </DialogTitle>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>{tenantName}</p>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
          <X size={16} />
        </button>
      </div>

      <DialogContent sx={{ p: '24px', pt: '20px' }}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>AMOUNT (₹)</label>
            <div className="relative">
              <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
              <input
                type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl text-base font-semibold focus:outline-none transition-all"
                style={{ border: '2px solid #E2E8F0', background: '#F8FAFF', color: '#0F172A' }}
                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                onBlur={(e)  => e.target.style.borderColor = '#E2E8F0'}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#64748B' }}>PAYMENT METHOD</label>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((m) => (
                <button key={m.value} onClick={() => setMode(m.value)}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all text-sm font-semibold"
                  style={mode === m.value
                    ? { background: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)', color: '#4F46E5', border: '2px solid #6366F1' }
                    : { background: '#F8FAFF', color: '#64748B', border: '2px solid #E2E8F0' }}>
                  <span style={{ fontSize: 20 }}>{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm font-medium" style={{ color: '#E11D48' }}>{error}</p>}
        </div>
      </DialogContent>

      <DialogActions sx={{ px: '24px', pb: '24px', pt: 0, gap: '8px' }}>
        <button onClick={onClose} disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-semibold"
          style={{ background: '#F1F5F9', color: '#64748B' }}>
          Cancel
        </button>
        <button onClick={handleConfirm} disabled={loading}
          className="py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity"
          style={{ flex: 2, background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)', opacity: loading ? 0.7 : 1 }}>
          <Check size={17} />
          {loading ? 'Saving…' : 'Confirm Payment'}
        </button>
      </DialogActions>
    </Dialog>
  );
}
