import { useEffect, useRef, useState } from 'react';
import { Plus, Search, Pencil, SlidersHorizontal, History } from 'lucide-react';
import { getProducts } from '../../api/products.api';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { ProductForm } from './ProductForm';
import { StockAdjustModal } from './StockAdjustModal';
import { ProductStockLog } from './ProductStockLog';
import { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function ProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);
  const [logTarget, setLogTarget] = useState<Product | null>(null);

  const canEdit = user?.role === 'admin' || user?.role === 'warehouse';
  const requestId = useRef(0);

  function load(page = 1) {
    const id = ++requestId.current;
    setLoading(true);
    getProducts({ search: search || undefined, lowStockOnly: lowStockOnly || undefined, page, limit: 10 })
      .then((r) => {
        if (id !== requestId.current) return;
        setProducts(r.data); setMeta(r.meta);
      })
      .finally(() => { if (id === requestId.current) setLoading(false); });
  }

  useEffect(() => { load(1); }, [search, lowStockOnly]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products & Stock</h1>
        {canEdit && (
          <button onClick={() => setEditing('new')} className="btn-primary">
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-600">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
          Low stock only
        </label>
      </div>

      <DataTable
        loading={loading}
        rows={products}
        columns={[
          { header: 'Name', render: (p) => p.name },
          { header: 'SKU', render: (p) => <span className="text-slate-500">{p.sku}</span> },
          { header: 'Category', render: (p) => <span className="text-slate-500">{p.categoryName ?? '—'}</span> },
          { header: 'Location', render: (p) => <span className="text-slate-500">{p.warehouseName ?? '—'}</span> },
          { header: 'Unit Price', render: (p) => `₹${p.unitPrice}` },
          { header: 'Stock', render: (p) => (
            <span className={p.currentStock <= p.minStockAlert ? 'badge-red' : 'badge-slate'}>
              {p.currentStock}{p.currentStock <= p.minStockAlert && ' · low'}
            </span>
          )},
          { header: '', className: 'text-right', render: (p) => (
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => setLogTarget(p)} className="btn-ghost btn-sm" title="Stock movement log">
                <History size={13} />
              </button>
              {canEdit && (
                <>
                  <button onClick={() => setAdjustTarget(p)} className="btn-ghost btn-sm" title="Adjust stock">
                    <SlidersHorizontal size={13} />
                  </button>
                  <button onClick={() => setEditing(p)} className="btn-ghost btn-sm" title="Edit product">
                    <Pencil size={13} />
                  </button>
                </>
              )}
            </div>
          )},
        ]}
      />
      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={load} />

      {editing && (
        <Modal title={editing === 'new' ? 'Add Product' : 'Edit Product'} onClose={() => setEditing(null)}>
          <ProductForm
            product={editing === 'new' ? undefined : editing}
            onSaved={() => { setEditing(null); load(editing === 'new' ? 1 : meta.page); }}
          />
        </Modal>
      )}
      {adjustTarget && (
        <Modal title={`Adjust stock — ${adjustTarget.name}`} onClose={() => setAdjustTarget(null)}>
          <StockAdjustModal product={adjustTarget} onSaved={() => { setAdjustTarget(null); load(meta.page); }} />
        </Modal>
      )}
      {logTarget && (
        <Modal title={`Stock log — ${logTarget.name}`} onClose={() => setLogTarget(null)}>
          <ProductStockLog product={logTarget} />
        </Modal>
      )}
    </div>
  );
}
