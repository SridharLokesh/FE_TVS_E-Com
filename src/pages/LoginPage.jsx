import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage({ auth }) {
  const { login, loading } = auth;
  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.state?.from?.pathname || '/';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [errors,  setErrors]  = useState({});

  const handleChange = (key) => (e) => {
    let val = e.target.value;
    if (key === 'email') val = val.replace(/\s/g, '').toLowerCase();
    setForm(f => ({ ...f, [key]: val }));
    setErrors(er => ({ ...er, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())
      e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address';

    if (!form.password)
      e.password = 'Password is required';
    else if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const userData = await login(form.email, form.password);
    if (userData) {
      navigate(userData.role === 'admin' ? '/admin' : from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen px-4 pt-8 pb-12
                    bg-gradient-to-br from-slate-900 via-[#0a1f44] to-slate-800
                    flex items-start justify-center">
      <div className="w-full max-w-md">

        {/* ── TVS Logo ── */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <svg viewBox="0 0 80 60" className="w-14 h-14" fill="none">
                <rect width="80" height="60" rx="6" fill="#0a1f44"/>
                <text x="40" y="38" textAnchor="middle"
                  style={{fontFamily:'Inter,sans-serif', fontWeight:900, fontSize:26, fill:'white', letterSpacing:2}}>
                  TVS
                </text>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-widest">TVS MOTORS</p>
              <p className="text-blue-300 text-xs font-medium tracking-widest uppercase mt-0.5">
                Official Parts &amp; Accessories
              </p>
            </div>
          </Link>
        </div>

        {/* ── Tabs ── */}
        <div className="flex rounded-xl overflow-hidden border border-white/20 mb-6">
          <div className="flex-1 py-2.5 text-center text-sm font-bold bg-white text-[#0a1f44]">
            Login
          </div>
          <Link to="/register"
            className="flex-1 py-2.5 text-center text-sm font-semibold text-white/60
                       hover:text-white hover:bg-white/10 transition-colors">
            Register
          </Link>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-lg font-extrabold text-gray-900 mb-1">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-5">
            Access genuine TVS parts and accessories
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                                 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`input-field pl-10 ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span className="font-bold">⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                                 text-gray-400 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span className="font-bold">⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent
                                   rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Admin hint */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
            <p className="text-xs text-gray-500 font-medium">
              Admin:&nbsp;
              <span className="font-bold text-gray-700">admin@gmail.com</span>
              &nbsp;/&nbsp;
              <span className="font-bold text-gray-700">admin123</span>
            </p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            New to TVS Motors?{' '}
            <Link to="/register" className="font-bold text-[#0a1f44] hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
