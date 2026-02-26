import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

/**
 * ConfirmDialog – polished modal replacement for window.alert / window.confirm.
 *
 * Props:
 *   open         {boolean}   – Show/hide the dialog
 *   variant      {string}    – 'danger' | 'success' | 'info'  (default: 'danger')
 *   title        {string}    – Dialog heading
 *   message      {string}    – Body text
 *   confirmLabel {string}    – Confirm button label  (default: 'Confirm')
 *   cancelLabel  {string}    – Cancel button label   (default: 'Cancel')
 *   onConfirm    {function}  – Called on confirm click
 *   onCancel     {function}  – Called on cancel / backdrop click
 *   loading      {boolean}   – Spinner on confirm button while processing
 */
const ConfirmDialog = ({
  open,
  variant = 'danger',
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && !loading) onCancel?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel, loading]);

  if (!open) return null;

  const configs = {
    danger: {
      Icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      btnClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-200',
      gradient: 'from-red-500 to-rose-600',
    },
    success: {
      Icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-200',
      gradient: 'from-emerald-500 to-teal-600',
    },
    info: {
      Icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      btnClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-200',
      gradient: 'from-blue-500 to-indigo-600',
    },
  };

  const { Icon, iconBg, iconColor, btnClass, gradient } = configs[variant] || configs.danger;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cdlg-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn"
        onClick={() => !loading && onCancel?.()}
      />

      {/* Card */}
      <div
        className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-cdlgSlide"
      >
        {/* Top Pattern Decor */}
        <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-br ${gradient} opacity-10`} />

        <div className="relative p-8">
          {/* Close × */}
          <button
            onClick={() => !loading && onCancel?.()}
            disabled={loading}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`relative w-20 h-20 ${iconBg} rounded-3xl flex items-center justify-center animate-bounceIn`}>
              <Icon size={32} className={iconColor} />
              <div className={`absolute inset-0 rounded-3xl border-4 ${iconColor.replace('text', 'border')}/20 animate-ping`} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 id="cdlg-title" className="text-2xl font-black text-slate-900 mb-2">
              {title}
            </h3>
            {message && (
              <p className="text-slate-500 font-medium leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => !loading && onConfirm?.()}
              disabled={loading}
              className={`w-full py-4 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${btnClass}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing…
                </>
              ) : confirmLabel}
            </button>
            <button
              onClick={() => !loading && onCancel?.()}
              disabled={loading}
              className="w-full py-4 bg-transparent text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cdlgSlide {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-cdlgSlide {
          animation: cdlgSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-bounceIn {
          animation: bounceIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
