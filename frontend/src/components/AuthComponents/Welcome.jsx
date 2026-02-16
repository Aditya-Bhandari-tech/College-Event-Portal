// src/pages/Welcome.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Calendar, Users, Zap, Bell, CheckCircle, ArrowRight, Megaphone, UserCheck, Shield } from "lucide-react";
import LoadingAnimation from "../LoadingAnimation";

function Welcome() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [visibleSections, setVisibleSections] = useState(new Set());

  const handleAnimationComplete = () => {
    setIsLoading(false);
  };

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach(section => observer.observe(section));

    return () => sections.forEach(section => observer.unobserve(section));
  }, [isLoading]);

  return (
    <>
      {/* Loading Animation - fades out while content fades in */}
      {isLoading && <LoadingAnimation onComplete={handleAnimationComplete} />}

      {/* Main Content - always rendered, zooms in as loading disperses */}
      <div
        className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white transition-all duration-1000"
        style={{
          opacity: !isLoading ? 1 : 0,
          transform: !isLoading ? 'scale(1)' : 'scale(0.95)',
          filter: !isLoading ? 'blur(0px)' : 'blur(10px)'
        }}
      >
        {/* Floating gradients with parallax */}
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
          <div
            className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl transition-transform duration-700"
            style={{
              transform: `translate(${(mousePos.x - window.innerWidth / 2) * 0.02}px, ${(mousePos.y - window.innerHeight / 2) * 0.02}px)`
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl transition-transform duration-700"
            style={{
              transform: `translate(${(mousePos.x - window.innerWidth / 2) * -0.015}px, ${(mousePos.y - window.innerHeight / 2) * -0.015}px)`
            }}
          />
          <div
            className="absolute top-2/3 left-1/2 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl transition-transform duration-700"
            style={{
              transform: `translate(${(mousePos.x - window.innerWidth / 2) * 0.01}px, ${(mousePos.y - window.innerHeight / 2) * 0.01}px)`
            }}
          />
        </div>

        {/* Content */}
        <main className="relative z-10">
          {/* Hero Section */}
          <section
            id="hero"
            data-animate
            className="flex min-h-screen flex-col items-center justify-center px-6 text-center pt-10 md:pt-0 lg:pt-20"
          >
            <div className="max-w-4xl mb-6">
              {/* Animated Title with Gradient Shift */}
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
                <span
                  className="inline-block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient-pan"
                  style={{
                    animation: !isLoading ? 'slideInScale 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, gradientPan 8s ease infinite' : 'none',
                    opacity: !isLoading ? 1 : 0,
                    transform: !isLoading ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.8)',
                    transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  Campus Pulse
                </span>
                <span
                  className="text-white inline-block"
                  style={{
                    animation: !isLoading ? 'bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s forwards' : 'none',
                    opacity: !isLoading ? 1 : 0,
                    transitionDelay: '0.8s'
                  }}
                >.</span>
              </h1>

              {/* Tagline with Wave Effect */}
              <p className="text-2xl md:text-3xl font-semibold text-slate-300 mb-4">
                {!isLoading && "The heartbeat of campus life".split('').map((char, i) => (
                  <span
                    key={i}
                    className="inline-block"
                    style={{
                      animation: `wave 0.5s ease ${i * 0.03}s forwards`,
                      opacity: 0,
                      transform: 'translateY(20px)'
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </p>

              {/* Description with Fade Slide */}
              <p
                className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8"
                style={{
                  opacity: !isLoading ? 1 : 0,
                  transform: !isLoading ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s'
                }}
              >
                Your central hub for events, announcements, and everything happening
                on campus. Stay connected. Stay informed. Stay pulsed.
              </p>

              {/* Animated badges */}
              <div
                className="flex flex-wrap justify-center gap-4 text-sm text-slate-400 mb-12"
                style={{
                  opacity: !isLoading ? 1 : 0,
                  transform: !isLoading ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
                  transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s'
                }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all duration-300 hover:scale-110">
                  <CheckCircle className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>For Students</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all duration-300 hover:scale-110">
                  <CheckCircle className="w-4 h-4 text-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span>For Faculty</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons with Spring Entrance */}
            <div
              className="flex gap-4 mb-20"
              style={{
                opacity: !isLoading ? 1 : 0,
                transform: !isLoading ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.8)',
                transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1) 1s'
              }}
            >
              <button
                onClick={() => navigate("/signup")}
                className="group relative px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-[0_0_40px_rgba(34,211,238,0.8)] active:scale-95"
              >
                {/* Ripple effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  Get Started
                </span>
              </button>

              <button
                onClick={() => navigate("/login")}
                className="group relative px-8 py-3.5 border-2 border-slate-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <span className="relative z-10 group-hover:text-cyan-300 transition-colors duration-300">Login</span>
              </button>
            </div>

            {/* Quick Features with 3D Effect */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
              {/* Events Card */}
              <div
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-500 hover:border-cyan-500/50 hover:bg-white/10 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(34,211,238,0.3)] cursor-pointer"
                style={{
                  transform: visibleSections.has('hero') ? 'perspective(1000px) rotateX(0deg) rotateY(0deg)' : 'perspective(1000px) rotateX(10deg) rotateY(5deg)',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/20 group-hover:to-transparent transition-all duration-500" />

                {/* 3D shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                </div>

                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Calendar className="w-7 h-7 text-cyan-400 group-hover:scale-125 transition-transform duration-500" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300">Events</h3>
                  <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">
                    Discover and register for campus activities
                  </p>
                </div>

                {/* Bottom glow */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Announcements Card */}
              <div
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-500 hover:border-pink-500/50 hover:bg-white/10 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(236,72,153,0.3)] cursor-pointer"
                style={{
                  transform: visibleSections.has('hero') ? 'perspective(1000px) rotateX(0deg) rotateY(0deg)' : 'perspective(1000px) rotateX(10deg) rotateY(-5deg)',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionDelay: '0.1s'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/0 group-hover:from-pink-500/20 group-hover:to-transparent transition-all duration-500" />

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                </div>

                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-pink-500/10 border border-pink-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Megaphone className="w-7 h-7 text-pink-400 group-hover:scale-125 transition-transform duration-500" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors duration-300">Announcements</h3>
                  <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">
                    Stay updated with campus news
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Real-time Card */}
              <div
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-500 hover:border-purple-500/50 hover:bg-white/10 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(168,85,247,0.3)] cursor-pointer"
                style={{
                  transform: visibleSections.has('hero') ? 'perspective(1000px) rotateX(0deg) rotateY(0deg)' : 'perspective(1000px) rotateX(10deg) rotateY(5deg)',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionDelay: '0.2s'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/20 group-hover:to-transparent transition-all duration-500" />

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                </div>

                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Bell className="w-7 h-7 text-purple-400 group-hover:scale-125 group-hover:animate-wiggle transition-transform duration-500" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">Real-time</h3>
                  <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">
                    Instant notifications
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex items-start justify-center p-2">
                <div className="w-1 h-2 bg-cyan-400 rounded-full" />
              </div>
            </div>
          </section>

          {/* Main Features Section */}
          <section id="features" data-animate className="py-24 px-6">
            <div className="max-w-6xl mx-auto" style={{
              opacity: visibleSections.has('features') ? 1 : 0,
              transform: visibleSections.has('features') ? 'translateY(0)' : 'translateY(50px)',
              transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                    Everything You Need
                  </span>
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  A comprehensive platform designed to streamline campus communication and engagement
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Event Management */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                  <div className="relative border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3">Event Management & Registration</h3>
                        <p className="text-slate-400 mb-4">
                          Discover upcoming campus events, workshops, seminars, and activities. Register with a single click and manage your event calendar effortlessly.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-cyan-400" />
                            <span>Browse events by category and date</span>
                          </li>
                          <li className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-cyan-400" />
                            <span>Quick RSVP and registration</span>
                          </li>
                          <li className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-cyan-400" />
                            <span>Event reminders and updates</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Announcements */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                  <div className="relative border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-8 hover:border-pink-500/50 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                        <Megaphone className="w-6 h-6 text-pink-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3">Announcements & News Feed</h3>
                        <p className="text-slate-400 mb-4">
                          Never miss important campus updates. Get official announcements, academic notices, and community news in one centralized feed.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-pink-400" />
                            <span>Department-specific announcements</span>
                          </li>
                          <li className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-pink-400" />
                            <span>Priority alerts for urgent updates</span>
                          </li>
                          <li className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-pink-400" />
                            <span>Archive for past announcements</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-24 px-6 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                    How It Works
                  </span>
                </h2>
                <p className="text-slate-400 text-lg">
                  Get started in three simple steps
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="relative text-center">
                  <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-2xl font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Create Your Account</h3>
                  <p className="text-slate-400">
                    Sign up with your campus credentials. Choose your role - student, faculty, or admin staff.
                  </p>
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                </div>

                {/* Step 2 */}
                <div className="relative text-center">
                  <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white text-2xl font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Personalize Your Feed</h3>
                  <p className="text-slate-400">
                    Select your interests and departments to receive relevant announcements and event recommendations.
                  </p>
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent" />
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-600 text-white text-2xl font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Stay Connected</h3>
                  <p className="text-slate-400">
                    Get real-time notifications, RSVP to events, and stay updated with everything happening on campus.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Campus Pulse */}
          <section className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                    Why Campus Pulse?
                  </span>
                </h2>
                <p className="text-slate-400 text-lg">
                  Built for the modern campus community
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Real-time Notifications */}
                <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Bell className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Real-time Notifications</h3>
                      <p className="text-slate-400">
                        Stay instantly informed with push notifications for important announcements, event updates, and last-minute changes. Never miss what matters.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Easy Discovery */}
                <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Easy Event Discovery & RSVP</h3>
                      <p className="text-slate-400">
                        Effortlessly browse events, filter by your interests, and register with one click. Manage all your RSVPs in a single dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* For Everyone Section */}
          <section className="py-24 px-6 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                    Built For Everyone
                  </span>
                </h2>
                <p className="text-slate-400 text-lg">
                  Tailored experiences for every member of the campus community
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Students */}
                <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-8 text-center hover:border-cyan-500/50 transition-all duration-300">
                  <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                    <Users className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Students</h3>
                  <p className="text-slate-400 text-sm">
                    Discover events, connect with peers, stay updated with announcements, and make the most of your campus life.
                  </p>
                </div>

                {/* Faculty */}
                <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-8 text-center hover:border-purple-500/50 transition-all duration-300">
                  <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20">
                    <UserCheck className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Faculty</h3>
                  <p className="text-slate-400 text-sm">
                    Share announcements, organize academic events, and communicate effectively with students and colleagues.
                  </p>
                </div>

                {/* Admin Staff */}
                <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-8 text-center hover:border-pink-500/50 transition-all duration-300">
                  <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/20">
                    <Shield className="w-8 h-8 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Admin Staff</h3>
                  <p className="text-slate-400 text-sm">
                    Manage campus-wide communications, publish official announcements, and oversee event coordination seamlessly.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-24 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                  Ready to Get Started?
                </span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of students, faculty, and staff already using Campus Pulse to stay connected with their campus community.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/signup")}
                  className="group relative px-8 py-3.5 bg-cyan-400 text-slate-900 font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Join Campus Pulse
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-white/10 py-8 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold text-lg">Campus Pulse</span>
                  <span>© 2024 All rights reserved</span>
                </div>
                <div className="flex gap-6">
                  <button className="hover:text-cyan-400 transition-colors">About</button>
                  <button className="hover:text-cyan-400 transition-colors">Contact</button>
                  <button className="hover:text-cyan-400 transition-colors">Privacy</button>
                </div>
              </div>
            </div>
          </footer>
        </main>

        <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>
      </div>
    </>
  );
}

export default Welcome;