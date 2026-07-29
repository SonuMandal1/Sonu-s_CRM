import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props { page: number; totalPages: number; onChange: (page: number) => void }

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="btn-secondary btn-sm !px-2.5"
      >
        <ChevronLeft size={15} />
      </button>
      <span className="px-1 text-slate-500">
        Page <span className="font-medium text-slate-800">{page}</span> of {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="btn-secondary btn-sm !px-2.5"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
