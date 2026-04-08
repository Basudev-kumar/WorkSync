// pages/Auth/SignUp.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye, EyeOff, Mail, Lock, User, Key, ArrowRight,
  Camera, X, Zap, CheckCircle2, Shield
} from "lucide-react";
import { validateEmail } from "../../utils/helper";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { UserContext } from "../../context/userContext";
import uploadImage from "../../utils/uploadImage";
import { useContext } from "react";
import "./auth.css";

/* ── Password strength helper ──────────────────────────────── */
const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8)                   score++;
  if (/[A-Z]/.test(pwd))                 score++;
  if (/[0-9]/.test(pwd))                 score++;
  if (/[^A-Za-z0-9]/.test(pwd))          score++;
  const map = [
    { label: "",          color: "" },
    { label: "Weak",      color: "#ef4444" },
    { label: "Fair",      color: "#f97316" },
    { label: "Good",      color: "#eab308" },
    { label: "Strong",    color: "#22c55e" },
  ];
  return { score, ...map[score] };
};

/* ── Reusable input field ──────────────────────────────────── */
const InputField = ({
  id, label, type = "text", icon: Icon, value, onChange,
  onFocus, onBlur, focused, placeholder, rightSlot, autoComplete, maxLength,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id}
      className="block text-[13px] font-semibold text-gray-600 dark:text-slate-400 tracking-wide uppercase">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Icon className={`w-[18px] h-[18px] transition-colors duration-200 ${
          focused ? "text-indigo-500" : "text-gray-400 dark:text-slate-500"}`} />
      </div>
      <input
        id={id} name={id} type={type} autoComplete={autoComplete}
        value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur}
        placeholder={placeholder} maxLength={maxLength}
        className={`auth-input ${rightSlot ? "!pr-11" : ""}`}
      />
      {rightSlot && (
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
          {rightSlot}
        </div>
      )}
    </div>
  </div>
);

/* ── Visual panel — animated stats + steps ─────────────────── */
const VisualPanel = ({ step }) => (
  <div className="hidden lg:flex flex-1 auth-visual relative overflow-hidden flex-col items-center justify-center p-16">
    {/* Orbs */}
    <div className="auth-orb-1 absolute top-[12%] right-[20%] w-72 h-72 rounded-full" />
    <div className="auth-orb-2 absolute bottom-[15%] left-[10%] w-52 h-52 rounded-full" />
    <div className="auth-orb-3 absolute top-[55%] right-[55%] w-36 h-36 rounded-full" />

    {/* Dot grid */}
    <div className="absolute inset-0 opacity-20"
      style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

    <div className="relative z-10 max-w-sm text-center text-white">
      {/* Icon */}
      <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
        {step === 1
          ? <User className="w-9 h-9 text-white" />
          : <Shield className="w-9 h-9 text-white" />
        }
      </div>

      <h2 className="text-3xl font-bold mb-3 leading-tight">
        {step === 1
          ? <>Join the<br /><span className="text-indigo-300">next generation</span><br />of task management</>
          : <>Almost<br /><span className="text-indigo-300">there!</span></>
        }
      </h2>
      <p className="text-white/60 text-[15px] leading-relaxed mb-10">
        {step === 1
          ? "Set up your account in 2 simple steps and start collaborating with your team — for free."
          : "Optionally unlock admin access with an invite token, or skip and start as a team member."
        }
      </p>

      {/* Step indicator */}
      <div className="flex justify-center items-center gap-3 mb-10">
        {[1, 2].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`step-dot ${step >= s ? "active" : "inactive"}`}>{s}</div>
            {i < 1 && <div className={`step-line ${step >= 2 ? "active" : "inactive"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Perks */}
      <div className="space-y-3 text-left">
        {[
          "Free forever — no credit card required",
          "Unlimited tasks & projects",
          "Real-time team collaboration",
          "Analytics & progress tracking",
        ].map(perk => (
          <div key={perk} className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-[14px] text-white/70">{perk}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);


/* ════════════════════════════════════════════════════════════ */
const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", adminInviteToken: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl]  = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState(null);
  const [loading, setLoading]         = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [step, setStep]               = useState(1);

  const fileInputRef = useRef(null);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const strength = getPasswordStrength(formData.password);

  /* ── Handlers ─────────────────────────────────────────── */
  const set = (field) => (e) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const focus = (f) => () => setFocusedField(f);
  const blur  = ()  => setFocusedField(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB."); return;
    }
    setProfilePic(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setProfilePic(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateStep1 = () => {
    if (!formData.name.trim())        { setError("Please enter your full name.");         return false; }
    if (!validateEmail(formData.email)) { setError("Please enter a valid email address."); return false; }
    if (formData.password.length < 6)  { setError("Password must be at least 6 characters."); return false; }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) { setError(null); setStep(2); }
  };

  const handleSignUp = async (skipToken = false) => {
    setLoading(true);
    try {
      let profileImageUrl = "";
      if (profilePic) {
        const res = await uploadImage(profilePic);
        profileImageUrl = res.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profileImageUrl,
        adminInviteToken: skipToken ? undefined : (formData.adminInviteToken || undefined),
      });

      const { token, role } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Revoke object URL on unmount */
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0f1117]">

      {/* Visual panel — LEFT on signup (mirrored from login) */}
      <VisualPanel step={step} />

      {/* ── Form panel ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12 overflow-y-auto">
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
              {step === 1 ? "Create your account" : "Admin access (optional)"}
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-[15px]">
              {step === 1
                ? "Fill in your details to get started for free"
                : "Enter an invite token to join as admin, or skip"}
            </p>
          </div>

          {/* Mobile step dots */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            {[1, 2].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  step >= s
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500"
                }`}>{s}</div>
                {i < 1 && (
                  <div className={`flex-1 h-px transition-all duration-300 ${
                    step >= 2 ? "bg-indigo-600" : "bg-gray-200 dark:bg-slate-700"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── STEP 1 ──────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">

              {/* Profile picture upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-xl" />
                      <button type="button" onClick={removeImage}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors duration-200">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <label htmlFor="profile-pic"
                      className="w-24 h-24 rounded-full cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-2 border-dashed border-indigo-200 dark:border-indigo-700 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 transition-all duration-200 group">
                      <Camera className="w-7 h-7 text-indigo-400 group-hover:text-indigo-500 transition-colors duration-200" />
                      <span className="text-[10px] text-indigo-400 mt-1">Upload</span>
                    </label>
                  )}
                  <input id="profile-pic" type="file" accept="image/*"
                    className="hidden" onChange={handleImageChange} ref={fileInputRef} />
                </div>
                <p className="text-[12px] text-gray-400 dark:text-slate-500">
                  Optional · JPG, PNG up to 5 MB
                </p>
              </div>

              <InputField id="name" label="Full Name" icon={User}
                value={formData.name} onChange={set("name")}
                onFocus={focus("name")} onBlur={blur} focused={focusedField === "name"}
                placeholder="Jane Doe" autoComplete="name"
              />

              <InputField id="email" label="Email Address" type="email" icon={Mail}
                value={formData.email} onChange={set("email")}
                onFocus={focus("email")} onBlur={blur} focused={focusedField === "email"}
                placeholder="jane@company.com" autoComplete="email"
              />

              {/* Password + strength */}
              <div className="space-y-1.5">
                <InputField id="password" label="Password" icon={Lock}
                  type={showPassword ? "text" : "password"}
                  value={formData.password} onChange={set("password")}
                  onFocus={focus("password")} onBlur={blur} focused={focusedField === "password"}
                  placeholder="Min. 6 characters" autoComplete="new-password"
                  rightSlot={
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-200">
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  }
                />
                {/* Strength meter */}
                {formData.password && (
                  <div className="pt-1 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="strength-bar flex-1"
                          style={{ backgroundColor: i <= strength.score ? strength.color : "#e5e7eb" }} />
                      ))}
                    </div>
                    <p className="text-[11px] font-medium" style={{ color: strength.color || "#9ca3af" }}>
                      {strength.label}
                      {strength.score < 4 && (
                        <span className="text-gray-400 dark:text-slate-500 font-normal">
                          {" "}— try adding uppercase, numbers & symbols
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <button type="button" onClick={handleNext}
                className="w-full py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 active:scale-[0.98]">
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2 ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">

              {/* Token info card */}
              <div className="px-5 py-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-700/40 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                    <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-0.5">
                      Admin invite token
                    </p>
                    <p className="text-[13px] text-indigo-700/70 dark:text-indigo-400/70 leading-relaxed">
                      Has your admin shared a 6-digit token with you? Enter it below to join as an admin, or skip to continue as a team member.
                    </p>
                  </div>
                </div>
              </div>

              <InputField
                id="adminInviteToken"
                label="Token (optional)"
                icon={Key}
                value={formData.adminInviteToken}
                onChange={set("adminInviteToken")}
                onFocus={focus("adminToken")}
                onBlur={blur}
                focused={focusedField === "adminToken"}
                placeholder="6-digit code"
                maxLength={6}
                autoComplete="off"
              />

              {/* Action buttons */}
              <div className="space-y-3 pt-1">
                {/* Submit token */}
                <button type="button"
                  onClick={() => handleSignUp(false)} disabled={loading}
                  className="w-full py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account…</>
                  ) : (
                    <><Shield className="w-4 h-4" />Create as Admin</>
                  )}
                </button>

                {/* Skip — member */}
                <button type="button"
                  onClick={() => handleSignUp(true)} disabled={loading}
                  className="w-full py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />Creating…</>
                  ) : "Skip — Join as Team Member"}
                </button>

                {/* Back */}
                <button type="button" onClick={() => setStep(1)}
                  className="w-full py-2.5 text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-200">
                  ← Back to previous step
                </button>
              </div>
            </div>
          )}

          {/* Sign-in link */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">Have an account?</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
          </div>
          <Link to="/login"
            className="mt-4 block w-full py-3 text-center rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200">
            Sign in to existing account
          </Link>

        </div>
      </div>

    </div>
  );
};

export default SignUp;
