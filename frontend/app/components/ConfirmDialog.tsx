'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

interface ConfirmContextType {
  confirm: (message: string, options?: { confirmLabel?: string; variant?: 'danger' | 'primary' }) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({ confirm: async () => false });

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    message: string;
    resolve: (v: boolean) => void;
    confirmLabel: string;
    variant: 'danger' | 'primary';
  } | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback((message: string, options?: { confirmLabel?: string; variant?: 'danger' | 'primary' }) => {
    return new Promise<boolean>(resolve => setState({
      message,
      resolve,
      confirmLabel: options?.confirmLabel || 'Confirm',
      variant: options?.variant || 'danger',
    }));
  }, []);

  const handle = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  useEffect(() => {
    if (state) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [state]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="modal-overlay" onClick={() => handle(false)} role="alertdialog" aria-modal="true" aria-describedby="confirm-message">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }} onKeyDown={e => { if (e.key === 'Escape') handle(false); }}>
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Confirm</h3>
            <p id="confirm-message" style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 20 }}>{state.message}</p>
            <div className="form-actions">
              <button ref={cancelRef} className="btn btn-secondary" onClick={() => handle(false)}>Cancel</button>
              <button className={`btn ${state.variant === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={() => handle(true)}>{state.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
