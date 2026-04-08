// pages/Auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap } from "lucide-react";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import toast from "react-hot-toast";
import "./auth.css";

/* ── Reusable input wrapper ────────────────────────────────── */
const InputField = ({ id, label, type = "text", icon: Icon, value, onChange,
  onFocus, onBlur, focused, placeholder, rightSlot, autoComplete }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-[13px] font-semibold text-gray-600 dark:text-slate-400 tracking-wide uppercase">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Icon className={`w-[18px] h-[18px] transition-colors duration-200 ${focused ? "text-indigo-500" : "text-gray-400 dark:text-slate-500"}`} />
      </div>
      <input
        id={id} name={id} type={type} autoComplete={autoComplete}
        value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur}
        placeholder={placeholder}
        className={`auth-input ${rightSlot ? "pr-11" : ""}`}
      />
      {rightSlot && (
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
          {rightSlot}
        </div>
      )}
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]   = useState(false);
  const [error, setError]             = useState(null);
  const [loading, setLoading]         = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    if (!password)             { setError("Please enter your password.");          return; }

    setError(null);
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        if (rememberMe) localStorage.setItem("rememberedEmail", email);
        updateUser(response.data);
        navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const focus   = (f) => () => setFocusedField(f);
  const blur    = () => setFocusedField(null);

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0f1117]">

      {/* ── LEFT: Form panel ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12">
        <div className="w-full max-w-[420px] auth-panel">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Work<span className="text-indigo-600">Sync</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight mb-2">
              Welcome back 👋
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-[15px]">
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5" noValidate>

            <InputField
              id="email" label="Email" type="email" icon={Mail}
              value={email} onChange={e => setEmail(e.target.value)}
              onFocus={focus("email")} onBlur={blur} focused={focusedField === "email"}
              placeholder="name@company.com" autoComplete="email"
            />

            <InputField
              id="password" label="Password" icon={Lock}
              type={showPassword ? "text" : "password"}
              value={password} onChange={e => setPassword(e.target.value)}
              onFocus={focus("password")} onBlur={blur} focused={focusedField === "password"}
              placeholder="Enter your password" autoComplete="current-password"
              rightSlot={
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-200">
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              }
            />

            {/* Remember Me + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox" checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 border-2 border-gray-300 dark:border-slate-600 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all duration-200 flex items-center justify-center">
                    {rememberMe && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[13px] text-gray-600 dark:text-slate-400 group-hover:text-gray-800 dark:group-hover:text-slate-200 transition-colors duration-200">
                  Remember me
                </span>
              </label>

              <button type="button"
                onClick={() => toast("Password reset coming soon.", { icon: "🔒" })}
                className="text-[13px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="group relative w-full py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">New to WorkSync?</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
          </div>

          <Link to="/signUp"
            className="block w-full py-3 text-center rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200">
            Create a free account
          </Link>

        </div>
      </div>

      {/* ── RIGHT: Visual panel ───────────────────────────── */}
      <div className="hidden lg:flex flex-1 auth-visual relative overflow-hidden flex-col items-center justify-center p-16">

        {/* Floating orbs */}
        <div className="auth-orb-1 absolute top-[15%] left-[20%] w-64 h-64 rounded-full" />
        <div className="auth-orb-2 absolute bottom-[20%] right-[15%] w-48 h-48 rounded-full" />
        <div className="auth-orb-3 absolute top-[55%] left-[55%] w-32 h-32 rounded-full" />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Content */}
        <div className="relative z-10 max-w-sm text-center text-white">

          {/* Icon badge */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <Zap className="w-9 h-9 text-white fill-white" />
          </div>

          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Manage tasks<br />
            <span className="text-indigo-300">like a pro</span>
          </h2>
          <p className="text-white/60 text-[15px] leading-relaxed mb-10">
            WorkSync gives your team a single place to track tasks, hit deadlines, and move fast — together.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {["Real-time Updates", "Team Collaboration", "Progress Tracking", "Priority Management"].map(f => (
              <span key={f} className="feature-chip">{f}</span>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: "10k+", label: "Teams" },
              { num: "99%", label: "Uptime" },
              { num: "4.9★", label: "Rating" },
            ].map(({ num, label }) => (
              <div key={label} className="stat-card text-center">
                <p className="text-xl font-bold text-white">{num}</p>
                <p className="text-xs text-white/50 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Demo credentials */}
          <div className="mt-8 px-5 py-3 bg-white/8 border border-white/10 rounded-xl text-left backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">Demo credentials</p>
            <p className="text-[13px] text-white/70"><span className="text-white/40">Email: </span>royo@example.com</p>
            <p className="text-[13px] text-white/70"><span className="text-white/40">Pass: </span>royo@123</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
