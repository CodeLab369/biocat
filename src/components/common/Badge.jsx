import clsx from 'clsx'

const variants = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-100',
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100',
}

export const Badge = ({ children, variant = 'neutral', className }) => (
  <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', variants[variant], className)}>
    {children}
  </span>
)
