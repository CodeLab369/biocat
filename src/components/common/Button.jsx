import clsx from 'clsx'

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

const variantStyles = {
  primary: 'bg-brand text-white hover:bg-brand-dark focus-visible:outline-brand-dark',
  secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 focus-visible:outline-slate-200 dark:bg-slate-900 dark:text-slate-100',
  ghost: 'text-brand hover:bg-brand/10 focus-visible:outline-brand',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-500',
}

const sizeStyles = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-3',
}

export const Button = ({ as = 'button', variant = 'primary', size = 'md', className, icon: Icon, children, ...props }) => {
  const Component = as
  const componentProps =
    Component === 'button' ? { type: props.type || 'button', ...props } : props
  return (
    <Component className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)} {...componentProps}>
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </Component>
  )
}
