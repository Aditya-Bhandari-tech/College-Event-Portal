// src/pages/Signup.jsx
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../api/axios";
import GoogleAuthButton from './GoogleAuthButton';
import RoleSelectionModal from './RoleSelectionModal';
import { jwtDecode } from 'jwt-decode';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { Sparkles, Shield, Users, CalendarCheck, ArrowLeft, CheckCircle2, XCircle, LogIn, MailWarning } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS PARTICLE TRAIL
// ─────────────────────────────────────────────────────────────────────────────
class Spark {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * 3.5;
    this.vy = (Math.random() - 0.5) * 3.5 - 1.2;
    this.life = 1;
    this.decay = 0.018 + Math.random() * 0.025;
    this.r = 1.5 + Math.random() * 3;
    this.hue = 210 + Math.random() * 80;         // indigo → pink
  }
  tick() {
    this.x += this.vx; this.y += this.vy;
    this.vy += 0.055;                             // gentle gravity
    this.vx *= 0.97;
    this.life -= this.decay;
  }
  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life * 0.9;
    ctx.shadowBlur = 12;
    ctx.shadowColor = `hsl(${this.hue},100%,72%)`;
    ctx.fillStyle = `hsl(${this.hue},100%,72%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * this.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function useParticleCanvas(mouseXRef, mouseYRef) {
  const canvasRef = useRef(null);
  const sparks = useRef([]);
  const rafRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Emit sparks when mouse moves enough
      const mx = mouseXRef.current ?? 0;
      const my = mouseYRef.current ?? 0;
      const dx = mx - lastPos.current.x;
      const dy = my - lastPos.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 3) {
        const count = Math.min(Math.floor(dist / 4), 6);
        for (let i = 0; i < count; i++) {
          sparks.current.push(new Spark(
            lastPos.current.x + dx * (i / count),
            lastPos.current.y + dy * (i / count),
          ));
        }
        lastPos.current = { x: mx, y: my };
      }

      sparks.current = sparks.current.filter(s => s.life > 0);
      sparks.current.forEach(s => { s.tick(); s.draw(ctx); });
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [mouseXRef, mouseYRef]);

  return canvasRef;
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM CURSOR
// ─────────────────────────────────────────────────────────────────────────────
function CustomCursor({ mx, my }) {
  // Small fast dot
  const dotX = useSpring(mx, { stiffness: 700, damping: 28 });
  const dotY = useSpring(my, { stiffness: 700, damping: 28 });
  // Large slow ring
  const ringX = useSpring(mx, { stiffness: 90, damping: 20 });
  const ringY = useSpring(my, { stiffness: 90, damping: 20 });
  // Outer glow (even slower)
  const glowX = useSpring(mx, { stiffness: 40, damping: 18 });
  const glowY = useSpring(my, { stiffness: 40, damping: 18 });

  return (
    <>
      {/* Outer glow blob */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9997]"
        style={{ x: useTransform(glowX, v => v - 60), y: useTransform(glowY, v => v - 60) }}
      >
        <div className="w-[120px] h-[120px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', filter: 'blur(8px)' }} />
      </motion.div>

      {/* Ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{ x: useTransform(ringX, v => v - 20), y: useTransform(ringY, v => v - 20) }}
      >
        <div className="w-10 h-10 rounded-full border border-indigo-400/60"
          style={{ boxShadow: '0 0 10px rgba(99,102,241,0.4)' }} />
      </motion.div>

      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: useTransform(dotX, v => v - 3), y: useTransform(dotY, v => v - 3) }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white"
          style={{ boxShadow: '0 0 6px 2px rgba(139,92,246,0.9)' }} />
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLICK RIPPLE
// ─────────────────────────────────────────────────────────────────────────────
function ClickRipple({ ripples }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9996]">
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div
            key={r.id}
            className="absolute rounded-full border border-indigo-400/50"
            style={{ left: r.x, top: r.y }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.8 }}
            animate={{ width: 180, height: 180, x: -90, y: -90, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAGNETIC FEATURE CARD
// ─────────────────────────────────────────────────────────────────────────────
function MagneticCard({ icon: Icon, title, desc, delay, mouseXRef, mouseYRef }) {
  const ref = useRef(null);
  const cardMX = useMotionValue(0);
  const cardMY = useMotionValue(0);
  const sX = useSpring(cardMX, { stiffness: 150, damping: 20 });
  const sY = useSpring(cardMY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    let rafId;
    const track = () => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const mx = mouseXRef.current ?? 0;
        const my = mouseYRef.current ?? 0;
        const dist = Math.hypot(mx - cx, my - cy);
        const MAX = 160;
        if (dist < MAX) {
          const pull = (1 - dist / MAX) * 12;
          cardMX.set((mx - cx) / dist * pull);
          cardMY.set((my - cy) / dist * pull);
        } else {
          cardMX.set(0); cardMY.set(0);
        }
      }
      rafId = requestAnimationFrame(track);
    };
    track();
    return () => cancelAnimationFrame(rafId);
  }, [cardMX, cardMY, mouseXRef, mouseYRef]);

  return (
    <motion.div
      ref={ref}
      style={{ x: sX, y: sY }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-start gap-4 cursor-default group"
    >
      <motion.div
        whileHover={{ scale: 1.15, rotate: 8 }}
        transition={{ type: 'spring', stiffness: 400 }}
        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 transition-colors duration-300"
      >
        <Icon className="w-5 h-5 text-indigo-400" />
      </motion.div>
      <div>
        <p className="text-white font-semibold text-sm group-hover:text-indigo-300 transition-colors">{title}</p>
        <p className="text-slate-500 text-sm">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3-D TILT CARD (enhanced)
// ─────────────────────────────────────────────────────────────────────────────
function TiltCard({ children }) {
  const ref = useRef(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sX = useSpring(rotX, { stiffness: 140, damping: 18 });
  const sY = useSpring(rotY, { stiffness: 140, damping: 18 });
  // inner shimmer
  const shimX = useMotionValue(50);
  const shimY = useMotionValue(50);

  const onMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotX.set(-dy * 10);
    rotY.set(dx * 10);
    shimX.set(((e.clientX - rect.left) / rect.width) * 100);
    shimY.set(((e.clientY - rect.top) / rect.height) * 100);
  }, [rotX, rotY, shimX, shimY]);

  const onLeave = useCallback(() => {
    rotX.set(0); rotY.set(0);
    shimX.set(50); shimY.set(50);
  }, [rotX, rotY, shimX, shimY]);

  const shimmerBg = useTransform([shimX, shimY], ([x, y]) =>
    `radial-gradient(circle at ${x}% ${y}%, rgba(139,92,246,0.08) 0%, transparent 60%)`
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: sX, rotateY: sY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-black/40 overflow-hidden"
    >
      {/* Moving shimmer */}
      <motion.div className="absolute inset-0 pointer-events-none rounded-3xl" style={{ background: shimmerBg }} />
      {/* Top highlight edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AURORA BACKGROUND  (hue shifts with mouse quadrant)
// ─────────────────────────────────────────────────────────────────────────────
function Aurora({ mx, my }) {
  const hueShift = useTransform(mx, [-600, 600], [0, 60]);
  const grad1 = useTransform([mx, my, hueShift], ([x, y, h]) =>
    `radial-gradient(700px circle at calc(50% + ${x * 0.5}px) calc(50% + ${y * 0.5}px), hsla(${230 + h},80%,60%,0.12), transparent 70%)`
  );
  const grad2 = useTransform([mx, my, hueShift], ([x, y, h]) =>
    `radial-gradient(500px circle at calc(50% + ${-x * 0.3}px) calc(50% + ${-y * 0.3}px), hsla(${280 + h},70%,60%,0.10), transparent 70%)`
  );
  const grad3 = useTransform([mx, my], ([x, y]) =>
    `radial-gradient(400px circle at calc(${30 + x * 0.01}%) calc(${70 + y * 0.01}%), rgba(59,130,246,0.09), transparent 70%)`
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <motion.div className="absolute inset-0" style={{ background: grad1 }} />
      <motion.div className="absolute inset-0" style={{ background: grad2 }} />
      <motion.div className="absolute inset-0" style={{ background: grad3 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAR FIELD
// ─────────────────────────────────────────────────────────────────────────────
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() < 0.2 ? 2 : 1,
  depth: 0.005 + Math.random() * 0.02,
  opacity: 0.2 + Math.random() * 0.5,
}));

// Each star needs its own component so hooks are called at component top-level
function Star({ star, mx, my }) {
  const sX = useSpring(useTransform(mx, v => v * star.depth), { stiffness: 30, damping: 20 });
  const sY = useSpring(useTransform(my, v => v * star.depth), { stiffness: 30, damping: 20 });
  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        top: star.top, left: star.left,
        width: star.size, height: star.size,
        opacity: star.opacity, x: sX, y: sY,
      }}
    />
  );
}

function StarField({ mx, my }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {STARS.map(star => (
        <Star key={star.id} star={star} mx={mx} my={my} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL ALREADY EXISTS OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function EmailExistsOverlay({ email, name, onClose, onGoLogin }) {
  // Animated letter shake
  const letters = "Email already in use".split("");

  return (
    <AnimatePresence>
      <motion.div
        key="email-exists-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99990] flex items-center justify-center"
        style={{ backdropFilter: 'blur(18px)', background: 'rgba(6,6,12,0.85)' }}
      >
        {/* Animated glow rings */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(220,38,38,0.12), transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(239,68,68,0.08), transparent 70%)' }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
        />

        {/* Card */}
        <motion.div
          initial={{ scale: 0.7, y: 60, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="relative w-full max-w-md mx-6 rounded-3xl border border-red-500/20 bg-[#0e0e1a] p-8 shadow-2xl shadow-red-900/30 overflow-hidden text-center"
        >
          {/* Top glowing border */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

          {/* Pulsing icon */}
          <motion.div
            className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center relative"
            style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.15), transparent 70%)' }}
            animate={{ boxShadow: ['0 0 0 0 rgba(239,68,68,0.3)', '0 0 0 20px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              initial={{ rotate: 0 }} animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <MailWarning className="w-10 h-10 text-red-400" />
            </motion.div>
          </motion.div>

          {/* Animated title letters */}
          <div className="flex items-center justify-center flex-wrap gap-0 mb-3">
            {letters.map((l, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04, type: 'spring', stiffness: 300 }}
                className={`text-xl font-extrabold tracking-tight ${l === " " ? "w-2" : ""}`}
                style={{ color: l === " " ? 'transparent' : `hsl(${0 + i * 4},90%,${60 + i * 0.5}%)` }}
              >
                {l === " " ? "\u00A0" : l}
              </motion.span>
            ))}
          </div>

          {/* Avatar + email pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(name || email || '?')[0].toUpperCase()}
            </div>
            <div className="px-4 py-2 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-300 text-sm font-mono truncate max-w-[220px]">
              {email}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="text-slate-400 text-sm mb-8 leading-relaxed"
          >
            This Google account is <span className="text-white font-medium">already registered</span> with Campus Pulse.<br />
            Try a different account or sign in instead.
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="flex flex-col gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(99,102,241,0.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={onGoLogin}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign in to existing account
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:text-white font-medium text-sm transition-all"
            >
              <XCircle className="w-4 h-4" />
              Try a different Google account
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: CalendarCheck, title: "Discover Events", desc: "Browse and register for campus events instantly" },
  { icon: Users, title: "Connect & Collaborate", desc: "Network with peers, faculty and clubs" },
  { icon: Shield, title: "Secure & Trusted", desc: "Enterprise-grade security for your data" },
];

const Signup = () => {
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [emailExistsData, setEmailExistsData] = useState(null); // { email, name }
  const [ripples, setRipples] = useState([]);
  const [cursorVisible, setCursorVisible] = useState(false);

  // Raw mouse MotionValues (viewport coords)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  // Refs for RAF-based animations (canvas, magnetic)
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  // Centred values for aurora / stars
  const centreX = useMotionValue(0);
  const centreY = useMotionValue(0);

  const canvasRef = useParticleCanvas(mouseXRef, mouseYRef);

  const onMouseMove = useCallback((e) => {
    rawX.set(e.clientX);
    rawY.set(e.clientY);
    centreX.set(e.clientX - window.innerWidth / 2);
    centreY.set(e.clientY - window.innerHeight / 2);
    mouseXRef.current = e.clientX;
    mouseYRef.current = e.clientY;
    setCursorVisible(true);
  }, [rawX, rawY, centreX, centreY]);

  const onMouseLeave = useCallback(() => setCursorVisible(false), []);

  const onClick = useCallback((e) => {
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 900);
  }, []);

  // ── Auth handlers ───────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true); setError('');
      const decoded = jwtDecode(credentialResponse.credential);
      const check = await axiosInstance.post('/auth/google/check', { email: decoded.email });
      if (check.data.exists) {
        // Email already registered — show creative error overlay instead of logging in
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
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setShowRoleModal(false);
        const role = res.data.user.role;
        navigate(role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student');
      } else {
        setShowRoleModal(false);
        setSuccessMessage('Your request has been sent to admin for approval.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="relative min-h-screen flex overflow-hidden bg-[#06060c] cursor-none"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* ── Layers (back → front) ─────────────────────────────────────── */}

      {/* Star field */}
      <StarField mx={centreX} my={centreY} />

      {/* Aurora */}
      <Aurora mx={centreX} my={centreY} />

      {/* Fine grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9995]" />

      {/* Custom cursor */}
      <AnimatePresence>
        {cursorVisible && <CustomCursor mx={rawX} my={rawY} />}
      </AnimatePresence>

      {/* Click ripples */}
      <ClickRipple ripples={ripples} />

      {/* ── LEFT PANEL ────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative z-10 flex-col justify-between p-12 overflow-hidden">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-3"
        >
          <motion.div
            whileHover={{ rotate: 20, scale: 1.1 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-xl font-bold text-white tracking-tight">Campus Pulse</span>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Join thousands of students
          </motion.div>

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
            {FEATURES.map((f, i) => (
              <MagneticCard
                key={i} {...f} delay={0.4 + i * 0.15}
                mouseXRef={mouseXRef} mouseYRef={mouseYRef}
              />
            ))}
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="flex items-center gap-4 p-4 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm max-w-sm"
        >
          <div className="flex -space-x-2">
            {['#6366f1', '#8b5cf6', '#ec4899'].map((c, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4, scale: 1.2, zIndex: 10 }}
                className="w-8 h-8 rounded-full border-2 border-[#06060c] flex items-center justify-center text-xs font-bold text-white relative"
                style={{ background: c }}
              >
                {['A', 'B', 'C'][i]}
              </motion.div>
            ))}
          </div>
          <div>
            <p className="text-white text-sm font-medium">2,400+ students joined</p>
            <p className="text-slate-500 text-xs">across 7 branches</p>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-[45%] relative z-10 flex items-center justify-center px-6 py-12">

        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Campus Pulse</span>
          </div>

          {/* Tilt Card */}
          <TiltCard>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
              <p className="text-slate-500 text-sm">Quick setup — no password needed</p>
            </div>

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-4 py-3 rounded-2xl text-sm mb-6"
                role="status"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {successMessage}
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-2xl text-sm mb-6"
                role="alert"
              >
                {error}
              </motion.div>
            )}

            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-6">
              {['Sign in with Google', 'Complete profile', "You're in!"].map((label, i) => (
                <div key={i} className="flex items-center gap-2" title={label}>
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${i === 0 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50' : 'bg-white/8 text-slate-500'}`}
                  >
                    {i + 1}
                  </motion.div>
                  {i < 2 && <div className="w-5 h-px bg-white/10" />}
                </div>
              ))}
            </div>

            {/* Google button */}
            <div className="mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-3">Step 1 — Sign in</p>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="rounded-2xl overflow-hidden ring-1 ring-white/10 hover:ring-indigo-500/40 transition-all duration-300"
                style={{ boxShadow: '0 0 0 0 rgba(99,102,241,0)' }}
                whileFocus={{ boxShadow: '0 0 0 3px rgba(99,102,241,0.3)' }}
              >
                <GoogleAuthButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signup_with"
                />
              </motion.div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-5 py-4 border-t border-white/8">
              {['Secure', 'Instant', 'Free'].map(label => (
                <div key={label} className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  {label}
                </div>
              ))}
            </div>

            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign in
              </Link>
            </p>
          </TiltCard>

          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>

      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSubmit={handleRoleSubmit}
        userName={googleUserData?.name || ''}
      />

      {/* Email already exists overlay */}
      {emailExistsData && (
        <EmailExistsOverlay
          email={emailExistsData.email}
          name={emailExistsData.name}
          onClose={() => setEmailExistsData(null)}
          onGoLogin={() => navigate('/login')}
        />
      )}
    </div>
  );
};

export default Signup;