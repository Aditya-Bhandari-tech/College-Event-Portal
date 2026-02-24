import React, { useState, useRef, useEffect } from 'react';
import {
  X, User, FileText, Camera, Edit2, Eye, EyeOff, Save,
  AlertCircle, CheckCircle, MapPin, BookOpen, Phone
} from 'lucide-react';
import axiosInstance from '../../api/axios';

/**
 * Reusable profile modal: view/edit name, password, profile picture; role-based read-only fields; logout with confirm.
 * Props: open, onClose, user, onUserUpdate(updatedUser), onLogout()
 */
const ProfileModal = ({ open, onClose, user, onUserUpdate, onLogout }) => {
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', newPassword: '', confirmPassword: '' });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const picInputRef = useRef(null);

  const role = user?.role;

  useEffect(() => {
    if (open && user) {
      setProfileForm({ name: user.name || '', newPassword: '', confirmPassword: '' });
      setProfileEditMode(false);
      setProfileError('');
      setProfileSuccess('');
      setProfilePicFile(null);
      setProfilePicPreview(null);
    }
  }, [open, user]);

  const handleClose = () => {
    setProfileEditMode(false);
    setProfileError('');
    setProfileSuccess('');
    setProfilePicFile(null);
    setProfilePicPreview(null);
    setShowLogoutConfirm(false);
    onClose();
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicFile(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      if (profileForm.newPassword || profileForm.confirmPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          setProfileError('Passwords do not match');
          setProfileLoading(false);
          return;
        }
        if (profileForm.newPassword.length < 6) {
          setProfileError('Password must be at least 6 characters');
          setProfileLoading(false);
          return;
        }
      }

      const payload = { name: profileForm.name.trim() };
      if (profileForm.newPassword) {
        payload.newPassword = profileForm.newPassword;
        payload.confirmPassword = profileForm.confirmPassword;
      }
      const profileRes = await axiosInstance.put('/users/profile', payload);
      let updatedUser = {
        ...user,
        name: profileRes.data?.data?.name || profileForm.name.trim(),
      };

      if (profilePicFile) {
        const formData = new FormData();
        formData.append('image', profilePicFile);
        const picRes = await axiosInstance.put('/users/profile-pic', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updatedUser.profilePic = picRes.data?.data;
      }

      onUserUpdate(updatedUser);
      setProfileForm(f => ({ ...f, newPassword: '', confirmPassword: '' }));
      setProfilePicFile(null);
      setProfilePicPreview(null);
      setProfileSuccess('Profile updated successfully!');
      setProfileEditMode(false);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to update profile. Please try again.';
      setProfileError(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogoutConfirm = () => {
    onLogout(); // trigger logout first (page reload via window.location.replace)
    setShowLogoutConfirm(false); // cleanup (won't matter if page reloads, but good practice)
  };

  const roleLabel = role === 'admin' ? 'Administration' : role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[150] backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fadeIn"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-label="Profile"
        >
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-6 pt-8 pb-16 text-center">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h2 className="text-white font-bold text-lg">
              {profileEditMode ? 'Edit Profile' : 'My Profile'}
            </h2>
          </div>

          <div className="flex justify-center -mt-12 mb-3 relative z-10">
            <div className="relative">
              {profilePicPreview || user?.profilePic?.url ? (
                <img
                  src={profilePicPreview || user.profilePic.url}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full object-cover shadow-xl ring-4 ring-white"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-3xl text-white shadow-xl ring-4 ring-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {profileEditMode && (
                <button
                  onClick={() => picInputRef.current?.click()}
                  className="absolute bottom-0.5 right-0.5 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-lg transition-colors border-2 border-white"
                  aria-label="Change photo"
                >
                  <Camera size={13} />
                </button>
              )}
              <input ref={picInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
            </div>
          </div>

          <div className="px-6 pb-2 space-y-4 max-h-[55vh] overflow-y-auto">
            {profileError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}
            {profileSuccess && !profileEditMode && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                <CheckCircle size={15} className="flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {!profileEditMode && (
              <div className="text-center">
                <h3 className="font-bold text-xl text-slate-900">{user?.name}</h3>
                <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                  {roleLabel}
                </span>
              </div>
            )}

            {!profileEditMode && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Role</p>
                    <p className="text-sm font-semibold text-slate-800">{roleLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.email}</p>
                  </div>
                </div>
                {role === 'student' && user?.branch && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={14} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Branch</p>
                      <p className="text-sm font-semibold text-slate-800">{user.branch}</p>
                    </div>
                  </div>
                )}
                {role === 'student' && user?.year && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen size={14} className="text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Year</p>
                      <p className="text-sm font-semibold text-slate-800">{user.year}</p>
                    </div>
                  </div>
                )}
                {role === 'faculty' && user?.branch && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={14} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Branch</p>
                      <p className="text-sm font-semibold text-slate-800">{user.branch}</p>
                    </div>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone size={14} className="text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Phone</p>
                      <p className="text-sm font-semibold text-slate-800">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {profileEditMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Your full name"
                />
              </div>
            )}

            {profileEditMode && (
              <div className="space-y-3 border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Change Password <span className="normal-case"> — optional</span></p>
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">New Password</label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={profileForm.newPassword}
                    onChange={e => setProfileForm(f => ({ ...f, newPassword: e.target.value }))}
                    className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Min. 6 characters"
                  />
                  <button type="button" onClick={() => setShowNewPass(v => !v)} className="absolute right-3 bottom-2.5 text-slate-400 hover:text-slate-600">
                    {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Confirm Password</label>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={profileForm.confirmPassword}
                    onChange={e => setProfileForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Repeat new password"
                  />
                  <button type="button" onClick={() => setShowConfirmPass(v => !v)} className="absolute right-3 bottom-2.5 text-slate-400 hover:text-slate-600">
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 space-y-2.5">
            {profileEditMode ? (
              <div className="flex gap-3">
                <button
                  onClick={() => { setProfileEditMode(false); setProfileError(''); setProfilePicFile(null); setProfilePicPreview(null); setProfileForm(f => ({ ...f, newPassword: '', confirmPassword: '' })); }}
                  disabled={profileLoading}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileSave}
                  disabled={profileLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-60"
                >
                  {profileLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                  {profileLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setProfileEditMode(true); setProfileSuccess(''); setProfileError(''); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                <Edit2 size={15} />
                Edit Profile
              </button>
            )}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[160] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Sign out?</h3>
              <p className="text-sm text-slate-500 mb-6">You'll need to log in again to access your dashboard.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default ProfileModal;
