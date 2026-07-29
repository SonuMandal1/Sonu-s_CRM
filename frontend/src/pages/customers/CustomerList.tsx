import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil } from 'lucide-react';
import { getCustomers } from '../../api/customers.api';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { CustomerForm } from './CustomerForm';
import { Customer } from '../../types';
import { useAuth } from '../../context/AuthContext';

const statusBadge: Record<string, string> = {
  active: 'badge-emerald',
  lead: 'badge-amber',
  inactive: 'badge-slate',
};

export default function CustomerList() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Customer | 'new' | null>(null);

  const canEdit = user?.role === 'admin' || user?.role === 'sales';
  const requestId = useRef(0);

  function load(page = 1) {
    const id = ++requestId.current;
    setLoading(true);
    getCustomers({ search, status, page, limit: 10 })
      .then((r) => {
        if (id !== requestId.current) return;
        setCustomers(r.data); setMeta(r.meta);
      })
      .finally(() => { if (id === requestId.current) setLoading(false); });
  }

  useEffect(() => { load(1); }, [search, status]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        {canEdit && (
          <button onClick={() => setEditing('new')} className="btn-primary">
            <Plus size={16} /> Add Customer
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search name, mobile, business..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input sm:w-48">
          <option value="">All statuses</option>
          <option value="lead">Lead</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable
        loading={loading}
        rows={customers}
        columns={[
          { header: 'Name', render: (c) => <Link to={`/customers/${c.id}`} className="font-medium text-slate-800 hover:text-brand-600 hover:underline">{c.name}</Link> },
          { header: 'Mobile', render: (c) => c.mobile },
          { header: 'Type', render: (c) => <span className="capitalize text-slate-500">{c.customerType}</span> },
          { header: 'Status', render: (c) => <span className={statusBadge[c.status]}>{c.status}</span> },
          { header: 'Follow-up', render: (c) => c.followUpDate ?? '—' },
          ...(canEdit
            ? [{
                header: '',
                className: 'text-right',
                render: (c: Customer) => (
                  <button onClick={() => setEditing(c)} className="btn-ghost btn-sm ml-auto">
                    <Pencil size={13} /> Edit
                  </button>
                ),
              }]
            : []),
        ]}
      />
      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={load} />

      {editing && (
        <Modal title={editing === 'new' ? 'Add Customer' : 'Edit Customer'} onClose={() => setEditing(null)}>
          <CustomerForm
            customer={editing === 'new' ? undefined : editing}
            onSaved={() => { setEditing(null); load(editing === 'new' ? 1 : meta.page); }}
          />
        </Modal>
      )}
    </div>
  );
}
