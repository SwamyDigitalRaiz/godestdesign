import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { cva } from 'class-variance-authority';

export const ToastProvider = ToastPrimitives.Provider;

export function ToastViewport({ className, ...props }) {
  return (
    <ToastPrimitives.Viewport
      className={cn(
        'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
        className
      )}
      {...props}
    />
  );
}

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'destructive border-destructive bg-destructive text-destructive-foreground',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export function Toast({ className, variant, ...props }) {
  return <ToastPrimitives.Root className={cn(toastVariants({ variant }), className)} {...props} />;
}

export function ToastClose({ className, ...props }) {
  return (
    <ToastPrimitives.Close
      className={cn(
        'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
        className
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  );
}

export function ToastTitle({ className, ...props }) {
  return <ToastPrimitives.Title className={cn('text-sm font-semibold', className)} {...props} />;
}

export function ToastDescription({ className, ...props }) {
  return <ToastPrimitives.Description className={cn('text-sm opacity-90', className)} {...props} />;
}

export function ToastAction({ className, ...props }) {
  return (
    <ToastPrimitives.Action
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

// Toast state management
const listeners = new Set();
let toastState = [];

function notify() {
  listeners.forEach((listener) => listener([...toastState]));
}

export function getToastState() {
  return toastState;
}

export function subscribeToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toast({ title, description, variant = 'default', duration = 4000 }) {
  const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
  const newToast = { id, title, description, variant, open: true };
  toastState = [...toastState, newToast];
  notify();

  setTimeout(() => {
    toastState = toastState.filter((t) => t.id !== id);
    notify();
  }, duration + 300);
}

export function useToast() {
  return { toast };
}

export default toast;
