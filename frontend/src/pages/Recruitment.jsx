import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Briefcase, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const Recruitment = () => {
    const navigate = useNavigate();
    const [recruitments, setRecruitments] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingApps, setLoadingApps] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [note, setNote] = useState('');
    const [activeTab, setActiveTab] = useState('openings');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchRecruitments();
        fetchMyApplications();
    }, []);

    const fetchRecruitments = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/recruitments?status=open');
            setRecruitments(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch recruitments", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyApplications = async () => {
        setLoadingApps(true);
        try {
            const res = await axiosInstance.get('/recruitments/my-applications');
            setMyApplications(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            setLoadingApps(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/recruitments/${selectedRole._id}/apply`, { note });
            showToast('Application submitted successfully!');
            setShowModal(false);
            setNote('');
            fetchMyApplications();
        } catch (error) {
            console.error('Failed to apply', error);
            showToast(error.response?.data?.message || 'Failed to submit application.', 'error');
        }
    };

    // Check if student already applied for a recruitment
    const hasApplied = (recruitmentId) => {
        return myApplications.some(app => app.recruitmentId === recruitmentId);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'selected':
                return (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                        <CheckCircle size={12} /> Accepted
                    </span>
                );
            case 'rejected':
                return (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
                        <XCircle size={12} /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
                        <Clock size={12} /> Pending
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#f9f8f6] p-4 sm:p-6 md:p-8 font-sans">
            {/* Toast notification */}
            {toast && (
                <div
                    className={`fixed top-6 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}
                    role="alert"
                    style={{ animation: 'cdlgSlide 0.25s ease-out' }}
                >
                    {toast.type === 'error' ? '✕' : '✓'} {toast.msg}
                    <style>{`@keyframes cdlgSlide { from { opacity:0;transform:translate(-50%,-12px); } to { opacity:1;transform:translate(-50%,0); } }`}</style>
                </div>
            )}
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <button onClick={() => navigate('/student')} className="p-2 hover:bg-white rounded-full transition-colors" aria-label="Back to dashboard">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Volunteer & Recruitment</h1>
                        <p className="text-slate-500 mt-1">Join event teams and build your portfolio</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200 mb-6">
                    <button
                        onClick={() => setActiveTab('openings')}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'openings' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Open Positions
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${activeTab === 'applications' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        My Applications
                        {myApplications.length > 0 && (
                            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${activeTab === 'applications' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
                                {myApplications.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Open Positions Tab */}
                {activeTab === 'openings' && (
                    loading ? <Loader /> : (
                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                            {recruitments.length > 0 ? recruitments.map(rec => (
                                <article key={rec._id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                                <Briefcase size={24} />
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                                                Open
                                            </span>
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">{rec.title}</h3>
                                        <p className="text-blue-600 font-medium text-sm mb-3">{rec.roleType} • {rec.event?.title || 'General Event'}</p>
                                        <p className="text-slate-600 mb-6 text-sm leading-relaxed">{rec.description}</p>

                                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 mb-6">
                                            <span className="flex items-center gap-1"><Users size={14} /> {rec.branch}</span>
                                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(rec.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {hasApplied(rec._id) ? (
                                        <div className="w-full py-3 border-t border-slate-100 text-green-600 font-semibold flex items-center justify-center gap-2 text-sm">
                                            <CheckCircle size={16} /> Already Applied
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setSelectedRole(rec); setShowModal(true); }}
                                            className="w-full py-3 border-t border-slate-100 text-blue-600 font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Apply Now
                                        </button>
                                    )}
                                </article>
                            )) : (
                                <div className="col-span-2">
                                    <EmptyState message="No current open recruiting positions." />
                                </div>
                            )}
                        </div>
                    )
                )}

                {/* My Applications Tab */}
                {activeTab === 'applications' && (
                    loadingApps ? <Loader /> : (
                        myApplications.length > 0 ? (
                            <div className="space-y-4">
                                {myApplications.map(app => (
                                    <article key={app._id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className="font-bold text-base md:text-lg text-slate-900">{app.recruitmentTitle}</h3>
                                                    {getStatusBadge(app.applicationStatus)}
                                                </div>
                                                <p className="text-sm text-blue-600 font-medium mb-1">{app.roleType} • {app.event?.title || 'General Event'}</p>
                                                {app.note && (
                                                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600">
                                                        <span className="font-medium text-slate-700">Your note:</span> {app.note}
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                                    {app.event?.venue && <span>📍 {app.event.venue}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="You haven't applied for any positions yet. Check out the Open Positions tab!" />
                        )
                    )
                )}
            </div>

            {/* Application Modal */}
            {showModal && selectedRole && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Apply for role">
                    <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-8 shadow-2xl animate-fadeIn">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Apply for {selectedRole.roleType}</h3>
                            <p className="text-sm text-slate-500">{selectedRole.title}</p>
                        </div>
                        <form onSubmit={handleApply}>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Note (Optional)</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                                    rows="4"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="Why are you a good fit for this role?"
                                ></textarea>
                            </div>
                            <div className="flex gap-3">
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
                                    Confirm Application
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

export default Recruitment;

