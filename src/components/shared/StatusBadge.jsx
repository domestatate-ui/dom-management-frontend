const CONFIG = {
  paid:    { bg: '#ECFDF5', color: '#059669', dot: '#10B981', label: 'Paid' },
  unpaid:  { bg: '#FFF1F2', color: '#E11D48', dot: '#F43F5E', label: 'Unpaid' },
  partial: { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B', label: 'Partial' },
};

export default function StatusBadge({ status }) {
  const c = CONFIG[status] ?? { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8', label: status };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}
