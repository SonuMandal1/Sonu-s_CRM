import { useState, FormEvent } from 'react';
import { createCustomer, updateCustomer } from '../../api/customers.api';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { Customer } from '../../types';

interface Props { customer?: Customer; onSaved: () => void }

export function CustomerForm({ customer, onSaved }: Props) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    mobile: customer?.mobile ?? '',
    email: customer?.email ?? '',
    businessName: customer?.businessName ?? '',
    gstNumber: customer?.gstNumber ?? '',
    customerType: customer?.customerType ?? 'retail',
    address: customer?.address ?? '',
    status: customer?.status ?? 'lead',
    followUpDate: customer?.followUpDate ?? '',
    notes: customer?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (customer) await updateCustomer(customer.id, form);
      else await createCustomer(form);
      showToast(customer ? 'Customer updated' : 'Customer created');
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
          <label className="label">Mobile *</label>
          <input required value={form.mobile} onChange={(e) => update('mobile', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Business name</label>
          <input value={form.businessName} onChange={(e) => update('businessName', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">GST number</label>
          <input value={form.gstNumber} onChange={(e) => update('gstNumber', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Customer type</label>
          <select value={form.customerType} onChange={(e) => update('customerType', e.target.value)} className="input">
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
            <option value="distributor">Distributor</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select value={form.status} onChange={(e) => update('status', e.target.value)} className="input">
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="label">Follow-up date</label>
          <input type="date" value={form.followUpDate} onChange={(e) => update('followUpDate', e.target.value)} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Address</label>
        <textarea value={form.address} onChange={(e) => update('address', e.target.value)} className="input" rows={2} />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="input" rows={2} />
      </div>
      <button disabled={saving} className="btn-primary w-full py-2.5">
        {saving ? 'Saving...' : customer ? 'Save changes' : 'Save Customer'}
      </button>
    </form>
  );
}
