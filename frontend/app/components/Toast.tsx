'use client';

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  dismissible: boolean;
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info', dismissible?: boolean) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(0);

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', dismissible?: boolean) => {
    const id = nextIdRef.current++;
    const isDismiss = dismissible !== undefined ? dismissible : type === 'error';
    setToasts(prev => [...prev, { id, message, type, dismissible: isDismiss }]);
    if (!isDismiss) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    }
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const COLORS = { success: 'var(--green-800)', error: 'var(--red-700)', info: 'var(--blue-700)' };
  const BGS = { success: 'var(--green-100)', error: 'var(--red-100)', info: 'var(--blue-100)' };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div role="status" aria-live="polite" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
        {toasts.map(t => (
          <div key={t.id} role="alert" style={{
            padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: BGS[t.type], color: COLORS[t.type],
            boxShadow: '0 4px 12px rgba(0,0,0,.15)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            animation: 'slideUp .2s ease-out',
          }}>
            <span>{t.type === 'success' ? '✓ ' : t.type === 'error' ? '✗ ' : 'ℹ '}{t.message}</span>
            {t.dismissible && (
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" style={{ fontSize: 16, padding: 4, lineHeight: 1, opacity: 0.7, flexShrink: 0 }}>✕</button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
