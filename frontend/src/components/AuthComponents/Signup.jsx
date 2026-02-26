// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../api/axios";
import GoogleAuthButton from './GoogleAuthButton';
import RoleSelectionModal from './RoleSelectionModal';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, CalendarCheck, ArrowLeft, XCircle, LogIn, MailWarning } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';

// ─────────────────────────────────────────────────────────────────────────────
// CSS KEYFRAMES  (injected once — zero JS overhead at runtime)
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes starPulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.08; }
  }
  @keyframes orbDrift1 {
    0%,100% { transform: translate(0px,   0px)   scale(1);    }
    33%     { transform: translate(45px, -65px)  scale(1.06); }
    66%     { transform: translate(-28px, 32px)  scale(0.95); }
  }
  @keyframes orbDrift2 {
    0%,100% { transform: translate(0px,   0px)   scale(1);    }
    33%     { transform: translate(-38px, 48px)  scale(0.96); }
    66%     { transform: translate(55px, -28px)  scale(1.05); }
  }
  @keyframes orbDrift3 {
    0%,100% { transform: translate(0px,   0px)   scale(1);    }
    40%     { transform: translate(28px, -38px)  scale(1.07); }
    70%     { transform: translate(-45px, 22px)  scale(0.94); }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// STATIC STAR DATA  (computed once at module level — no re-computation)
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
// STAR FIELD  — pure CSS twinkling, no JS per-frame work
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
  { w: 720, h: 720, top: '-20%', left: '-15%', color: 'rgba(99,102,241,0.11)', anim: 'orbDrift1 14s ease-in-out infinite' },
  { w: 500, h: 500, top: '42%', right: '-8%', color: 'rgba(168,85,247,0.09)', anim: 'orbDrift2 10s ease-in-out infinite' },
  { w: 360, h: 360, bottom: '-10%', left: '33%', color: 'rgba(236,72,153,0.07)', anim: 'orbDrift3 17s ease-in-out infinite' },
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
      initial={{ opacity: 0, x: -20 }}
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
// EMAIL EXISTS OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function EmailExistsOverlay({ email, name, onClose, onGoLogin }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99990] flex items-center justify-center p-4"
        style={{ background: 'rgba(4,4,12,0.88)', backdropFilter: 'blur(14px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 24 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="relative bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent rounded-t-3xl" />

          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <MailWarning className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Email already registered</h2>
          <p className="text-slate-400 text-sm mb-1">
            <span className="text-white font-medium">{name}</span>, your email
          </p>
          <p className="text-indigo-400 text-sm font-medium mb-3">{email}</p>
          <p className="text-slate-500 text-sm mb-7">is already linked to an existing account. Would you like to sign in instead?</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onGoLogin}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              <LogIn className="w-4 h-4" /> Sign in to existing account
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
            >
              <XCircle className="w-4 h-4 text-slate-400" /> Use a different Google account
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURES DATA
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: CalendarCheck, title: 'Discover Events', desc: 'Browse and register for campus events instantly' },
  { icon: Users, title: 'Connect & Collaborate', desc: 'Network with peers, faculty and clubs' },
  { icon: Shield, title: 'Secure & Trusted', desc: 'Enterprise-grade security for your data' },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Signup = () => {
  const navigate = useNavigate();
  const { syncUser } = useAuth();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [emailExistsData, setEmailExistsData] = useState(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true); setError('');
      const decoded = jwtDecode(credentialResponse.credential);
      const check = await axiosInstance.post('/auth/google/check', { email: decoded.email });
      if (check.data.exists) {
        setEmailExistsData({ email: decoded.email, name: decoded.name });
      } else {
        setGoogleUserData({ credential: credentialResponse.credential, email: decoded.email, name: decoded.name, googleId: decoded.sub });
        setShowRoleModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed');
    } finally { setLoading(false); }
  };

  const handleGoogleError = () => setError('Google authentication failed. Please try again.');

  const handleRoleSubmit = async (roleData) => {
    try {
      setLoading(true); setError(''); setSuccessMessage('');
      const res = await axiosInstance.post('/auth/google', { ...googleUserData, ...roleData, isGoogleAuth: true });
      setShowRoleModal(false);
      if (res.data.token) {
        // Student account — log in immediately
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        syncUser(); // sync AuthContext in-memory state
        const role = res.data.user.role;
        navigate(role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student', { replace: true });
      } else {
        // Faculty account — pending admin approval
        setSuccessMessage('✅ Account created! Your faculty account is pending admin approval. Redirecting to login…');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-[#06060c]">

      {/* ── Background ─────────────────────────────────────────────────── */}
      <StarField />
      <FloatingOrbs />

      {/* Fine line-grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Modals / Overlays ──────────────────────────────────────────── */}
      {emailExistsData && (
        <EmailExistsOverlay
          email={emailExistsData.email}
          name={emailExistsData.name}
          onClose={() => setEmailExistsData(null)}
          onGoLogin={() => navigate('/login')}
        />
      )}
      {showRoleModal && googleUserData && (
        <RoleSelectionModal
          isOpen={showRoleModal}
          onClose={() => { setShowRoleModal(false); setGoogleUserData(null); }}
          onSubmit={handleRoleSubmit}
          userName={googleUserData.name}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          LEFT PANEL — Branding
      ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative z-10 flex-col justify-between p-12 overflow-hidden">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
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
            Join thousands of students
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
            Your campus,<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              reimagined.
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-sm">
            One platform for all your college events, clubs, and opportunities. Get started in seconds.
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
            <p className="text-white text-sm font-medium">2,400+ students joined</p>
            <p className="text-slate-500 text-xs">across 7 branches</p>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          RIGHT PANEL — Sign Up Card
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
                {/* Live badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Free to join · No credit card needed
                </div>

                <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">
                  Join{' '}
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Campus Pulse
                  </span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                  One tap to access events, clubs, and everything happening on campus.
                </p>
              </motion.div>
            </div>

            {/* ── Divider ────────────────────────────────────────────────── */}
            <div className="mx-8 border-t border-white/[0.07]" />

            {/* ── CTA section ────────────────────────────────────────────── */}
            <div className="px-8 py-8 relative z-10">
              {/* Error / Success banners */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-4 py-3 rounded-2xl text-sm mb-5 border bg-red-500/10 border-red-500/25 text-red-400"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-4 py-3 rounded-2xl text-sm mb-5 border bg-green-500/10 border-green-500/25 text-green-400"
                  >
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google button — with outer glow ring */}
              <div className="relative group">
                {/* Glow effect behind button */}
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100 blur transition-all duration-500 pointer-events-none" />
                <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-indigo-500/40 transition-all duration-300">
                  <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signup_with" />
                </div>
              </div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-4 mt-6"
              >
                {[
                  { icon: Shield, label: 'Secure' },
                  { icon: Users, label: '2,400+ users' },
                  { icon: CalendarCheck, label: '50+ events' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Icon className="w-3.5 h-3.5 text-indigo-500/70" />
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>

              {/* Sign in link */}
              <p className="text-sm text-slate-500 text-center mt-6 pt-6 border-t border-white/[0.07]">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Sign in
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
    </div>
  );
};

export default Signup;