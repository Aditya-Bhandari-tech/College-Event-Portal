// src/pages/Login.jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, CalendarCheck, Users, Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import GoogleAuthButton from './GoogleAuthButton';
import { jwtDecode } from 'jwt-decode';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS PARTICLE TRAIL  (same indigo/pink palette)
// ─────────────────────────────────────────────────────────────────────────────
class Spark {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * 3.5;
    this.vy = (Math.random() - 0.5) * 3.5 - 1.2;
    this.life = 1;
    this.decay = 0.018 + Math.random() * 0.025;
    this.r = 1.5 + Math.random() * 3;
    this.hue = 210 + Math.random() * 80;
  }
  tick() {
    this.x += this.vx; this.y += this.vy;
    this.vy += 0.055; this.vx *= 0.97;
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
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseXRef.current ?? 0, my = mouseYRef.current ?? 0;
      const dx = mx - lastPos.current.x, dy = my - lastPos.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 3) {
        const count = Math.min(Math.floor(dist / 4), 6);
        for (let i = 0; i < count; i++)
          sparks.current.push(new Spark(lastPos.current.x + dx * (i / count), lastPos.current.y + dy * (i / count)));
        lastPos.current = { x: mx, y: my };
      }
      sparks.current = sparks.current.filter(s => s.life > 0);
      sparks.current.forEach(s => { s.tick(); s.draw(ctx); });
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, [mouseXRef, mouseYRef]);
  return canvasRef;
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM CURSOR  — rotating diamond/square ring (indigo glow, different from signup's circle)
// ─────────────────────────────────────────────────────────────────────────────
function CustomCursor({ mx, my }) {
  const dotX = useSpring(mx, { stiffness: 700, damping: 28 });
  const dotY = useSpring(my, { stiffness: 700, damping: 28 });
  const ringX = useSpring(mx, { stiffness: 85, damping: 20 });
  const ringY = useSpring(my, { stiffness: 85, damping: 20 });
  const glowX = useSpring(mx, { stiffness: 38, damping: 17 });
  const glowY = useSpring(my, { stiffness: 38, damping: 17 });

  return (
    <>
      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9997]"
        style={{ x: useTransform(glowX, v => v - 60), y: useTransform(glowY, v => v - 60) }}>
        <div className="w-[120px] h-[120px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', filter: 'blur(8px)' }} />
      </motion.div>

      {/* Rotating square (45° tilted) ring */}
      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{ x: useTransform(ringX, v => v - 18), y: useTransform(ringY, v => v - 18) }}
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}>
        <div className="w-9 h-9 border border-indigo-400/70 rounded-sm"
          style={{ boxShadow: '0 0 10px rgba(99,102,241,0.5)' }} />
      </motion.div>

      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: useTransform(dotX, v => v - 3), y: useTransform(dotY, v => v - 3) }}>
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
          <motion.div key={r.id} className="absolute rounded-full border border-indigo-400/50"
            style={{ left: r.x, top: r.y }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.8 }}
            animate={{ width: 180, height: 180, x: -90, y: -90, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }} />
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
  const cardMX = useMotionValue(0), cardMY = useMotionValue(0);
  const sX = useSpring(cardMX, { stiffness: 150, damping: 20 });
  const sY = useSpring(cardMY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    let rafId;
    const track = () => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        const mx = mouseXRef.current ?? 0, my = mouseYRef.current ?? 0;
        const dist = Math.hypot(mx - cx, my - cy);
        if (dist < 160) {
          const pull = (1 - dist / 160) * 12;
          cardMX.set((mx - cx) / dist * pull); cardMY.set((my - cy) / dist * pull);
        } else { cardMX.set(0); cardMY.set(0); }
      }
      rafId = requestAnimationFrame(track);
    };
    track();
    return () => cancelAnimationFrame(rafId);
  }, [cardMX, cardMY, mouseXRef, mouseYRef]);

  return (
    <motion.div ref={ref} style={{ x: sX, y: sY }}
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-start gap-4 cursor-default group">
      <motion.div whileHover={{ scale: 1.15, rotate: -8 }} transition={{ type: 'spring', stiffness: 400 }}
        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 transition-colors duration-300">
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
// 3-D TILT CARD
// ─────────────────────────────────────────────────────────────────────────────
function TiltCard({ children }) {
  const ref = useRef(null);
  const rotX = useMotionValue(0), rotY = useMotionValue(0);
  const sX = useSpring(rotX, { stiffness: 140, damping: 18 });
  const sY = useSpring(rotY, { stiffness: 140, damping: 18 });
  const shimX = useMotionValue(50), shimY = useMotionValue(50);

  const onMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    rotX.set(-((e.clientY - cy) / (rect.height / 2)) * 10);
    rotY.set(((e.clientX - cx) / (rect.width / 2)) * 10);
    shimX.set(((e.clientX - rect.left) / rect.width) * 100);
    shimY.set(((e.clientY - rect.top) / rect.height) * 100);
  }, [rotX, rotY, shimX, shimY]);

  const onLeave = useCallback(() => {
    rotX.set(0); rotY.set(0); shimX.set(50); shimY.set(50);
  }, [rotX, rotY, shimX, shimY]);

  const shimmerBg = useTransform([shimX, shimY], ([x, y]) =>
    `radial-gradient(circle at ${x}% ${y}%, rgba(139,92,246,0.09) 0%, transparent 60%)`
  );

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX: sX, rotateY: sY, transformPerspective: 1000, transformStyle: 'preserve-3d' }}
      className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-black/40 overflow-hidden">
      <motion.div className="absolute inset-0 pointer-events-none rounded-3xl" style={{ background: shimmerBg }} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AURORA  (same indigo/purple palette)
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
    `radial-gradient(400px circle at calc(${70 + x * 0.01}%) calc(${30 + y * 0.01}%), rgba(59,130,246,0.09), transparent 70%)`
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
// STAR FIELD  (60 stars — slightly fewer than signup's 80)
// ─────────────────────────────────────────────────────────────────────────────
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() < 0.2 ? 2 : 1,
  depth: 0.004 + Math.random() * 0.018,
  opacity: 0.15 + Math.random() * 0.45,
}));

function Star({ star, mx, my }) {
  const sX = useSpring(useTransform(mx, v => v * star.depth), { stiffness: 30, damping: 20 });
  const sY = useSpring(useTransform(my, v => v * star.depth), { stiffness: 30, damping: 20 });
  return (
    <motion.div className="absolute rounded-full bg-white"
      style={{ top: star.top, left: star.left, width: star.size, height: star.size, opacity: star.opacity, x: sX, y: sY }} />
  );
}

function StarField({ mx, my }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {STARS.map(star => <Star key={star.id} star={star} mx={mx} my={my} />)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: CalendarCheck, title: "All Your Events", desc: "Access registrations, schedules & live updates" },
  { icon: Users, title: "Your Network", desc: "Stay connected with clubs, faculty & peers" },
  { icon: Zap, title: "Instant Access", desc: "Jump right in — no waiting, no friction" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [cursorVisible, setCursorVisible] = useState(false);

  const rawX = useMotionValue(0), rawY = useMotionValue(0);
  const centreX = useMotionValue(0), centreY = useMotionValue(0);
  const mouseXRef = useRef(0), mouseYRef = useRef(0);
  const canvasRef = useParticleCanvas(mouseXRef, mouseYRef);

  const onMouseMove = useCallback((e) => {
    rawX.set(e.clientX); rawY.set(e.clientY);
    centreX.set(e.clientX - window.innerWidth / 2);
    centreY.set(e.clientY - window.innerHeight / 2);
    mouseXRef.current = e.clientX; mouseYRef.current = e.clientY;
    setCursorVisible(true);
  }, [rawX, rawY, centreX, centreY]);

  const onMouseLeave = useCallback(() => setCursorVisible(false), []);
  const onClick = useCallback((e) => {
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 900);
  }, []);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    if (!formData.email || !formData.password) { setError('Please enter email and password'); setLoading(false); return; }
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student');
    } catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true); setError('');
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        credential: credentialResponse.credential,
        email: decoded.email, name: decoded.name, googleId: decoded.sub,
      });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        const role = res.data.user.role;
        navigate(role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student');
      } else if (res.data.needsProfile) {
        setError('No account found. Please sign up first.');
      }
    } catch (err) { setError(err.response?.data?.message || 'Google authentication failed'); }
    finally { setLoading(false); }
  };

  const handleGoogleError = () => setError('Google authentication failed. Please try again.');

  return (
    <div
      className="relative min-h-screen flex overflow-hidden bg-[#06060c] cursor-none"
      onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} onClick={onClick}
    >
      {/* ── Background layers ─────────────────────────────────────────── */}
      <StarField mx={centreX} my={centreY} />
      <Aurora mx={centreX} my={centreY} />

      {/* Dot-grid (login) vs line-grid (signup) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9995]" />

      <AnimatePresence>
        {cursorVisible && <CustomCursor mx={rawX} my={rawY} />}
      </AnimatePresence>

      <ClickRipple ripples={ripples} />

      {/* ══════════════════════════════════════════════════════════════════
          LEFT PANEL — form (mirrored vs signup's right-side form)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 xl:w-[45%] relative z-10 flex items-center justify-center px-6 py-12">

        <div className="absolute top-1/3 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Campus Pulse</span>
          </div>

          <TiltCard>
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-slate-500 text-sm">Sign in to your account</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className={`px-4 py-3 rounded-2xl text-sm mb-5 border ${error.includes('approval')
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                    : 'bg-red-500/10 border-red-500/25 text-red-400'
                  }`} role="alert">{error}
              </motion.div>
            )}

            {/* Google */}
            <div className="mb-5">
              <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 hover:ring-indigo-500/40 transition-all duration-300">
                <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signin_with" />
              </div>
            </div>

            {/* Divider */}
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/8" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-slate-600 text-xs">or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-600" />
                  </div>
                  <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/8 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition"
                    placeholder="you@college.edu" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-600" />
                  </div>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required
                    value={formData.password} onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/8 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? undefined : '0 0 30px rgba(99,102,241,0.35)' }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full mt-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-semibold text-white text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                {loading ? 'Signing in…' : (<><span>Sign In</span><ArrowRight className="w-4 h-4" /></>)}
              </motion.button>
            </form>

            <div className="flex items-center justify-center gap-5 py-4 mt-2 border-t border-white/8">
              {['Secure', 'Private', 'Fast'].map(label => (
                <div key={label} className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  {label}
                </div>
              ))}
            </div>

            <p className="mt-2 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Sign up</Link>
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

      {/* ══════════════════════════════════════════════════════════════════
          RIGHT PANEL — branding (mirrored vs signup's left-side branding)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative z-10 flex-col justify-between p-12 overflow-hidden">

        {/* Floating orbs */}
        {[
          { size: 320, top: '-8%', left: '40%', color: 'rgba(99,102,241,0.13)', delay: 0 },
          { size: 220, top: '62%', left: '2%', color: 'rgba(139,92,246,0.10)', delay: 1 },
          { size: 180, top: '75%', left: '60%', color: 'rgba(168,85,247,0.08)', delay: 0.6 },
        ].map((orb, i) => (
          <motion.div key={i} className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.size, height: orb.size, top: orb.top, left: orb.left,
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`, filter: 'blur(40px)'
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 6, repeat: Infinity, delay: orb.delay, ease: 'easeInOut' }} />
        ))}

        {/* Logo */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }} className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: -18, scale: 1.1 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-xl font-bold text-white tracking-tight">Campus Pulse</span>
        </motion.div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}>
          <motion.div animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 2.5, repeat: Infinity }}
            className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Welcome back
          </motion.div>

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
            {FEATURES.map((f, i) => (
              <MagneticCard key={i} {...f} delay={0.4 + i * 0.15}
                mouseXRef={mouseXRef} mouseYRef={mouseYRef} />
            ))}
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="flex items-center gap-4 p-4 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm max-w-sm">
          <div className="flex -space-x-2">
            {['#6366f1', '#8b5cf6', '#ec4899'].map((c, i) => (
              <motion.div key={i} whileHover={{ y: -4, scale: 1.2, zIndex: 10 }}
                className="w-8 h-8 rounded-full border-2 border-[#06060c] flex items-center justify-center text-xs font-bold text-white relative"
                style={{ background: c }}>
                {['A', 'B', 'C'][i]}
              </motion.div>
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