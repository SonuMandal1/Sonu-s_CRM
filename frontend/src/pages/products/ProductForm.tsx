import { useEffect, useState, FormEvent } from 'react';
import { createProduct, updateProduct, getCategories, getWarehouses } from '../../api/products.api';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { Product } from '../../types';

interface Props { product?: Product; onSaved: () => void }

export function ProductForm({ product, onSaved }: Props) {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    categoryId: product?.categoryId ?? '',
    unitPrice: product?.unitPrice ?? '',
    currentStock: product ? String(product.currentStock) : '0',
    minStockAlert: product ? String(product.minStockAlert) : '0',
    warehouseId: product?.warehouseId ?? '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
    getWarehouses().then(setWarehouses);
  }, []);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        unitPrice: Number(form.unitPrice),
        minStockAlert: Number(form.minStockAlert),
        categoryId: form.categoryId || undefined,
        warehouseId: form.warehouseId || undefined,
      };
      if (product) {
        const { currentStock, ...updatePayload } = payload;
        await updateProduct(product.id, updatePayload);
      } else {
        await createProduct({ ...payload, currentStock: Number(form.currentStock) });
      }
      showToast(product ? 'Product updated' : 'Product created');
      onSaved();
    } catch (err: any) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name *</label>
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">SKU *</label>
          <input required value={form.sku} onChange={(e) => update('sku', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Category</label>
          <select value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)} className="input">
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Warehouse</label>
          <select value={form.warehouseId} onChange={(e) => update('warehouseId', e.target.value)} className="input">
            <option value="">None</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Unit price *</label>
          <input required type="number" min="0" step="0.01" value={form.unitPrice} onChange={(e) => update('unitPrice', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">{product ? 'Current stock' : 'Opening stock'}</label>
          <input
            type="number" min="0" value={form.currentStock}
            disabled={!!product}
            onChange={(e) => update('currentStock', e.target.value)}
            className="input disabled:bg-slate-50 disabled:text-slate-400"
          />
          {product && <p className="mt-1 text-xs text-slate-400">Use “Adjust stock” to change quantity.</p>}
        </div>
        <div>
          <label className="label">Min stock alert</label>
          <input type="number" min="0" value={form.minStockAlert} onChange={(e) => update('minStockAlert', e.target.value)} className="input" />
        </div>
      </div>
      <button disabled={saving} className="btn-primary w-full py-2.5">
        {saving ? 'Saving...' : product ? 'Save changes' : 'Save Product'}
      </button>
    </form>
  );
}
