import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Building2, Hash, MapPin, Pencil, MessageSquarePlus } from 'lucide-react';
import { getCustomer, addFollowup } from '../../api/customers.api';
import { Modal } from '../../components/common/Modal';
import { CustomerForm } from './CustomerForm';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const statusBadge: Record<string, string> = {
  active: 'badge-emerald',
  lead: 'badge-amber',
  inactive: 'badge-slate',
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="truncate text-sm font-medium text-slate-800">{value || '—'}</div>
      </div>
    </div>
  );
}

export default function CustomerDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<any>(null);
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [editing, setEditing] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'sales';

  function load() {
    if (id) getCustomer(id).then(setCustomer);
  }

  useEffect(load, [id]);

  async function handleAddFollowup() {
    if (!id || !note.trim()) return;
    try {
      await addFollowup(id, { note, followUpDate: followUpDate || undefined });
      setNote(''); setFollowUpDate('');
      showToast('Follow-up added');
      load();
    } catch {
      showToast('Failed to add follow-up', 'error');
    }
  }

  if (!customer) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div>
      <Link to="/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={15} /> Back to customers
      </Link>

      <div className="page-header">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="page-title">{customer.name}</h1>
            <span className={statusBadge[customer.status]}>{customer.status}</span>
          </div>
          <p className="mt-1 capitalize text-slate-500">{customer.customerType} customer</p>
        </div>
        {canEdit && (
          <button onClick={() => setEditing(true)} className="btn-secondary">
            <Pencil size={15} /> Edit
          </button>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <InfoRow icon={Phone} label="Mobile" value={customer.mobile} />
          <InfoRow icon={Mail} label="Email" value={customer.email} />
          <InfoRow icon={Building2} label="Business" value={customer.businessName} />
          <InfoRow icon={Hash} label="GST number" value={customer.gstNumber} />
          <div className="sm:col-span-2">
            <InfoRow icon={MapPin} label="Address" value={customer.address} />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <MessageSquarePlus size={16} className="text-brand-600" /> Add follow-up
          </h3>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)} placeholder="Follow-up note..."
            className="input mb-2" rows={2}
          />
          <input
            type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)}
            className="input mb-3"
          />
          <button onClick={handleAddFollowup} className="btn-primary w-full py-2">
            Add follow-up
          </button>
        </div>
      </div>

      <h3 className="mb-3 font-semibold text-slate-800">Follow-up history</h3>
      <div className="card divide-y divide-slate-100">
        {customer.followups.map((f: any) => (
          <div key={f.id} className="px-5 py-3.5 text-sm">
            <div className="text-slate-700">{f.note}</div>
            <div className="mt-1 text-xs text-slate-400">
              {new Date(f.createdAt).toLocaleString()} {f.followUpDate && `· Next: ${f.followUpDate}`}
            </div>
          </div>
        ))}
        {customer.followups.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-400">No follow-ups yet</div>}
      </div>

      {editing && (
        <Modal title="Edit Customer" onClose={() => setEditing(false)}>
          <CustomerForm customer={customer} onSaved={() => { setEditing(false); load(); }} />
        </Modal>
      )}
    </div>
  );
}
