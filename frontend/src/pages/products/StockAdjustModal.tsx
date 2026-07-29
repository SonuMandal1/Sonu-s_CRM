import { useState, FormEvent } from 'react';
import { adjustStock } from '../../api/products.api';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { Product } from '../../types';

export function StockAdjustModal({ product, onSaved }: { product: Product; onSaved: () => void }) {
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState('');
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adjustStock(product.id, { quantity: Number(quantity), movementType, reason });
      showToast('Stock updated');
      onSaved();
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Adjustment failed'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <p className="text-slate-500">Current stock: <span className="font-semibold text-slate-800">{product.currentStock}</span></p>
      <div>
        <label className="label">Movement type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button" onClick={() => setMovementType('in')}
            className={`rounded-lg border py-2 text-sm font-medium transition-colors ${movementType === 'in' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            Stock IN
          </button>
          <button
            type="button" onClick={() => setMovementType('out')}
            className={`rounded-lg border py-2 text-sm font-medium transition-colors ${movementType === 'out' ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            Stock OUT
          </button>
        </div>
      </div>
      <div>
        <label className="label">Quantity *</label>
        <input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input" />
      </div>
      <div>
        <label className="label">Reason *</label>
        <input required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. New purchase, damage, correction" className="input" />
      </div>
      <button disabled={saving} className="btn-primary w-full py-2.5">
        {saving ? 'Saving...' : 'Confirm Adjustment'}
      </button>
    </form>
  );
}
