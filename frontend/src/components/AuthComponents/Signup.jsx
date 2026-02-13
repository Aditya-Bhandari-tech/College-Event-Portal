// // src/pages/Signup.jsx
// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react";
// import axiosInstance from "../../api/axios";

// const Signup = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     phone: "",
//     branch: "",
//   });

//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const branches = [
//     "Information Technology",
//     "Computer Science",
//     "Automobile Engineering",
//     "Electrical Engineering",
//     "Mechanical Engineering",
//     "Electronics and Telecommunication Engineering",
//     "Civil Engineering",
//   ];

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccessMessage("");

//     // Frontend validation
//     if (!formData.name || !formData.email || !formData.password || !formData.role || !formData.branch) {
//       setError("Please fill in all required fields");
//       setLoading(false);
//       return;
//     }

//     if (formData.password.length < 6) {
//       setError("Password must be at least 6 characters");
//       setLoading(false);
//       return;
//     }

//     if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
//       setError("Phone number must be 10 digits");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await axiosInstance.post("/auth/register", formData);

//       if (response.data.token) {
//         // Token exists -> Student / Auto-login
//         localStorage.setItem("token", response.data.token);
//         localStorage.setItem("user", JSON.stringify(response.data.user));
//         navigate("/dashboard");
//       } else {
//         // No token -> Faculty / Pending Approval
//         setSuccessMessage("Your request has been sent to admin for approval.");
//         setTimeout(() => {
//           navigate("/login");
//         }, 3000);
//       }

//     } catch (err) {
//       setError(err.response?.data?.message || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white">
//       {/* Floating gradients */}
//       <div className="absolute inset-0 animate-float">
//         <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
//         <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
//       </div>

//       {/* Content */}
//       <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
//         <div className="w-full max-w-md">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
//               Join Campus Pulse
//             </h2>
//             <p className="mt-2 text-slate-400">
//               Create your account to get started
//             </p>
//           </div>

//           {/* Form Card */}
//           <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
//             <form onSubmit={handleSubmit} className="space-y-5">
//               {/* Success Message */}
//               {successMessage && (
//                 <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
//                   {successMessage}
//                 </div>
//               )}

//               {/* Error Message */}
//               {error && (
//                 <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
//                   {error}
//                 </div>
//               )}

//               {/* Name */}
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
//                   Full Name *
//                 </label>
//                 <input
//                   id="name"
//                   name="name"
//                   type="text"
//                   required
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition backdrop-blur-sm"
//                   placeholder="John Doe"
//                 />
//               </div>

//               {/* Email */}
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
//                   Email Address *
//                 </label>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition backdrop-blur-sm"
//                   placeholder="john@example.com"
//                 />
//               </div>

//               {/* Password */}
//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
//                   Password *
//                 </label>
//                 <div className="relative">
//                   <input
//                     id="password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     required
//                     value={formData.password}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition backdrop-blur-sm"
//                     placeholder="••••••••"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="w-5 h-5" />
//                     ) : (
//                       <Eye className="w-5 h-5" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* Phone */}
//               <div>
//                 <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
//                   Phone Number (Optional)
//                 </label>
//                 <input
//                   id="phone"
//                   name="phone"
//                   type="tel"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition backdrop-blur-sm"
//                   placeholder="+91 1234567890"
//                 />
//               </div>

//               {/* Role */}
//               <div>
//                 <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
//                   Role *
//                 </label>
//                 <select
//                   id="role"
//                   name="role"
//                   required
//                   value={formData.role}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition backdrop-blur-sm"
//                 >
//                   <option value="" className="bg-slate-900">Select your role</option>
//                   <option value="student" className="bg-slate-900">Student</option>
//                   <option value="faculty" className="bg-slate-900">Faculty</option>
//                 </select>
//               </div>

//               {/* Branch - Show for both Student and Faculty */}
//               {(formData.role === "student" || formData.role === "faculty") && (
//                 <div>
//                   <label htmlFor="branch" className="block text-sm font-medium text-slate-300 mb-2">
//                     Branch *
//                   </label>
//                   <select
//                     id="branch"
//                     name="branch"
//                     required
//                     value={formData.branch}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition backdrop-blur-sm"
//                   >
//                     <option value="" className="bg-slate-900">Select your branch</option>
//                     {branches.map((branch) => (
//                       <option key={branch} value={branch} className="bg-slate-900">
//                         {branch}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full rounded-xl border border-indigo-400/40 bg-indigo-500/20 px-8 py-3 font-medium backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.4)] transition hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
//               >
//                 {loading ? "Creating Account..." : "Sign Up"}
//               </button>
//             </form>

//             {/* Login Link */}
//             <p className="mt-6 text-center text-sm text-slate-400">
//               Already have an account?{" "}
//               <Link
//                 to="/login"
//                 className="font-medium text-indigo-400 hover:text-indigo-300 transition"
//               >
//                 Sign in
//               </Link>
//             </p>
//           </div>

//           {/* Back to Home */}
//           <div className="mt-6 text-center">
//             <Link
//               to="/"
//               className="text-sm text-slate-400 hover:text-white transition"
//             >
//               ← Back to home
//             </Link>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Signup;
// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axiosInstance from "../../api/axios";
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleAuthButton from './GoogleAuthButton';
import RoleSelectionModal from './RoleSelectionModal';
import { jwtDecode } from 'jwt-decode';

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    branch: "",
    role: "",
  });

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

    // Frontend validation
    if (!formData.name || !formData.email || !formData.password || !formData.role || !formData.branch) {
      setError("Please fill in all required fields");
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
        // Token exists -> Student / Auto-login
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/dashboard");
      } else {
        // No token -> Faculty / Pending Approval
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

  // Handle Google Sign Up Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');

      // Decode the JWT credential to get user info
      const decoded = jwtDecode(credentialResponse.credential);

      // Check if user already exists
      const checkResponse = await axiosInstance.post('/auth/google/check', {
        email: decoded.email,
      });

      if (checkResponse.data.exists) {
        // User exists, try to log in
        const loginResponse = await axiosInstance.post('/auth/google', {
          credential: credentialResponse.credential,
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub,
        });

        if (loginResponse.data.token) {
          localStorage.setItem('token', loginResponse.data.token);
          localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
          navigate('/dashboard');
        }
      } else {
        // New user - show role selection modal
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

  // Handle Google Sign Up Error
  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
  };

  // Handle Role Selection Modal Submit
  const handleRoleSubmit = async (roleData) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      // Combine Google data with role/branch data
      const signupData = {
        ...googleUserData,
        role: roleData.role,
        branch: roleData.branch,
        phone: roleData.phone,
        isGoogleAuth: true,
      };

      const response = await axiosInstance.post('/auth/google', signupData);

      if (response.data.token) {
        // Student - auto login
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setShowRoleModal(false);
        navigate('/dashboard');
      } else {
        // Faculty - pending approval
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

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        {/* Floating gradients */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-400/25 blur-3xl animate-float-delayed" />
        </div>

        {/* Content */}
        <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Join Campus Pulse
              </h2>
              <p className="mt-2 text-slate-400">
                Create your account to get started
              </p>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm mb-5">
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm mb-5">
                  {error}
                </div>
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
                  <span className="px-4 bg-slate-900/50 text-slate-400">Or continue with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition backdrop-blur-sm"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition backdrop-blur-sm"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition backdrop-blur-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
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
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition backdrop-blur-sm"
                    placeholder="+91 1234567890"
                  />
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition backdrop-blur-sm"
                  >
                    <option value="" className="bg-slate-900">Select your role</option>
                    <option value="student" className="bg-slate-900">Student</option>
                    <option value="faculty" className="bg-slate-900">Faculty</option>
                  </select>
                </div>

                {/* Branch - Show for both Student and Faculty */}
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition backdrop-blur-sm"
                    >
                      <option value="" className="bg-slate-900">Select your branch</option>
                      {branches.map((branch) => (
                        <option key={branch} value={branch} className="bg-slate-900">
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl border border-indigo-400/40 bg-indigo-500/20 px-8 py-3 font-medium backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.4)] transition hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>

              {/* Login Link */}
              <p className="mt-6 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-indigo-400 hover:text-indigo-300 transition"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-slate-400 hover:text-white transition"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </main>

        {/* Role Selection Modal */}
        <RoleSelectionModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          onSubmit={handleRoleSubmit}
          userName={googleUserData?.name || ''}
        />

        {/* Animation Styles */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.05); }
            66% { transform: translate(-20px, 20px) scale(0.95); }
          }
          
          @keyframes float-delayed {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-25px, 25px) scale(1.08); }
            66% { transform: translate(25px, -20px) scale(0.92); }
          }
          
          .animate-float {
            animation: float 25s ease-in-out infinite;
          }
          
          .animate-float-delayed {
            animation: float-delayed 30s ease-in-out infinite;
          }
        `}</style>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Signup;