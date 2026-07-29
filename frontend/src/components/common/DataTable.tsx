import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface Column<T> { header: string; render: (row: T) => ReactNode; className?: string }
interface Props<T> { columns: Column<T>[]; rows: T[]; loading?: boolean; emptyLabel?: string }

export function DataTable<T>({ columns, rows, loading, emptyLabel = 'No records found' }: Props<T>) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-left">
            <tr>
              {columns.map((c) => (
                <th key={c.header} className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${c.className ?? ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-t border-slate-100">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3.5"><div className="h-4 w-full max-w-[10rem] animate-pulse rounded bg-slate-100" /></td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox size={28} strokeWidth={1.5} className="text-slate-300" />
                    <span className="text-sm">{emptyLabel}</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
                  {columns.map((c) => (
                    <td key={c.header} className={`px-4 py-3.5 text-slate-700 ${c.className ?? ''}`}>{c.render(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
