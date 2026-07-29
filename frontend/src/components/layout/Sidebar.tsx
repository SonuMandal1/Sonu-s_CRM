import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  LogOut,
  X,
  Boxes,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'sales', 'warehouse', 'accounts'] },
  { to: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'sales', 'accounts'] },
  { to: '/products', label: 'Products & Stock', icon: Package, roles: ['admin', 'warehouse', 'sales', 'accounts'] },
  { to: '/challans', label: 'Sales Challans', icon: FileText, roles: ['admin', 'sales', 'warehouse', 'accounts'] },
];

function initials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: Props) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col bg-slate-950 text-slate-300 transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/5 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-900/40">
              <Boxes size={18} className="text-white" strokeWidth={2.25} />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight text-white">Nexus ERP</div>
              <div className="text-[11px] leading-tight text-slate-500">CRM Operations</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {links
            .filter((l) => user && l.roles.includes(user.role))
            .map((l) => {
              const Icon = l.icon;
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-400" />
                      )}
                      <Icon size={18} strokeWidth={2} className={isActive ? 'text-brand-400' : ''} />
                      {l.label}
                    </>
                  )}
                </NavLink>
              );
            })}
        </nav>

        <div className="border-t border-white/5 px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl px-1.5 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-300">
              {initials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{user?.name}</div>
              <div className="truncate text-xs capitalize text-slate-500">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
