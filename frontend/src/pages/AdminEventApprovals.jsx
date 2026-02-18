import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Calendar, User, MapPin } from 'lucide-react';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const AdminEventApprovals = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/event-requests');
            // Filter only pending requests
            const pending = (res.data.data || []).filter(r => r.status === 'pending');
            setRequests(pending);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axiosInstance.patch(`/event-requests/${id}/approve`);
            alert("Request approved successfully");
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error("Failed to approve", error);
            alert("Failed to approve request");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this request?")) return;
        try {
            await axiosInstance.patch(`/event-requests/${id}/reject`);
            alert("Request rejected");
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error("Failed to reject", error);
            alert("Failed to reject request");
        }
    };

    return (
        <div className="min-h-screen bg-[#f9f8f6] p-4 sm:p-6 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white rounded-full transition-colors" aria-label="Back to admin dashboard">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Pending Event Requests</h1>
                        <p className="text-slate-500 mt-1">Review and approve student event proposals</p>
                    </div>
                </div>

                {loading ? <Loader /> : (
                    <div className="grid gap-4">
                        {requests.length > 0 ? requests.map(req => (
                            <article key={req._id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                                <div className="flex flex-col md:flex-row justify-between gap-4 sm:gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{req.title}</h3>
                                        <p className="text-slate-600 mb-4">{req.description}</p>

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <User size={16} className="text-slate-400" />
                                                <span>{req.requestedBy?.name || 'Unknown Student'} ({req.branch})</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={16} className="text-slate-400" />
                                                <span>{new Date(req.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={16} className="text-slate-400" />
                                                <span>{req.venue}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleApprove(req._id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-green-500/20 flex-1 sm:flex-initial justify-center"
                                            aria-label={`Approve event request: ${req.title}`}
                                        >
                                            <Check size={18} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(req._id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-red-500/20 flex-1 sm:flex-initial justify-center"
                                            aria-label={`Reject event request: ${req.title}`}
                                        >
                                            <X size={18} /> Reject
                                        </button>
                                    </div>
                                </div>
                            </article>
                        )) : (
                            <EmptyState message="No pending event requests." />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminEventApprovals;
