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
    },
    success: {
      Icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-200',
    },
    info: {
      Icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      btnClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-200',
    },
  };

  const { Icon, iconBg, iconColor, btnClass } = configs[variant] || configs.danger;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cdlg-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onCancel?.()}
      />

      {/* Panel */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        style={{ animation: 'cdlgSlide 0.2s cubic-bezier(.22,.61,.36,1)' }}
      >
        {/* Close × */}
        <button
          onClick={() => !loading && onCancel?.()}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="p-6 pb-0">
          {/* Icon badge */}
          <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
            <Icon size={26} className={iconColor} />
          </div>

          <h3 id="cdlg-title" className="text-lg font-bold text-slate-900 text-center mb-2">
            {title}
          </h3>
          {message && (
            <p className="text-sm text-slate-500 text-center leading-relaxed px-2">
              {message}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 p-6">
          <button
            onClick={() => !loading && onCancel?.()}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => !loading && onConfirm?.()}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 transition-all ${btnClass}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cdlgSlide {
          from { opacity: 0; transform: scale(0.9) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;