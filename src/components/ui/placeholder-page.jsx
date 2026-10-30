import { Construction } from 'lucide-react';

export function PlaceholderPage({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-fade-in">
      <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
        <Construction className="h-8 w-8 text-blue-400" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {description || 'This page is under construction. Check back soon.'}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        Coming soon
      </div>
    </div>
  );
}
