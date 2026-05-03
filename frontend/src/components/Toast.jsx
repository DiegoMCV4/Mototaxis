// =============================================
// Toast Notification System
// Reemplaza los alert() por notificaciones modernas
// =============================================
import { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const warning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              animation: 'slideInRight 0.3s ease-out',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(12px)',
              background:
                toast.type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                toast.type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                toast.type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                'linear-gradient(135deg, #3b82f6, #2563eb)',
            }}
          >
            <span style={{ fontSize: '18px' }}>
              {toast.type === 'success' ? '✅' :
               toast.type === 'error' ? '❌' :
               toast.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
