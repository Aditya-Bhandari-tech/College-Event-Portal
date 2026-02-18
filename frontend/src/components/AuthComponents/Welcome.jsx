// src/pages/Welcome.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Calendar, Users, Zap, Bell, CheckCircle, ArrowRight, Megaphone, UserCheck, Shield } from "lucide-react";
import LoadingAnimation from "../LoadingAnimation";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";

function Welcome() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleAnimationComplete = () => {
    setIsLoading(false);
  };

  // Mouse tracking for spotlight effect
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Animation Variants
  const revealContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const revealItem = {
    hidden: { y: "100%", opacity: 0, rotateX: 40 },
    visible: {
      y: "0%",
      opacity: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 12,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
    },
  };

  // Card Spotlight Effect
  const cardSpotlight = useMotionTemplate`radial-gradient(
    650px circle at ${mouseX}px ${mouseY}px,
    rgba(59, 130, 246, 0.1),
    transparent 80%
  )`;

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingAnimation onComplete={handleAnimationComplete} />}
      </AnimatePresence>

      {!isLoading && (
        <div
          className="relative min-h-screen overflow-hidden bg-[#0a0a0f] text-white selection:bg-blue-500/30"
          onMouseMove={handleMouseMove}
        >
          {/* Scroll Progress Bar */}
          <motion.div
            className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 origin-left z-50"
            style={{ scaleX }}
          />

          {/* Subtle mesh gradient background */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.08),transparent_50%)]" />
          </div>

          {/* Content */}
          <main className="relative z-10 font-sans group/main">
            {/* Global Spotlight Overlay */}
            <motion.div
              className="pointer-events-none fixed inset-0 z-30 transition duration-300 opacity-0 group-hover/main:opacity-100"
              style={{ background: cardSpotlight }}
            />

            {/* Hero Section */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={revealContainer}
              className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 text-center pt-16 md:pt-20"
            >
              <div className="max-w-4xl mb-8">
                {/* Animated Title */}
                <div className="overflow-hidden mb-6">
                  <motion.h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                    <span className="inline-block bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                      {"Campus Pulse".split("").map((char, index) => (
                        <motion.span
                          key={index}
                          variants={letterVariants}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
                          className="inline-block origin-bottom"
                        >
                          {char === " " ? "\u00A0" : char}
                        </motion.span>
                      ))}
                    </span>
                  </motion.h1>
                </div>

                {/* Tagline */}
                <div className="overflow-hidden mb-4">
                  <motion.p
                    variants={revealItem}
                    className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-300"
                  >
                    The heartbeat of campus life
                  </motion.p>
                </div>

                {/* Description */}
                <div className="overflow-hidden mb-8 md:mb-12 max-w-2xl mx-auto px-2">
                  <motion.p
                    variants={revealItem}
                    className="text-base md:text-lg text-slate-400 leading-relaxed"
                  >
                    Your central hub for events, announcements, and everything happening
                    on campus. Stay connected. Stay informed. Stay pulsed.
                  </motion.p>
                </div>
              </div>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12 md:mb-16 w-full sm:w-auto px-4 sm:px-0"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/signup")}
                  className="group relative px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl overflow-hidden shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-shadow w-full sm:w-auto"
                  aria-label="Get started - create your account"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    Get Started
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/login")}
                  className="group relative px-6 sm:px-8 py-3.5 sm:py-4 border border-white/10 text-white font-semibold rounded-xl overflow-hidden hover:border-white/20 hover:bg-white/5 transition-all backdrop-blur-sm w-full sm:w-auto"
                  aria-label="Login to your account"
                >
                  <span className="relative z-10">Login</span>
                </motion.button>
              </motion.div>

              {/* Quick Features Grid */}
              <motion.div
                variants={revealContainer}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-5xl w-full px-2 sm:px-4"
              >
                {/* Events Card */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -8, rotateX: 5, rotateY: 5 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a24] p-5 sm:p-8 hover:border-blue-500/30 cursor-pointer transition-all"
                >
                  <div className="relative z-10">
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Calendar className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Events</h3>
                    <p className="text-slate-400 text-sm">
                      Discover and register for campus activities
                    </p>
                  </div>
                </motion.div>

                {/* Announcements Card */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -8, rotateX: 5, rotateY: -5 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a24] p-5 sm:p-8 hover:border-purple-500/30 cursor-pointer transition-all"
                >
                  <div className="relative z-10">
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <Megaphone className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Announcements</h3>
                    <p className="text-slate-400 text-sm">
                      Stay updated with campus news
                    </p>
                  </div>
                </motion.div>

                {/* Real-time Card */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -8, rotateX: 5, rotateY: 5 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a24] p-5 sm:p-8 hover:border-blue-400/30 cursor-pointer transition-all"
                >
                  <div className="relative z-10">
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-400/10 border border-blue-400/20">
                      <Bell className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Real-time</h3>
                    <p className="text-slate-400 text-sm">
                      Instant notifications
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Scroll indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ delay: 2, duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
              >
                <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2 hover:border-blue-400/40 transition-colors">
                  <div className="w-1 h-2 bg-blue-400 rounded-full" />
                </div>
              </motion.div>
            </motion.section>

            {/* Main Features Section */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={revealContainer}
              className="py-12 md:py-24 px-4 sm:px-6 relative"
            >
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <div className="overflow-hidden mb-4">
                    <motion.h2 variants={revealItem} className="text-3xl sm:text-4xl md:text-5xl font-bold">
                      <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Everything You Need
                      </span>
                    </motion.h2>
                  </div>
                  <div className="overflow-hidden">
                    <motion.p variants={revealItem} className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
                      A comprehensive platform designed to streamline campus communication
                    </motion.p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Event Management */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="relative group rounded-2xl border border-white/10 bg-[#1a1a24] p-5 sm:p-8 hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Event Management</h3>
                        <p className="text-slate-400 mb-4">
                          Discover upcoming campus events, workshops, and seminars. Register with a single click.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span>Browse events by category</span>
                          </li>
                          <li className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span>Quick RSVP and registration</span>
                          </li>
                          <li className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span>Event reminders and updates</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>

                  {/* Announcements */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="relative group rounded-2xl border border-white/10 bg-[#1a1a24] p-5 sm:p-8 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Megaphone className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Announcements</h3>
                        <p className="text-slate-400 mb-4">
                          Never miss important campus updates. Get official announcements and news in one feed.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <span>Department-specific updates</span>
                          </li>
                          <li className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <span>Priority alerts for urgent news</span>
                          </li>
                          <li className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <span>Archive for past announcements</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* How It Works Section */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={revealContainer}
              className="py-12 md:py-24 px-4 sm:px-6 bg-[#111118] relative"
            >
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <div className="overflow-hidden mb-4">
                    <motion.h2 variants={revealItem} className="text-3xl sm:text-4xl md:text-5xl font-bold">
                      <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        How It Works
                      </span>
                    </motion.h2>
                  </div>
                  <div className="overflow-hidden">
                    <motion.p variants={revealItem} className="text-slate-400 text-base sm:text-lg">
                      Get started in three simple steps
                    </motion.p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  {/* Step 1 */}
                  <motion.div variants={revealItem} className="relative text-center group">
                    <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Create Your Account</h3>
                    <p className="text-slate-400">
                      Sign up with your campus credentials. Choose your role - student, faculty, or admin.
                    </p>
                  </motion.div>

                  {/* Step 2 */}
                  <motion.div variants={revealItem} className="relative text-center group">
                    <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white text-2xl font-bold shadow-lg shadow-purple-500/30">
                      2
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Personalize Your Feed</h3>
                    <p className="text-slate-400">
                      Select your interests and departments to receive relevant announcements.
                    </p>
                  </motion.div>

                  {/* Step 3 */}
                  <motion.div variants={revealItem} className="text-center group">
                    <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 text-white text-2xl font-bold shadow-lg shadow-purple-500/30">
                      3
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Stay Connected</h3>
                    <p className="text-slate-400">
                      Get real-time notifications, RSVP to events, and stay updated with campus life.
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* Why Choose Section */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={revealContainer}
              className="py-12 md:py-24 px-4 sm:px-6 relative"
            >
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <div className="overflow-hidden mb-4">
                    <motion.h2 variants={revealItem} className="text-3xl sm:text-4xl md:text-5xl font-bold">
                      <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Why Campus Pulse?
                      </span>
                    </motion.h2>
                  </div>
                  <div className="overflow-hidden">
                    <motion.p variants={revealItem} className="text-slate-400 text-base sm:text-lg">
                      Built for the modern campus community
                    </motion.p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-white/10 bg-[#1a1a24] p-5 sm:p-8 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Real-time Notifications</h3>
                        <p className="text-slate-400">
                          Stay instantly informed with push notifications for important updates and announcements.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-white/10 bg-[#1a1a24] p-5 sm:p-8 hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Easy Event Discovery</h3>
                        <p className="text-slate-400">
                          Effortlessly browse events, filter by your interests, and register with one click.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* For Everyone Section */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={revealContainer}
              className="py-12 md:py-24 px-4 sm:px-6 bg-[#111118] relative"
            >
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <div className="overflow-hidden mb-4">
                    <motion.h2 variants={revealItem} className="text-3xl sm:text-4xl md:text-5xl font-bold">
                      <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Built For Everyone
                      </span>
                    </motion.h2>
                  </div>
                  <div className="overflow-hidden">
                    <motion.p variants={revealItem} className="text-slate-400 text-base sm:text-lg">
                      Tailored experiences for every member of the campus
                    </motion.p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    className="rounded-2xl border border-white/10 bg-[#1a1a24] p-5 sm:p-8 text-center hover:border-blue-500/30 transition-all"
                  >
                    <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20">
                      <Users className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Students</h3>
                    <p className="text-slate-400 text-sm">
                      Discover events, connect with peers, stay updated, and make the most of campus life.
                    </p>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    className="rounded-2xl border border-white/10 bg-[#1a1a24] p-5 sm:p-8 text-center hover:border-purple-500/30 transition-all"
                  >
                    <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20">
                      <UserCheck className="w-7 h-7 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Faculty</h3>
                    <p className="text-slate-400 text-sm">
                      Share announcements, organize academic events, and communicate effectively.
                    </p>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    className="rounded-2xl border border-white/10 bg-[#1a1a24] p-5 sm:p-8 text-center hover:border-blue-400/30 transition-all"
                  >
                    <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-400/10 border border-blue-400/20">
                      <Shield className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Admin Staff</h3>
                    <p className="text-slate-400 text-sm">
                      Manage campus-wide communications and oversee event coordination seamlessly.
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* Final CTA Section */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={revealContainer}
              className="py-12 md:py-24 px-4 sm:px-6 relative"
            >
              <div className="max-w-4xl mx-auto text-center">
                <div className="overflow-hidden mb-6">
                  <motion.h2 variants={revealItem} className="text-3xl sm:text-4xl md:text-5xl font-bold">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                      Ready to Get Started?
                    </span>
                  </motion.h2>
                </div>
                <div className="overflow-hidden mb-8">
                  <motion.p variants={revealItem} className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
                    Join thousands of students, faculty, and staff using Campus Pulse to stay connected.
                  </motion.p>
                </div>

                <motion.div variants={itemVariants}>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/signup")}
                    className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-shadow"
                    aria-label="Join Campus Pulse"
                  >
                    <span className="flex items-center gap-2">
                      Join Campus Pulse
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-6 sm:py-8 px-4 sm:px-6 bg-[#111118] relative z-20" role="contentinfo">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold text-lg">Campus Pulse</span>
                    <span>© 2024 All rights reserved</span>
                  </div>
                  <div className="flex flex-wrap gap-4 sm:gap-6">
                    <button className="hover:text-blue-400 transition-colors">About</button>
                    <button className="hover:text-blue-400 transition-colors">Contact</button>
                    <button className="hover:text-blue-400 transition-colors">Privacy</button>
                  </div>
                </div>
              </div>
            </footer>
          </main>
        </div>
      )}
    </>
  );
}

export default Welcome;