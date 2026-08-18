'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ConfirmContextType {
  confirm: (message: string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({ confirm: async () => false });

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ message: string; resolve: (v: boolean) => void } | null>(null);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>(resolve => setState({ message, resolve }));
  }, []);

  const handle = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="modal-overlay" onClick={() => handle(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Confirm</h3>
            <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 20 }}>{state.message}</p>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => handle(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handle(true)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
