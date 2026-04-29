import { createContext, useContext, useReducer, useCallback } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [...state, action.payload];
    case 'REMOVE': return state.filter((t) => t.id !== action.id);
    default:       return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    dispatch({ type: 'ADD', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE', id }), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1400, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '22rem' }}>
        {toasts.map((t) => (
          <div key={t.id}
               style={{
                 display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                 padding: '0.875rem 1rem',
                 background: '#fff',
                 border: '1.5px solid #E2E8F0',
                 borderRadius: '1rem',
                 boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                 animation: 'fadeUp 0.2s ease-out',
               }}>
            {t.type === 'success'
              ? <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0, marginTop: 1 }} />
              : <XCircle     size={18} style={{ color: '#E11D48', flexShrink: 0, marginTop: 1 }} />}
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', flex: 1 }}>{t.message}</p>
            <button
              onClick={() => dispatch({ type: 'REMOVE', id: t.id })}
              style={{ color: '#94A3B8', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
