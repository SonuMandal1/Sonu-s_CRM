import { AlertTriangle } from 'lucide-react';

interface Props { message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }

export function ConfirmDialog({ message, onConfirm, onCancel, danger = true }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-premium-lg animate-slide-in">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${danger ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'}`}>
          <AlertTriangle size={20} />
        </div>
        <p className="mb-6 text-sm leading-relaxed text-slate-700">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
