import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, Mail, Lock, AlertCircle, Users, Package, FileText, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/40 via-slate-950 to-slate-950" />
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-900/40">
            <Boxes size={20} strokeWidth={2.25} />
          </div>
          <span className="text-lg font-bold">CRM</span>
        </div>

        <div className="relative">
          <h1 className="mb-4 text-4xl font-bold leading-tight">
            Run your wholesale operations from one clean workspace.
          </h1>
          <p className="max-w-md text-slate-400">
            Customers, inventory, and sales challans — kept in sync, with stock levels that never lie.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: Users, label: 'CRM & Follow-ups' },
              { icon: Package, label: 'Live Inventory' },
              { icon: FileText, label: 'Sales Challans' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <Icon size={18} className="mb-2 text-brand-400" />
                <div className="text-xs text-slate-300">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">© {new Date().getFullYear()} CRM · Internal use only</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600">
              <Boxes size={18} className="text-white" strokeWidth={2.25} />
            </div>
            <span className="text-lg font-bold text-slate-900">CRM</span>
          </div>

          <h2 className="mb-1 text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mb-8 text-sm text-slate-500">Sign in with your work account to continue</p>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <label className="label">Password</label>
<div className="relative mb-6">
  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
  <input
    type={showPassword ? 'text' : 'password'}
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    className="input pl-10 pr-10"
  />
  <button
    type="button"
    onClick={() => setShowPassword((v) => !v)}
    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    aria-label={showPassword ? 'Hide password' : 'Show password'}
  >
    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
  </button>
</div>

          <label className="label">Password</label>
          <div className="relative mb-6">
            <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pl-10"
            />
          </div>

          <button disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-8 text-center text-xs text-slate-400">
            Ask your admin for credentials if you don&apos;t have an account.
          </p>
        </form>
      </div>
    </div>
  );
}
