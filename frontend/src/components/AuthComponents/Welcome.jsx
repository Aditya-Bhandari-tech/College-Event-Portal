// src/pages/Welcome.jsx
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Zap, Bell, CheckCircle, ArrowRight, Megaphone, UserCheck, Shield } from "lucide-react";

function Welcome() {
  const navigate = useNavigate();
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
      {/* Floating gradients */}
      <div className="absolute inset-0 animate-float">
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute top-2/3 left-1/2 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      {/* Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center pt-10 md:pt-0 lg:pt-20

">
          <div className="max-w-4xl mb-6">
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent ">
                Campus Pulse
              </span>
              <span className="text-white">.</span>
            </h1>

            <p className="text-2xl md:text-3xl font-semibold text-slate-300 mb-4">
              The heartbeat of campus life
            </p>

            <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
              Your central hub for events, announcements, and everything happening
              on campus. Stay connected. Stay informed. Stay pulsed.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400 mb-12">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span>For Students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span>For Faculty</span>
              </div>
              
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 mb-20">
            <button
              onClick={() => navigate("/signup")}
              className="group relative px-8 py-3.5 bg-cyan-400 text-slate-900 font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Get Started
              </span>
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3.5 border-2 border-slate-600 text-white font-semibold rounded-xl transition-all duration-300 hover:border-cyan-400/50 hover:bg-slate-800/50 hover:scale-105"
            >
              Login
            </button>
          </div>

          {/* Quick Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-300 hover:border-cyan-500/50 hover:bg-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:to-transparent transition-all duration-300" />
              
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <Calendar className="w-7 h-7 text-cyan-400" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Events</h3>
                <p className="text-slate-400 text-sm">
                  Discover and register for campus activities
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-300 hover:border-pink-500/50 hover:bg-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/0 group-hover:from-pink-500/10 group-hover:to-transparent transition-all duration-300" />
              
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <Megaphone className="w-7 h-7 text-pink-400" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Announcements</h3>
                <p className="text-slate-400 text-sm">
                  Stay updated with campus news
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-300 hover:border-purple-500/50 hover:bg-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-300" />
              
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Bell className="w-7 h-7 text-purple-400" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Real-time</h3>
                <p className="text-slate-400 text-sm">
                  Instant notifications
                </p>
              </div>
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
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
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
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Welcome;