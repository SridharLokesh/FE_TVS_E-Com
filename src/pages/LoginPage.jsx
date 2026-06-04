import { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, User, Store, Shield } from "lucide-react";
import TVS_Logo from "../assets/TVS_logo_white.png";

export default function LoginPage({ auth }) {
  const { login, loading } = auth;
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  // Where to send the user after login (supports ?redirect=/checkout etc.)
  const from = params.get("redirect") || location.state?.from?.pathname || "/";

  const [tab,       setTab]       = useState("login");
  const [loginType, setLoginType] = useState(params.get("type") || "user");
  const [form,      setForm]      = useState({ email: "", password: "" });
  const [showPwd,   setShowPwd]   = useState(false);
  const [errors,    setErrors]    = useState({});

  // NOTE: no useEffect redirect here — handleSubmit is the single source of navigation.
  // The GuestOnly wrapper in App.jsx already blocks logged-in users from reaching this page.

  const handleTabSwitch = (newTab) => {
    if (newTab === "register") navigate("/register");
    else setTab("login");
  };

  const handleChange = (key) => (e) => {
    let val = e.target.value;
    if (key === "email") val = val.replace(/\s/g, "").toLowerCase();
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await login(form.email, form.password, loginType);
    if (!result) return; // login() already showed a toast on failure

    // Single, clear redirect logic based on role
    if (result.role === "admin")  navigate("/admin",  { replace: true });
    else if (result.role === "dealer") navigate("/dealer", { replace: true });
    else navigate(from === "/login" ? "/" : from, { replace: true });
  };

  const LOGIN_TYPE_TABS = [
    { id: "user",   label: "Customer", icon: User  },
    { id: "dealer", label: "Dealer",   icon: Store },
  ];

  const activeLoginType = LOGIN_TYPE_TABS.find((t) => t.id === loginType) || LOGIN_TYPE_TABS[0];

  return (
    <div
      className="min-h-screen px-4 pt-8 pb-12
                 bg-gradient-to-br from-slate-900 via-[#0a1f44] to-slate-800
                 flex items-start justify-center"
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <img src={TVS_Logo} alt="TVS Motors" className="w-full h-12 object-contain" />
          </Link>
        </div>

        {/* Login / Register top tabs */}
        <div className="flex rounded-xl overflow-hidden border border-white/20 mb-6">
          <button
            onClick={() => handleTabSwitch("login")}
            className={`flex-1 py-2.5 text-center text-sm font-bold transition-colors
              ${tab === "login"
                ? "bg-white text-[#0a1f44]"
                : "text-white/60 hover:text-white hover:bg-white/10"}`}
          >
            Login
          </button>
          <button
            onClick={() => handleTabSwitch("register")}
            className="flex-1 py-2.5 text-center text-sm font-semibold
                       text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            Register
          </button>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-lg font-extrabold text-gray-900 mb-1">
            Sign in to your account
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Access genuine TVS parts and accessories
          </p>

          {/* Customer / Dealer sub-tabs */}
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1.5 mb-5">
            {LOGIN_TYPE_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setLoginType(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
                            text-sm font-bold transition-all
                  ${loginType === id
                    ? "bg-white shadow text-[#0a1f44]"
                    : "text-gray-400 hover:text-gray-600"}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Dealer hint */}
          {loginType === "dealer" && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3
                            text-xs text-[#0a1f44] mb-4 flex items-start gap-2">
              <Store className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Use the email and password provided by TVS Admin when your
                dealer account was approved.
              </span>
            </div>
          )}

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
                  onChange={handleChange("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`input-field pl-10 ${errors.email ? "input-error" : ""}`}
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
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`input-field pl-10 pr-10 ${errors.password ? "input-error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
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
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent
                                   rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {loginType === "dealer"
                    ? <Store className="w-4 h-4" />
                    : <User  className="w-4 h-4" />}
                  Sign in as {activeLoginType.label}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-5 text-center space-y-2">
            {loginType === "user" && (
              <p className="text-sm text-gray-500">
                New to TVS Motors?{" "}
                <Link to="/register" className="font-bold text-[#0a1f44] hover:underline">
                  Create account
                </Link>
              </p>
            )}
            {loginType === "dealer" && (
              <p className="text-sm text-gray-500">
                Want to become a dealer?{" "}
                <Link to="/become-dealer" className="font-bold text-[#0a1f44] hover:underline">
                  Apply here
                </Link>
              </p>
            )}
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Secure 256-bit SSL encrypted login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}