// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, CalendarCheck, Users, Zap, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import GoogleAuthButton from './GoogleAuthButton';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/useAuth';

// ─────────────────────────────────────────────────────────────────────────────
// CSS KEYFRAMES  (injected once — zero JS overhead at runtime)
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes starPulse {
    0%,100% { opacity: 1;    }
    50%      { opacity: 0.08; }
  }
  @keyframes orbDrift1 {
    0%,100% { transform: translate(0px,   0px)  scale(1);    }
    33%     { transform: translate(50px, -70px) scale(1.06); }
    66%     { transform: translate(-30px, 35px) scale(0.95); }
  }
  @keyframes orbDrift2 {
    0%,100% { transform: translate(0px,   0px)  scale(1);    }
    33%     { transform: translate(-40px, 52px) scale(0.96); }
    66%     { transform: translate(58px, -30px) scale(1.05); }
  }
  @keyframes orbDrift3 {
    0%,100% { transform: translate(0px,   0px)  scale(1);    }
    40%     { transform: translate(30px, -42px) scale(1.07); }
    70%     { transform: translate(-48px, 24px) scale(0.94); }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// STATIC STAR DATA  (computed once at module level)
// ─────────────────────────────────────────────────────────────────────────────
const STARS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() < 0.18 ? 2 : 1,
  opacity: 0.18 + Math.random() * 0.55,
  dur: `${2.5 + Math.random() * 5}s`,
  delay: `${Math.random() * 4}s`,
}));

// ─────────────────────────────────────────────────────────────────────────────
// STAR FIELD  — pure CSS twinkling
// ─────────────────────────────────────────────────────────────────────────────
function StarField() {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {STARS.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              top: s.top, left: s.left,
              width: s.size, height: s.size,
              opacity: s.opacity,
              animation: `starPulse ${s.dur} ${s.delay} ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING ORBS  — CSS keyframe, compositor-thread only
// ─────────────────────────────────────────────────────────────────────────────
const ORBS = [
  { w: 700, h: 700, top: '-18%', right: '-12%', color: 'rgba(99,102,241,0.11)', anim: 'orbDrift1 13s ease-in-out infinite' },
  { w: 480, h: 480, top: '45%', left: '-6%', color: 'rgba(168,85,247,0.09)', anim: 'orbDrift2 10s ease-in-out infinite' },
  { w: 340, h: 340, bottom: '-8%', left: '38%', color: 'rgba(236,72,153,0.07)', anim: 'orbDrift3 16s ease-in-out infinite' },
];

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.w, height: orb.h,
            top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            filter: 'blur(72px)',
            animation: orb.anim,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE ROW  — CSS hover only, no RAF
// ─────────────────────────────────────────────────────────────────────────────
function FeatureRow({ icon: Icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay }}
      className="flex items-start gap-4 group"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10">
        <Icon className="w-5 h-5 text-indigo-400 transition-transform duration-300 group-hover:scale-110" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors duration-200">{title}</p>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURES DATA
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: CalendarCheck, title: 'All Your Events', desc: 'Access registrations, schedules & live updates' },
  { icon: Users, title: 'Your Network', desc: 'Stay connected with clubs, faculty & peers' },
  { icon: Zap, title: 'Instant Access', desc: 'Jump right in — no waiting, no friction' },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin, syncUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setError('');
      // Use authLogin so the context user state is updated immediately
      const data = await authLogin(formData.email, formData.password);
      const role = data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      if (msg.toLowerCase().includes('approval')) {
        setError('Your account is pending admin approval.');
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true); setError('');
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        credential: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub,
      });
      if (res.data.token) {
        // Update context state so ProtectedRoute sees auth immediately
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        syncUser(); // sync AuthContext in-memory state from localStorage
        const role = res.data.user.role;
        navigate(role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student', { replace: true });
      } else if (res.data.needsProfile) {
        setError('No account found for this email. Please sign up first.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed');
    } finally { setLoading(false); }
  };

  const handleGoogleError = () => setError('Google authentication failed. Please try again.');

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-[#06060c]">

      {/* ── Background ─────────────────────────────────────────────────── */}
      <StarField />
      <FloatingOrbs />

      {/* Dot-grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          LEFT PANEL — Login Card
      ══════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 xl:w-[45%] relative z-10 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img
              src="https://res.cloudinary.com/dashboard-gallery/image/upload/v1771658399/college-portal/profile-pics/c35hx5mpy0pmntbzprjw.jpg"
              alt="Campus Pulse logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-lg font-bold text-white">Campus Pulse</span>
          </div>

          {/* Glass card */}
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden transition-shadow duration-500 hover:shadow-indigo-950/60">
            {/* Top shimmer line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
            {/* Bottom shimmer line */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

            {/* Decorative inner glow blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-purple-600/8 blur-3xl pointer-events-none" />

            {/* ── Header section ─────────────────────────────────────────── */}
            <div className="px-8 pt-10 pb-8 text-center relative z-10">
              {/* Logo badge */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6 w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-500/20"
              >
                <img
                  src="https://res.cloudinary.com/dashboard-gallery/image/upload/v1771658399/college-portal/profile-pics/c35hx5mpy0pmntbzprjw.jpg"
                  alt="Campus Pulse"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                {/* Status badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Welcome back · Secure sign in
                </div>

                <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">
                  Sign in to{' '}
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Campus Pulse
                  </span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                  Pick up where you left off — events, clubs, and everything campus.
                </p>
              </motion.div>
            </div>

            {/* ── Divider ────────────────────────────────────────────────── */}
            <div className="mx-8 border-t border-white/[0.07]" />

            {/* ── CTA / Form section ─────────────────────────────────────── */}
            <div className="px-8 py-8 relative z-10">

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`px-4 py-3 rounded-2xl text-sm mb-5 border ${error.includes('approval')
                      ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                      : 'bg-red-500/10 border-red-500/25 text-red-400'
                      }`}
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google button — with outer glow ring */}
              <div className="relative group mb-6">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100 blur transition-all duration-500 pointer-events-none" />
                <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-indigo-500/40 transition-all duration-300">
                  <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signin_with" />
                </div>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-transparent text-slate-600 text-xs">or continue with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-600" />
                    </div>
                    <input
                      id="email" name="email" type="email" required
                      value={formData.email} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all duration-200"
                      placeholder="you@college.edu"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
                    <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-600" />
                    </div>
                    <input
                      id="password" name="password"
                      type={showPassword ? 'text' : 'password'} required
                      value={formData.password} onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all duration-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold mt-2 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-4 mt-6"
              >
                {[
                  { icon: CalendarCheck, label: 'All Events' },
                  { icon: Users, label: '2,400+ users' },
                  { icon: Zap, label: 'Instant Access' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Icon className="w-3.5 h-3.5 text-indigo-500/70" />
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>

              {/* Sign up link */}
              <p className="text-sm text-slate-500 text-center mt-6 pt-6 border-t border-white/[0.07]">
                Don't have an account?{' '}
                <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Sign up free
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <Link to="/" className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 text-sm transition-colors duration-200">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to home
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          RIGHT PANEL — Branding
      ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative z-10 flex-col justify-between p-12 overflow-hidden">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-3"
        >
          <img
            src="https://res.cloudinary.com/dashboard-gallery/image/upload/v1771658399/college-portal/profile-pics/c35hx5mpy0pmntbzprjw.jpg"
            alt="Campus Pulse logo"
            className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-500/30"
          />
          <span className="text-xl font-bold text-white tracking-tight">Campus Pulse</span>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Welcome back
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
            Good to see<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              you again.
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-sm">
            Sign in to pick up where you left off — events, clubs, and everything campus.
          </p>
          <div className="space-y-5">
            {FEATURES.map((f, i) => <FeatureRow key={i} {...f} delay={0.4 + i * 0.15} />)}
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm max-w-sm"
        >
          <div className="flex -space-x-2">
            {['#6366f1', '#8b5cf6', '#ec4899'].map((c, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[#06060c] flex items-center justify-center text-xs font-bold text-white"
                style={{ background: c }}
              >
                {['A', 'B', 'C'][i]}
              </div>
            ))}
          </div>
          <div>
            <p className="text-white text-sm font-medium">2,400+ students active</p>
            <p className="text-slate-500 text-xs">across 7 branches</p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Login;