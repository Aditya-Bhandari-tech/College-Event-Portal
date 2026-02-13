// // src/pages/Login.jsx
// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { Eye, EyeOff } from 'lucide-react';
// import axios from 'axios';

// const Login = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     setError(''); // Clear error when user types
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     // Basic validation
//     if (!formData.email || !formData.password) {
//       setError('Please enter email and password');
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await axios.post(
//         'http://localhost:5000/api/auth/login',
//         formData
//       );

//       // Store token in localStorage
//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));

//       // Navigate to dashboard
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed');
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
//               Welcome Back
//             </h2>
//             <p className="mt-2 text-slate-400">
//               Sign in to access Campus Pulse
//             </p>
//           </div>

//           {/* Form Card */}
//           <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Error Message */}
//               {/* Error Message */}
//               {error && (
//                 <div
//                   className={`${error.includes("approval")
//                       ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
//                       : "bg-red-500/10 border-red-500/50 text-red-400"
//                     } px-4 py-3 border rounded-xl text-sm backdrop-blur-sm`}
//                 >
//                   {error}
//                 </div>
//               )}

//               {/* Email */}
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
//                   Email Address
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
//                   Password
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

//               {/* Forgot Password Link */}
//               <div className="text-right">
//                 <Link
//                   to="/forgot-password"
//                   className="text-sm text-indigo-400 hover:text-indigo-300 transition"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full rounded-xl border border-indigo-400/40 bg-indigo-500/20 px-8 py-3 font-medium backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.4)] transition hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
//               >
//                 {loading ? 'Signing in...' : 'Sign In'}
//               </button>
//             </form>

//             {/* Sign Up Link */}
//             <p className="mt-6 text-center text-sm text-slate-400">
//               Don't have an account?{' '}
//               <Link
//                 to="/signup"
//                 className="font-medium text-indigo-400 hover:text-indigo-300 transition"
//               >
//                 Sign up
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

// export default Login;
// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleAuthButton from './GoogleAuthButton';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        formData
      );

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');

      // Decode the JWT credential to get user info
      const decoded = jwtDecode(credentialResponse.credential);

      // Send to backend
      const response = await axios.post(
        'http://localhost:5000/api/auth/google',
        {
          credential: credentialResponse.credential,
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub,
        }
      );

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else if (response.data.needsProfile) {
        // User exists but needs to complete profile (shouldn't happen in login, but handle it)
        setError('Please complete your signup first');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login Error
  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
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
                Welcome Back
              </h2>
              <p className="mt-2 text-slate-400">
                Sign in to access Campus Pulse
              </p>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
              {/* Error Message */}
              {error && (
                <div
                  className={`${
                    error.includes('approval')
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                      : 'bg-red-500/10 border-red-500/50 text-red-400'
                  } px-4 py-3 border rounded-xl text-sm backdrop-blur-sm mb-6`}
                >
                  {error}
                </div>
              )}

              {/* Google Sign In Button */}
              <div className="mb-6">
                <GoogleAuthButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signin_with"
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
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
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
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

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl border border-indigo-400/40 bg-indigo-500/20 px-8 py-3 font-medium backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.4)] transition hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Sign Up Link */}
              <p className="mt-6 text-center text-sm text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-indigo-400 hover:text-indigo-300 transition"
                >
                  Sign up
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

export default Login;