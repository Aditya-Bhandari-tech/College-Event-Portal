// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Phone, ArrowRight } from "lucide-react";
import axiosInstance from "../../api/axios";
import GoogleAuthButton from './GoogleAuthButton';
import RoleSelectionModal from './RoleSelectionModal';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    branch: "",
    role: "",
    year: "",
  });

  const years = ["First Year", "Second Year", "Third Year"];

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Google Auth States
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);

  const branches = [
    "Information Technology",
    "Computer Science",
    "Automobile Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Electronics and Telecommunication Engineering",
    "Civil Engineering",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!formData.name || !formData.email || !formData.password || !formData.role || !formData.branch) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.role === "student" && !formData.year) {
      setError("Please select your year");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must be 10 digits");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/register", formData);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        const role = response.data.user.role;
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "faculty") {
          navigate("/faculty");
        } else {
          navigate("/student");
        }
      } else {
        setSuccessMessage("Your request has been sent to admin for approval.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');

      const decoded = jwtDecode(credentialResponse.credential);

      const checkResponse = await axiosInstance.post('/auth/google/check', {
        email: decoded.email,
      });

      if (checkResponse.data.exists) {
        const loginResponse = await axiosInstance.post('/auth/google', {
          credential: credentialResponse.credential,
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub,
        });

        if (loginResponse.data.token) {
          localStorage.setItem('token', loginResponse.data.token);
          localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
          const role = loginResponse.data.user.role;
          if (role === "admin") {
            navigate("/admin");
          } else if (role === "faculty") {
            navigate("/faculty");
          } else {
            navigate("/student");
          }
        }
      } else {
        setGoogleUserData({
          credential: credentialResponse.credential,
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub,
        });
        setShowRoleModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
  };

  const handleRoleSubmit = async (roleData) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const signupData = {
        ...googleUserData,
        role: roleData.role,
        branch: roleData.branch,
        phone: roleData.phone,
        year: roleData.year,
        isGoogleAuth: true,
      };

      const response = await axiosInstance.post('/auth/google', signupData);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setShowRoleModal(false);
        const role = response.data.user.role;
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "faculty") {
          navigate("/faculty");
        } else {
          navigate("/student");
        }
      } else {
        setShowRoleModal(false);
        setSuccessMessage('Your request has been sent to admin for approval.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] text-white">
      {/* Subtle mesh gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.08),transparent_50%)]" />
      </div>

      {/* Content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
              Join Campus Pulse
            </h2>
            <p className="text-slate-400">
              Create your account to get started
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-white/10 bg-[#1a1a24] p-5 sm:p-8 shadow-2xl">
            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm mb-5"
                role="status"
              >
                {successMessage}
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-5"
                role="alert"
              >
                {error}
              </motion.div>
            )}

            {/* Google Sign Up Button */}
            <div className="mb-6">
              <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signup_with"
              />
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#1a1a24] text-slate-400">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition"
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition"
                >
                  <option value="" className="bg-[#0a0a0f]">Select your role</option>
                  <option value="student" className="bg-[#0a0a0f]">Student</option>
                  <option value="faculty" className="bg-[#0a0a0f]">Faculty</option>
                </select>
              </div>

              {/* Branch */}
              {(formData.role === "student" || formData.role === "faculty") && (
                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-slate-300 mb-2">
                    Branch *
                  </label>
                  <select
                    id="branch"
                    name="branch"
                    required
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition"
                  >
                    <option value="" className="bg-[#0a0a0f]">Select your branch</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch} className="bg-[#0a0a0f]">
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Year (Students Only) */}
              {formData.role === "student" && (
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-slate-300 mb-2">
                    Year *
                  </label>
                  <select
                    id="year"
                    name="year"
                    required
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition"
                  >
                    <option value="" className="bg-[#0a0a0f]">Select your year</option>
                    {years.map((year) => (
                      <option key={year} value={year} className="bg-[#0a0a0f]">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Creating Account..." : (
                  <>
                    Sign Up
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-400 hover:text-blue-300 transition"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-slate-400 hover:text-white transition inline-flex items-center gap-2"
            >
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSubmit={handleRoleSubmit}
        userName={googleUserData?.name || ''}
      />
    </div>
  );
};

export default Signup;