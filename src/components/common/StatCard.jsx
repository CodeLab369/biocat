export const StatCard = ({ icon: Icon, label, value, helper }) => (
  <article className="flex flex-1 min-w-[180px] items-center gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
      {Icon ? <Icon className="h-6 w-6" /> : null}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
      {helper ? <p className="text-xs text-slate-400 dark:text-slate-500">{helper}</p> : null}
    </div>
  </article>
)
