import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Briefcase, Calendar, CheckCircle } from 'lucide-react';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const Recruitment = () => {
    const navigate = useNavigate();
    const [recruitments, setRecruitments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [note, setNote] = useState('');

    useEffect(() => {
        fetchRecruitments();
    }, []);

    const fetchRecruitments = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/recruitments?status=open'); // Fetch only open ones
            setRecruitments(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch recruitments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/recruitments/${selectedRole._id}/apply`, { note });
            alert("Application submitted successfully!");
            setShowModal(false);
            setNote('');
            // Optimistically update UI or re-fetch if needed
            // For now, assume success means applied. 
            // Ideally backend would mark it applied or re-fetch would show status if we tracked it per user
        } catch (error) {
            console.error("Failed to apply", error);
            alert(error.response?.data?.message || "Failed to submit application");
        }
    };

    return (
        <div className="min-h-screen bg-[#f9f8f6] p-4 sm:p-6 md:p-8 font-sans">
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

                {loading ? <Loader /> : (
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
                                <button
                                    onClick={() => { setSelectedRole(rec); setShowModal(true); }}
                                    className="w-full py-3 border-t border-slate-100 text-blue-600 font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    Apply Now
                                </button>
                            </article>
                        )) : (
                            <div className="col-span-2">
                                <EmptyState message="No current open recruiting positions." />
                            </div>
                        )}
                    </div>
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
