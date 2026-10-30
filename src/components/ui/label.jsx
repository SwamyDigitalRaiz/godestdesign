import { cn } from '../../utils/cn';

export function Label({ className, htmlFor, children, ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-xs font-semibold text-slate-700 dark:text-slate-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}
