import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Eye, EyeOff, Shield, Bike, Bus, UserPlus } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login, register, checkAdminExists, loading } = useAuthStore();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [adminExists, setAdminExists] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // On mount: check if any admin exists — same condition as solohearts
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const result = await checkAdminExists();
        const exists =
          result?.mainAdminExists !== undefined
            ? Boolean(result.mainAdminExists)
            : Boolean(result?.adminExists);
        setAdminExists(exists);
        if (!exists) {
          setMode('register');
        } else {
          setMode('login');
        }
      } catch (err) {
        console.error('Error checking admin:', err);
        // Default to true (show login only) if check fails
        setAdminExists(true);
        setMode('login');
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, [checkAdminExists]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const result = await login({ email: form.email, password: form.password });
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } else {
      if (adminExists) {
        setError('Admin registration is closed. A main admin already exists.');
        setMode('login');
        return;
      }
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-10 h-32 w-32 rounded-full border-4 border-slate-950" />
          <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full border-4 border-slate-950" />
          <div className="absolute top-1/2 left-1/3 h-20 w-20 rounded-full border-2 border-slate-950" />
        </div>

        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="h-20 w-20 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-2xl border border-amber-300">
            <span className="text-4xl font-black tracking-tight">G</span>
          </div>
          <h1 className="text-4xl font-black text-slate-950 mb-2 tracking-tight">Go Dest</h1>
          <p className="text-amber-950/80 font-semibold text-lg mb-10">Unified Mobility Command Center</p>

          {/* Service badges */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-white/40 dark:bg-slate-900/30 backdrop-blur rounded-xl px-5 py-3 border border-amber-300/40 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Bike className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-slate-950 font-bold text-sm">Bike & Auto</p>
                <p className="text-slate-800 text-xs">Auto & Bike on-demand rides</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/40 dark:bg-slate-900/30 backdrop-blur rounded-xl px-5 py-3 border border-amber-300/40 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Bus className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-slate-950 font-bold text-sm">Private Bus Booking</p>
                <p className="text-slate-800 text-xs">3rd-party bus API integration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login / Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-xl bg-amber-400 border border-amber-300 flex items-center justify-center">
              <span className="text-slate-950 text-xl font-black">G</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">Go Dest</h1>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
          </div>

          <div className="mb-8">
            {mode === 'login' ? (
              <>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Sign in to your admin account</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Admin Account</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Set up the main administrator account</p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name — register only */}
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Super Admin"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@maat.in"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* Phone — register only */}
            {mode === 'register' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone (optional)
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 99999 00000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="maat"
              className="w-full h-11 mt-2"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {mode === 'login' ? <Shield className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </div>
              )}
            </Button>
          </form>

          {/* Mode switcher: Only visible when no main admin exists in the database (same as solohearts) */}
          {!checkingAdmin && !adminExists && (
            <p className="mt-6 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <>
                  First time setup?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className="text-amber-600 hover:text-amber-700 font-medium underline-offset-2 hover:underline"
                  >
                    Create Main Admin
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-amber-600 hover:text-amber-700 font-medium underline-offset-2 hover:underline"
                  >
                    Sign in instead
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

