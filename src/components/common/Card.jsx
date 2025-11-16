export const Card = ({ title, subtitle, actions, children, className = '' }) => (
  <section
    className={`rounded-3xl border border-slate-100 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 ${className}`}
  >
    {(title || subtitle || actions) && (
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1">
          {title ? <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2> : null}
          {subtitle ? <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>
    )}
    {children}
  </section>
)
