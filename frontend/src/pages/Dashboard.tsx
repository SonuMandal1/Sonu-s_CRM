import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, AlertTriangle, FileText, ArrowUpRight } from 'lucide-react';
import { getProducts } from '../api/products.api';
import { getChallans } from '../api/challans.api';
import { getCustomers } from '../api/customers.api';
import { useAuth } from '../context/AuthContext';

interface Stat { label: string; value: number | null; icon: any; accent: string; to: string }

export default function Dashboard() {
  const { user } = useAuth();
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number | null>(null);
  const [challanCount, setChallanCount] = useState<number | null>(null);
  const [recentChallans, setRecentChallans] = useState<any[]>([]);

  useEffect(() => {
    getCustomers({ limit: 1 }).then((r) => setCustomerCount(r.meta.total)).catch(() => setCustomerCount(0));
    getProducts({ limit: 1 }).then((r) => setProductCount(r.meta.total)).catch(() => setProductCount(0));
    getProducts({ lowStockOnly: true, limit: 1 }).then((r) => setLowStockCount(r.meta.total)).catch(() => setLowStockCount(0));
    getChallans({ limit: 5 }).then((r) => { setRecentChallans(r.data); setChallanCount(r.meta.total); }).catch(() => setChallanCount(0));
  }, []);

  const stats: Stat[] = [
    { label: 'Total customers', value: customerCount, icon: Users, accent: 'from-brand-500 to-brand-600', to: '/customers' },
    { label: 'Active products', value: productCount, icon: Package, accent: 'from-sky-500 to-sky-600', to: '/products' },
    { label: 'Low stock alerts', value: lowStockCount, icon: AlertTriangle, accent: 'from-red-500 to-red-600', to: '/products' },
    { label: 'Sales challans', value: challanCount, icon: FileText, accent: 'from-emerald-500 to-emerald-600', to: '/challans' },
  ];

  return (
    <div>
      <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 p-6 text-white sm:p-8">
        <p className="text-sm text-slate-400">Welcome back</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{user?.name}</h1>
        <p className="mt-2 text-sm capitalize text-slate-400">Signed in as {user?.role}</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              to={s.to}
              className="card group flex flex-col gap-4 p-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent} text-white shadow-sm`}>
                  <Icon size={18} />
                </div>
                <ArrowUpRight size={16} className="text-slate-300 transition-colors group-hover:text-slate-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{s.value ?? '—'}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-800">Recent sales challans</h2>
        <Link to="/challans" className="text-xs font-medium text-brand-600 hover:text-brand-700">View all</Link>
      </div>
      <div className="card divide-y divide-slate-100">
        {recentChallans.map((c) => (
          <Link key={c.id} to={`/challans/${c.id}`} className="flex items-center justify-between px-5 py-3.5 text-sm transition-colors hover:bg-slate-50/70">
            <span className="font-medium text-slate-700">{c.challanNumber}</span>
            <span
              className={
                c.status === 'confirmed' ? 'badge-emerald' : c.status === 'draft' ? 'badge-amber' : 'badge-red'
              }
            >
              {c.status}
            </span>
          </Link>
        ))}
        {recentChallans.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-400">No challans yet</div>}
      </div>
    </div>
  );
}
