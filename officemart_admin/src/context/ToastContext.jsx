import { createContext, useContext, useEffect, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timerId = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => {
      clearTimeout(timerId);
    };
  }, [toast]);

  function showToast(message) {
    setToast({
      id: Date.now(),
      message,
    });
  }

  function hideToast() {
    setToast(null);
  }

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
      {toast && (
        <div className="toast-container">
          <div className="toast" data-testid="toast" role="status" aria-live="polite">
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }
  return context;
}
