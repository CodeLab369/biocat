import clsx from 'clsx'

export const Textarea = ({ label, hint, error, className, rows = 3, ...props }) => (
  <label className="flex w-full flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
    {label}
    <textarea
      rows={rows}
      className={clsx(
        'w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-base font-normal text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
        className,
      )}
      {...props}
    />
    {hint ? <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{hint}</span> : null}
    {error ? <span className="text-xs font-normal text-red-500">{error}</span> : null}
  </label>
)
