
import { useState } from 'react';
import { X } from 'lucide-react';

const RoleSelectionModal = ({ isOpen, onClose, onSubmit, userName }) => {
  const [formData, setFormData] = useState({
    role: '',
    branch: '',
    phone: '',
  });
  const [error, setError] = useState('');

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
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.role || !formData.branch) {
      setError('Please select both role and branch');
      return;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be 10 digits');
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-2">
            Complete Your Profile
          </h3>
          <p className="text-slate-400 text-sm">
            Hi {userName}! Please provide additional information to complete your registration.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

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
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition"
            >
              <option value="" className="bg-slate-900">Select your role</option>
              <option value="student" className="bg-slate-900">Student</option>
              <option value="faculty" className="bg-slate-900">Faculty</option>
            </select>
          </div>

          {/* Branch */}
          {formData.role && (
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition"
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

          {/* Phone (Optional) */}
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
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition"
              placeholder="+91 1234567890"
            />
          </div>

          {/* Faculty Notice */}
          {formData.role === 'faculty' && (
            <div className="bg-amber-500/10 border border-amber-500/50 text-amber-400 px-4 py-3 rounded-xl text-sm">
              <strong>Note:</strong> Faculty accounts require admin approval before you can access the platform.
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-8 py-3 font-medium backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.4)] transition hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(34,211,238,0.6)]"
          >
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleSelectionModal;