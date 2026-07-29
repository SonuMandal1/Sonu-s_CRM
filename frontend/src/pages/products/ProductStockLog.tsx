import { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { getProduct } from '../../api/products.api';
import { Product } from '../../types';

interface Movement {
  id: string;
  quantityChanged: number;
  movementType: 'in' | 'out';
  reason: string;
  createdAt: string;
  createdByName: string | null;
}

export function ProductStockLog({ product }: { product: Product }) {
  const [movements, setMovements] = useState<Movement[] | null>(null);

  useEffect(() => {
    getProduct(product.id).then((p) => setMovements(p.recentMovements ?? []));
  }, [product.id]);

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
        Current stock: <span className="font-semibold text-slate-800">{product.currentStock}</span> · Minimum alert: {product.minStockAlert}
      </p>

      {movements === null ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
        </div>
      ) : movements.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">No stock movements recorded yet</div>
      ) : (
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {movements.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.movementType === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {m.movementType === 'in' ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-slate-700">{m.reason}</div>
                <div className="text-xs text-slate-400">
                  {new Date(m.createdAt).toLocaleString()}{m.createdByName && ` · ${m.createdByName}`}
                </div>
              </div>
              <div className={`text-sm font-semibold ${m.movementType === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                {m.movementType === 'in' ? '+' : '-'}{m.quantityChanged}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
