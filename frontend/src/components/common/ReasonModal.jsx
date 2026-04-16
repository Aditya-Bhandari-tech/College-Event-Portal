import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, AlertCircle } from 'lucide-react';

/**
 * ReasonModal – Premium modal for inputting a reason/comment (e.g. rejection reason).
 */
const ReasonModal = ({
  open,
  onClose,
  onSubmit,
  title = 'Reason for Rejection',
  subtitle = 'Please provide a reason to help the student understand why their request was declined.',
  placeholder = 'Enter the reason here...',
  submitLabel = 'Reject Request',
  cancelLabel = 'Cancel',
  icon: Icon = MessageSquare,
  variant = 'danger',
  loading = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setReason('');
      setError('');
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && !loading) onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose, loading]);

  if (!open) return null;

  const configs = {
    danger: {
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-500',
      btnClass: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 shadow-rose-200',
      gradient: 'from-rose-500 to-red-600',
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      btnClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-200',
      gradient: 'from-blue-500 to-indigo-600',
    },
  };

  const { iconBg, iconColor, btnClass, gradient } = configs[variant] || configs.danger;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason.');
      return;
    }
    onSubmit(reason);
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn"
        onClick={() => !loading && onClose?.()}
      />

      {/* Card */}
      <div
        className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-modalSlideUp"
      >
        {/* Decorative Header */}
        <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-br ${gradient} opacity-5`} />

        <div className="relative p-8 sm:p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center shadow-sm`}>
                <Icon size={28} className={iconColor} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => !loading && onClose?.()}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative group">
                <textarea
                  ref={inputRef}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (e.target.value.trim()) setError('');
                  }}
                  disabled={loading}
                  placeholder={placeholder}
                  className={`w-full px-6 py-5 bg-slate-50/50 border-2 rounded-3xl text-slate-700 font-medium placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100 outline-none transition-all resize-none h-40 ${
                    error ? 'border-rose-200 focus:border-rose-400' : 'border-slate-100 focus:border-indigo-400'
                  }`}
                />
                
                {error && (
                  <div className="absolute top-2 right-4 flex items-center gap-1 text-rose-500 animate-shake">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => !loading && onClose?.()}
                disabled={loading}
                className="flex-1 py-4.5 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all font-sans"
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-[1.5] py-4.5 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${btnClass}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing…
                  </>
                ) : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: scale(0.95) translateY(40px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-modalSlideUp {
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 2;
        }
      `}</style>
    </div>
  );
};

export default ReasonModal;
