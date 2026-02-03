// src/pages/Welcome.jsx
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Zap } from "lucide-react";

function Welcome() {
  const navigate = useNavigate();
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-radial from-slate-900 via-slate-950 to-black text-white">
      {/* Floating gradients */}
      <div className="absolute inset-0 animate-float">
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      {/* Content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Hero Section */}
        <div className="max-w-4xl mb-16">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Campus Pulse
            </span>
            <span className="text-white">.</span>
          </h1>

          <p className="text-2xl md:text-3xl font-semibold text-slate-300 mb-4">
            The heartbeat of campus life
          </p>

          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Your central hub for events, announcements, and everything happening
            on campus. Stay connected. Stay informed. Stay pulsed.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 mb-20">
          <button
            onClick={() => navigate("/signup")}
            className="group relative px-8 py-3.5 bg-cyan-400 text-slate-900 font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Sign Up
            </span>
          </button>

          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3.5 border-2 border-slate-600 text-white font-semibold rounded-xl transition-all duration-300 hover:border-cyan-400/50 hover:bg-slate-800/50 hover:scale-105"
          >
            Login
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
          {/* Events Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-300 hover:border-cyan-500/50 hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Calendar className="w-7 h-7 text-cyan-400" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Events</h3>
              <p className="text-slate-400 text-sm">
                Discover campus activities
              </p>
            </div>
          </div>

          {/* Connect Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-300 hover:border-pink-500/50 hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/0 group-hover:from-pink-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <Users className="w-7 h-7 text-pink-400" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Connect</h3>
              <p className="text-slate-400 text-sm">
                Meet fellow students
              </p>
            </div>
          </div>

          {/* Real-time Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-300 hover:border-purple-500/50 hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Zap className="w-7 h-7 text-purple-400" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Real-time</h3>
              <p className="text-slate-400 text-sm">
                Instant updates
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Welcome;