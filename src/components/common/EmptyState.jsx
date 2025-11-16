export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
    {Icon ? <Icon className="h-10 w-10 text-brand" /> : null}
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
    {description ? <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
    {action}
  </div>
)
