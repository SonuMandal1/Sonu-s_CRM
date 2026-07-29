import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { getChallan, updateChallanStatus } from '../../api/challans.api';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/getErrorMessage';

const statusBadge: Record<string, string> = {
  confirmed: 'badge-emerald',
  draft: 'badge-amber',
  cancelled: 'badge-red',
};

export default function ChallanDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [challan, setChallan] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<'confirmed' | 'cancelled' | null>(null);

  function load() {
    if (id) getChallan(id).then(setChallan);
  }
  useEffect(load, [id]);

  const canAct = user && ['admin', 'sales', 'warehouse'].includes(user.role);

  async function handleStatusChange(status: 'confirmed' | 'cancelled') {
    if (!id) return;
    try {
      await updateChallanStatus(id, status);
      showToast(`Challan ${status}`);
      load();
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Action failed'), 'error');
    } finally {
      setConfirmAction(null);
    }
  }

  if (!challan) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
      </div>
    );
  }

  const total = challan.items.reduce((sum: number, i: any) => sum + Number(i.unitPriceSnapshot) * i.quantity, 0);

  return (
    <div>
      <Link to="/challans" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={15} /> Back to challans
      </Link>

      <div className="page-header items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="page-title">{challan.challanNumber}</h1>
            <span className={statusBadge[challan.status]}>{challan.status}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {challan.customerName ?? 'Unknown customer'} · Created {new Date(challan.createdAt).toLocaleString()}
            {challan.createdByName && ` by ${challan.createdByName}`}
          </p>
        </div>
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Product</th><th>SKU</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {challan.items.map((i: any) => (
                <tr key={i.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{i.productNameSnapshot}</td>
                  <td className="text-slate-500">{i.skuSnapshot}</td>
                  <td>₹{i.unitPriceSnapshot}</td>
                  <td>{i.quantity}</td>
                  <td className="font-medium text-slate-800">₹{(Number(i.unitPriceSnapshot) * i.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200">
                <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-slate-500">Total</td>
                <td className="px-0 py-3 text-base font-bold text-slate-900">₹{total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {canAct && challan.status === 'draft' && (
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setConfirmAction('confirmed')} className="btn-success">
            <CheckCircle2 size={16} /> Confirm Challan
          </button>
          <button onClick={() => setConfirmAction('cancelled')} className="btn-danger">
            <XCircle size={16} /> Cancel Challan
          </button>
        </div>
      )}
      {canAct && challan.status === 'confirmed' && (
        <button onClick={() => setConfirmAction('cancelled')} className="btn-danger">
          <XCircle size={16} /> Cancel & Restock
        </button>
      )}

      {confirmAction && (
        <ConfirmDialog
          danger={confirmAction === 'cancelled'}
          message={
            confirmAction === 'confirmed'
              ? 'Confirming will deduct stock for all items. Continue?'
              : 'This will cancel the challan' + (challan.status === 'confirmed' ? ' and restock all items.' : '.')
          }
          onConfirm={() => handleStatusChange(confirmAction)}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
