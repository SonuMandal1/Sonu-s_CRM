import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { getCustomers } from '../../api/customers.api';
import { getProducts } from '../../api/products.api';
import { createChallan } from '../../api/challans.api';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface Line { productId: string; name: string; sku: string; available: number; quantity: number }

export default function ChallanCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [saving, setSaving] = useState(false);

  
  useEffect(() => {
    getCustomers({ limit: 100 }).then((r) => setCustomers(r.data));
    getProducts({ limit: 100 }).then((r) => setProducts(r.data));
  }, []);

  function addLine(productId: string) {
    if (!productId || lines.some((l) => l.productId === productId)) return;
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setLines((prev) => [...prev, { productId, name: product.name, sku: product.sku, available: product.currentStock, quantity: 1 }]);
  }

  function updateQty(productId: string, quantity: number) {
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)));
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  async function handleSubmit() {
    if (!customerId || lines.length === 0) {
      showToast('Select a customer and at least one product', 'error');
      return;
    }
    setSaving(true);
    try {
      const challan = await createChallan({
        customerId,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      });
      showToast('Challan saved as draft');
      navigate(`/challans/${challan.id}`);
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Failed to create challan'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link to="/challans" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={15} /> Back to challans
      </Link>
      <h1 className="page-title mb-6">New Sales Challan</h1>

      <div className="card mb-6 p-5 sm:p-6">
        <label className="label">Customer *</label>
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="input">
          <option value="">Select customer...</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.mobile}</option>)}
        </select>
      </div>

      <div className="card mb-6 p-5 sm:p-6">
        <label className="label">Add product</label>
        <select onChange={(e) => { addLine(e.target.value); e.target.value = ''; }} className="input mb-4">
          <option value="">Select product to add...</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku}) — {p.currentStock} in stock</option>)}
        </select>

        {lines.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="py-2">Product</th><th>Available</th><th>Quantity</th><th></th></tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.productId} className="border-t border-slate-100">
                    <td className="py-2.5">{l.name} <span className="text-slate-400">({l.sku})</span></td>
                    <td className="text-slate-500">{l.available}</td>
                    <td>
                      <input
                        type="number" min="1" max={l.available} value={l.quantity}
                        onChange={(e) => updateQty(l.productId, Number(e.target.value))}
                        className="input w-20 !py-1.5"
                      />
                    </td>
                    <td>
                      <button type="button" onClick={() => removeLine(l.productId)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {lines.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No products added yet</p>}
      </div>

      <button disabled={saving} onClick={handleSubmit} className="btn-primary">
        {saving ? 'Saving...' : 'Save as Draft'}
      </button>
      <p className="mt-2 text-xs text-slate-400">Stock is only deducted once the challan is confirmed from its detail page.</p>
    </div>
  );
}
