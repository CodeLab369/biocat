import { createPortal } from 'react-dom'

export const Modal = ({ open, title, description, children, footer, onClose }) => {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
          {onClose ? (
            <button
              aria-label="Cerrar"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
            >
              ✕
            </button>
          ) : null}
        </div>
        <div className="space-y-4">{children}</div>
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
