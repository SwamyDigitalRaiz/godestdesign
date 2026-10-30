import { useState, useEffect } from 'react';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  toast,
  useToast,
  getToastState,
  subscribeToasts,
} from './toast';

export { toast, useToast };
export default toast;

export function Toaster() {
  const [toasts, setToasts] = useState(getToastState());

  useEffect(() => {
    return subscribeToasts(setToasts);
  }, []);

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id} open={t.open} variant={t.variant}>
          {t.title && <ToastTitle>{t.title}</ToastTitle>}
          {t.description && <ToastDescription>{t.description}</ToastDescription>}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
