import { createContext, useCallback, useContext, useMemo } from 'react';
import { ToastProvider as ReshapedToastProvider, useToast as useReshapedToast } from 'reshaped';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

function Bridge({ children }) {
  const toast = useReshapedToast();

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    toast.show({
      text: message,
      color: type === 'success' ? 'positive' : type === 'info' ? 'primary' : 'critical',
      icon: type === 'success' ? CheckCircle2 : type === 'info' ? Info : AlertCircle,
      timeout: duration,
    });
  }, [toast]);

  const value = useMemo(() => ({ addToast }), [addToast]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function ToastProvider({ children }) {
  return (
    <ReshapedToastProvider>
      <Bridge>{children}</Bridge>
    </ReshapedToastProvider>
  );
}

// This hook intentionally shares the provider module with its context.
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
