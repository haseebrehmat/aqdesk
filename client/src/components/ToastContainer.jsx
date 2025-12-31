import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Modal, View } from 'reshaped';
import { CheckCircle2, AlertCircle, Info, Close } from './icons';

const ToastContext = createContext(null);

const kinds = {
  success: { color: 'positive', icon: CheckCircle2 },
  info: { color: 'primary', icon: Info },
  error: { color: 'critical', icon: AlertCircle },
};

// Floating notification stack built from Reshaped Alert components.
function AlertStack({ toasts, dismiss }) {
  if (!toasts.length) return null;
  return (
    <View
      attributes={{
        'aria-live': 'polite',
        style: { position: 'fixed', top: 16, right: 16, zIndex: 2000, width: 'min(420px, calc(100vw - 32px))', gap: 8, display: 'flex', flexDirection: 'column' },
      }}
    >
      {toasts.map((t) => {
        const { color, icon } = kinds[t.type] || kinds.error;
        return (
          <Alert
            key={t.id}
            color={color}
            icon={icon}
            attributes={{ role: t.type === 'error' ? 'alert' : 'status', style: { boxShadow: 'var(--rs-shadow-raised, 0 4px 16px rgba(0,0,0,.2))', background: 'var(--rs-color-background-elevation-raised)' } }}
            actionsSlot={<Button variant="ghost" size="small" icon={Close} onClick={() => dismiss(t.id)} attributes={{ 'aria-label': 'Dismiss notification' }} />}
          >
            {t.message}
          </Alert>
        );
      })}
    </View>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const nextId = useRef(0);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++nextId.current;
    setToasts((list) => [...list.slice(-3), { id, message, type }]);
    timers.current.set(id, setTimeout(() => dismiss(id), duration));
  }, [dismiss]);

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach(clearTimeout);
  }, []);

  // Replacement for window.confirm: resolves true/false.
  const confirm = useCallback((message, { title = 'Please confirm', confirmLabel = 'Confirm', color = 'critical' } = {}) => (
    new Promise((resolve) => setDialog({ message, title, confirmLabel, color, resolve }))
  ), []);

  const answer = (value) => {
    dialog?.resolve(value);
    setDialog(null);
  };

  const value = useMemo(() => ({ addToast, confirm }), [addToast, confirm]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AlertStack toasts={toasts} dismiss={dismiss} />
      <Modal active={!!dialog} onClose={() => answer(false)} size="440px" padding={5}>
        <Modal.Title>{dialog?.title}</Modal.Title>
        <View gap={4} paddingTop={3}>
          <Alert color={dialog?.color || 'critical'} icon={AlertCircle}>{dialog?.message}</Alert>
          <View direction="row" justify="end" gap={2}>
            <Button variant="outline" onClick={() => answer(false)}>Cancel</Button>
            <Button color={dialog?.color === 'critical' ? 'critical' : 'primary'} onClick={() => answer(true)}>{dialog?.confirmLabel}</Button>
          </View>
        </View>
      </Modal>
    </ToastContext.Provider>
  );
}

// This hook intentionally shares the provider module with its context.
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
