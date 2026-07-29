import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getChallans } from '../../api/challans.api';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Challan } from '../../types';
import { useAuth } from '../../context/AuthContext';

const statusBadge: Record<string, string> = {
  confirmed: 'badge-emerald',
  draft: 'badge-amber',
  cancelled: 'badge-red',
};

export default function ChallanList() {
  const { user } = useAuth();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const canCreate = user?.role === 'admin' || user?.role === 'sales';
  const requestId = useRef(0);

  function load(page = 1) {
    const id = ++requestId.current;
    setLoading(true);
    getChallans({ status, page, limit: 10 })
      .then((r) => {
        if (id !== requestId.current) return;
        setChallans(r.data); setMeta(r.meta);
      })
      .finally(() => { if (id === requestId.current) setLoading(false); });
  }

  useEffect(() => { load(1); }, [status]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sales Challans</h1>
        {canCreate && (
          <Link to="/challans/new" className="btn-primary">
            <Plus size={16} /> New Challan
          </Link>
        )}
      </div>

      <select value={status} onChange={(e) => setStatus(e.target.value)} className="input mb-4 sm:w-56">
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <DataTable
        loading={loading}
        rows={challans}
        columns={[
          { header: 'Challan #', render: (c) => <Link to={`/challans/${c.id}`} className="font-medium text-slate-800 hover:text-brand-600 hover:underline">{c.challanNumber}</Link> },
          { header: 'Total Qty', render: (c) => c.totalQuantity },
          { header: 'Status', render: (c) => <span className={statusBadge[c.status]}>{c.status}</span> },
          { header: 'Created', render: (c) => new Date(c.createdAt).toLocaleDateString() },
        ]}
      />
      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={load} />
    </div>
  );
}
