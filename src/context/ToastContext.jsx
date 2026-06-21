import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'default', icon = '') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const success = useCallback((msg) => show(msg, 'success', '✓'), [show]);
  const error   = useCallback((msg) => show(msg, 'error',   '✕'), [show]);
  const info    = useCallback((msg) => show(msg, 'info',    'ℹ'), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info }}>
      {children}
      <div className="dc-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`dc-toast dc-toast-${t.type}`}>
            {t.icon && <span style={{ fontSize: 16, fontWeight: 700 }}>{t.icon}</span>}
            {t.message}
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
