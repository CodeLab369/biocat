export const Table = ({ columns, data, emptyMessage = 'Sin registros', renderRowActions }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-200">
      <thead>
        <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {columns.map((column) => (
            <th key={column.key} className="px-3 py-2 font-semibold">
              {column.label}
            </th>
          ))}
          {renderRowActions ? <th className="px-3 py-2 text-right">Acciones</th> : null}
        </tr>
      </thead>
      <tbody>
        {data.length ? (
          data.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              {columns.map((column) => (
                <td key={`${row.id}-${column.key}`} className="px-3 py-3 align-top">
                  {typeof column.render === 'function' ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {renderRowActions ? <td className="px-3 py-3 text-right">{renderRowActions(row)}</td> : null}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + (renderRowActions ? 1 : 0)} className="px-3 py-5 text-center text-slate-400">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)
