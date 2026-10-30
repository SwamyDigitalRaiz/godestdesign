import { createContext, useContext } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './button';

const DialogContext = createContext();

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => onOpenChange(false)}
        />
        {children}
      </div>
    </DialogContext.Provider>
  );
}

export function DialogHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ className, children, ...props }) {
  return (
    <h2 className={cn('text-xl font-bold leading-none tracking-tight text-slate-900 dark:text-slate-100', className)} {...props}>
      {children}
    </h2>
  );
}

export function DialogDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-sm text-slate-500 dark:text-slate-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export function DialogContent({ className, children, ...props }) {
  const { onOpenChange } = useContext(DialogContext);
  return (
    <div
      className={cn(
        'relative z-50 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200',
        className
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 rounded-xl opacity-70 transition-opacity hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={() => onOpenChange(false)}
      >
        <X className="h-4 w-4 text-slate-500" />
      </Button>
      {children}
    </div>
  );
}

export function DialogFooter({ className, children, ...props }) {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 gap-2 sm:gap-0', className)} {...props}>
      {children}
    </div>
  );
}
