import { ChevronLeft, ChevronRight } from 'lucide-react'

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 50],
}) => (
  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
    <div className="flex items-center gap-2">
      <span className="text-slate-500 dark:text-slate-400">Filas por página:</span>
      <select
        value={rowsPerPage}
        onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
      >
        {rowsPerPageOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-slate-600 dark:text-slate-200">
        Página {page} de {totalPages || 1}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages || totalPages === 0}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  </div>
)
