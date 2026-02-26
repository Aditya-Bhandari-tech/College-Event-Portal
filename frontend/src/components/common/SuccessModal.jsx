import React, { useEffect } from 'react';
import { CheckCircle, X, ExternalLink, Calendar, MapPin, FileText } from 'lucide-react';

/**
 * SuccessModal – A premium, standard success message card.
 */
const SuccessModal = ({
    open,
    onClose,
    variant = "success", // "success" | "info"
    title,
    message,
    eventDetails = null,
    onViewRegistrations,
    onConfirm,
    confirmLabel,
    autoCloseMs = null,
    hideActions = false,
}) => {
    // Auto-close logic
    useEffect(() => {
        if (!open || !autoCloseMs) return;
        const timer = setTimeout(() => onClose?.(), autoCloseMs);
        return () => clearTimeout(timer);
    }, [open, autoCloseMs, onClose]);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    const isInfo = variant === 'info';
    const displayTitle = title || (isInfo ? "Confirmed" : "Successful!");
    const displayMessage = message || (isInfo ? "Action has been processed." : "The operation was completed successfully.");
    const themeColor = isInfo ? "indigo" : "emerald";
    const Icon = CheckCircle;

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn"
                onClick={onClose}
            />

            {/* Card */}
            <div
                className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-successSlide"
            >
                {/* Top Pattern Decor */}
                <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-br ${isInfo ? 'from-indigo-500 to-blue-600' : 'from-emerald-500 to-teal-600'} opacity-10`} />

                <div className="relative p-8">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className={`relative w-24 h-24 ${isInfo ? 'bg-indigo-100' : 'bg-emerald-100'} rounded-full flex items-center justify-center animate-bounceIn`}>
                            <Icon size={48} className={isInfo ? 'text-indigo-500' : 'text-emerald-500'} />
                            <div className={`absolute inset-0 rounded-full border-4 ${isInfo ? 'border-indigo-500/20' : 'border-emerald-500/20'} animate-ping`} />
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">{displayTitle}</h2>
                        <p className="text-slate-500 font-medium">{displayMessage}</p>
                    </div>

                    {/* Event Details Card (Structured Info) */}
                    {eventDetails && (
                        <div className="bg-slate-50 rounded-3xl p-5 mb-8 border border-slate-100">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Event Summary</h3>
                            <p className="font-bold text-slate-800 mb-3 text-lg">{eventDetails.title}</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2.5 text-slate-600 text-sm font-medium">
                                    <Calendar size={14} className={isInfo ? 'text-indigo-500' : 'text-emerald-500'} />
                                    <span>{new Date(eventDetails.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-slate-600 text-sm font-medium">
                                    <MapPin size={14} className={isInfo ? 'text-indigo-500' : 'text-emerald-500'} />
                                    <span className="truncate">{eventDetails.venue}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {!hideActions && (
                        <div className="space-y-3">
                            <button
                                onClick={onConfirm || onViewRegistrations}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:shadow-slate-300 hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                {confirmLabel || "My Activity"}
                                {confirmLabel ? <FileText size={16} /> : <ExternalLink size={16} />}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-transparent text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-slate-800 transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes successSlide {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-successSlide {
          animation: successSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-bounceIn {
          animation: bounceIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
        </div>
    );
};

export default SuccessModal;
