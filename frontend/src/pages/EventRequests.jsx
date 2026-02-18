import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, MapPin, Clock } from 'lucide-react';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const EventRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        venue: '',
        branch: 'all' // Default or fetch from user
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/event-requests/my');
            setRequests(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/event-requests', formData);
            alert("Request submitted successfully!");
            setShowModal(false);
            setFormData({ title: '', description: '', date: '', venue: '', branch: 'all' });
            fetchRequests();
        } catch (error) {
            console.error("Failed to submit request", error);
            alert("Failed to submit request.");
        }
    };

    return (
        <div className="min-h-screen bg-[#f9f8f6] p-4 sm:p-6 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button onClick={() => navigate('/student')} className="p-2 hover:bg-white rounded-full transition-colors" aria-label="Back to dashboard">
                            <ArrowLeft size={24} className="text-slate-600" />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Event Requests</h1>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 w-full sm:w-auto justify-center"
                    >
                        <Plus size={20} /> New Request
                    </button>
                </div>

                {/* Content */}
                {loading ? <Loader /> : (
                    <div className="grid gap-4">
                        {requests.length > 0 ? requests.map(req => (
                            <article key={req._id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-slate-900">{req.title}</h3>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {req.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 mb-4">{req.description}</p>
                                        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} />
                                                <span>{new Date(req.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} />
                                                <span>{req.venue}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {req.reviewComment && (
                                        <div className="bg-slate-50 p-3 rounded-lg max-w-xs text-sm">
                                            <p className="font-semibold text-slate-700 mb-1">Feedback:</p>
                                            <p className="text-slate-600">{req.reviewComment}</p>
                                        </div>
                                    )}
                                </div>
                            </article>
                        )) : (
                            <EmptyState message="You haven't submitted any event requests yet." />
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Request new event">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-8 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900">Request New Event</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Coding Hackathon 2024"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the objective and details..."
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Venue</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.venue}
                                        onChange={e => setFormData({ ...formData, venue: e.target.value })}
                                        placeholder="e.g. Auditorium"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default EventRequests;
