import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { Check, X, Calendar, User, MapPin, FileCheck, MessageSquare } from 'lucide-react';
import Loader from '../common/Loader';
import ReasonModal from '../common/ReasonModal';

const EventApprovalsView = ({ pendingEventRequests, fetchEventRequests, showToast, openConfirm, closeConfirm, setConfirmDialog }) => {
    const [localPending, setLocalPending] = useState([]);
    const [loading, setLoading] = useState(!pendingEventRequests);
    const [rejectingReqId, setRejectingReqId] = useState(null);
    const [rejectLoading, setRejectLoading] = useState(false);

    const isControlled = !!fetchEventRequests;
    const pendingRequests = isControlled ? pendingEventRequests : localPending;

    const fetchRequests = async () => {
        if (isControlled) {
            await fetchEventRequests();
            return;
        }
        setLoading(true);
        try {
            const res = await axiosInstance.get('/event-requests');
            const pending = (res.data.data || []).filter(r => r.status === 'pending');
            setLocalPending(pending);
        } catch (error) {
            console.error("Failed to fetch event requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isControlled) fetchRequests();
        else setLoading(false);
    }, [isControlled]);

    const handleApprove = async (id) => {
        try {
            await axiosInstance.patch(`/event-requests/${id}/approve`);
            if (showToast) showToast('Event approved successfully! It has been created in the system.');
            else alert('Event approved successfully! It has been created in the system.'); // fallback
            fetchRequests(); // Refresh
        } catch (error) {
            console.error("Failed to approve", error);
            if (showToast) showToast(error.response?.data?.message || 'Failed to approve event.', 'error');
            else alert(error.response?.data?.message || 'Failed to approve event.');
        }
    };

    const handleReject = (id) => {
        setRejectingReqId(id);
    };

    const handleConfirmReject = async (reason) => {
        setRejectLoading(true);
        try {
            await axiosInstance.patch(`/event-requests/${rejectingReqId}/reject`, { reviewComment: reason });
            if (showToast) showToast('Event request rejected.');
            else alert('Event request rejected.');
            setRejectingReqId(null);
            fetchRequests(); // Refresh
        } catch (error) {
            console.error("Failed to reject", error);
            if (showToast) showToast(error.response?.data?.message || 'Failed to reject event.', 'error');
            else alert(error.response?.data?.message || 'Failed to reject event.');
        } finally {
            setRejectLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900">Event Approvals</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Review and approve student event proposals</p>
                </div>
                {pendingRequests.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                        {pendingRequests.length} Pending
                    </span>
                )}
            </div>

            {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-5">
                        <FileCheck size={38} className="text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-xl mb-2">All Clear!</h3>
                    <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed">
                        There are no pending event requests at the moment. New requests will appear here when students submit proposals.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingRequests.map((req) => (
                        <div key={req._id} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 text-lg mb-2 truncate">{req.title}</h3>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{req.description}</p>

                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                            <User size={14} className="text-blue-500" />
                                            <span className="font-semibold text-slate-700">{req.requestedBy?.name || 'Unknown'}</span> ({req.branch})
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                            <Calendar size={14} className="text-amber-500" />
                                            <span>{new Date(req.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                            <MapPin size={14} className="text-emerald-500" />
                                            <span className="truncate max-w-[150px]">{req.venue}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-end md:self-center">
                                    <button
                                        onClick={() => handleApprove(req._id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(req._id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ReasonModal 
                open={!!rejectingReqId} 
                onClose={() => setRejectingReqId(null)} 
                onSubmit={handleConfirmReject} 
                loading={rejectLoading}
                title="Reject Event Proposal"
                subtitle="Please specify why this proposal is being declined. Feedback helps students improve their future requests."
                submitLabel="Confirm Rejection"
                icon={MessageSquare}
            />
        </div>
    );
};

export default EventApprovalsView;
