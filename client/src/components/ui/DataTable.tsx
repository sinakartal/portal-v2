import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  loading?: boolean
}

export function DataTable<T extends Record<string, any>>({
  columns, data, onRowClick, page = 1, totalPages = 1, onPageChange, loading
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-bg-tertiary rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              {columns.map((col) => (
                <th key={col.key} className={`text-left text-text-muted text-[11px] uppercase tracking-wider font-medium py-3 px-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-border-subtle last:border-0 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-bg-tertiary' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 px-4 text-sm ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border-subtle">
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="p-1.5 rounded hover:bg-bg-tertiary disabled:opacity-30 text-text-secondary">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-text-muted">{page} / {totalPages}</span>
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-bg-tertiary disabled:opacity-30 text-text-secondary">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
