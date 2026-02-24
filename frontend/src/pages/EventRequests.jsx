import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, MapPin, Clock, X, FileText, Send } from 'lucide-react';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const EventRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('list'); // 'list' | 'create'
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        venue: '',
        branch: 'ALL'
    });

    const branches = [
        { value: 'ALL', label: 'All Branches' },
        { value: 'CSE', label: 'Computer Science Engineering' },
        { value: 'IT', label: 'Information Technology' },
        { value: 'ENTC', label: 'Electronics & Telecommunication Engineering' },
        { value: 'ME', label: 'Mechanical Engineering' },
        { value: 'CE', label: 'Civil Engineering' },
        { value: 'EE', label: 'Electrical Engineering' },
        { value: 'AE', label: 'Automobile Engineering' },
    ];

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
            setTab('list');
            setFormData({ title: '', description: '', date: '', venue: '', branch: 'ALL' });
            fetchRequests();
        } catch (error) {
            console.error("Failed to submit request", error);
            alert("Failed to submit request.");
        }
    };

    return (
        <div className="animate-fadeIn pb-12">
            <div className="max-w-5xl mx-auto">
                {/* Header & Tab Switcher */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Event Requests</h2>
                        <p className="text-slate-500 font-medium mt-1">Submit or track your event proposals</p>
                    </div>

                    <div className="flex bg-white rounded-2xl p-1 shadow-md border border-slate-200">
                        <button
                            onClick={() => setTab('list')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <FileText size={18} /> My Requests
                        </button>
                        <button
                            onClick={() => setTab('create')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'create' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Plus size={18} /> New Request
                        </button>
                    </div>
                </div>

                {tab === 'create' ? (
                    /* Inline Create Card */
                    <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden animate-fadeIn border border-slate-200">
                        {/* Hero Header */}
                        <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-12 text-center">
                            <h2 className="text-white font-extrabold text-3xl mb-2">Propose an Event</h2>
                            <p className="text-indigo-100 text-sm max-w-sm mx-auto opacity-90 font-medium">Fill in the details below. Your proposal will be reviewed by the administration for approval.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Proposed Event Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-6 py-4.5 border border-slate-200 bg-slate-50/50 rounded-2xl text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Inter-College Cultural Fest 2024"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Event Justification / Description</label>
                                <textarea
                                    required
                                    rows="5"
                                    className="w-full px-6 py-4.5 border border-slate-200 bg-slate-50/50 rounded-2xl text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none placeholder:text-slate-300"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Briefly explain the purpose and major activities..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tentative Date & Time</label>
                                    <div className="relative">
                                        <input
                                            type="datetime-local"
                                            required
                                            className="w-full px-6 py-4.5 border border-slate-200 bg-slate-50/50 rounded-2xl text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all cursor-pointer"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Proposed Venue</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-6 py-4.5 border border-slate-200 bg-slate-50/50 rounded-2xl text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                                        value={formData.venue}
                                        onChange={e => setFormData({ ...formData, venue: e.target.value })}
                                        placeholder="e.g. Academic Block-2 Hall"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Department Scope</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-6 py-4.5 border border-slate-200 bg-slate-50/50 rounded-2xl text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                        value={formData.branch}
                                        onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                    >
                                        {branches.map(b => (
                                            <option key={b.value} value={b.value}>{b.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ArrowLeft size={20} className="-rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setTab('list')}
                                    className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all uppercase tracking-widest"
                                >
                                    Discard Request
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-1 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                                >
                                    <Send size={18} />
                                    Submit Proposal
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    /* Content - List View */
                    loading ? <Loader /> : (
                        <div className="grid gap-6">
                            {requests.length > 0 ? requests.map(req => (
                                <article key={req._id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 group">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{req.title}</h3>
                                                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50' :
                                                    req.status === 'rejected' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200/50' :
                                                        'bg-amber-50 text-amber-600 ring-1 ring-amber-200/50 shadow-amber-100'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 font-medium text-lg leading-relaxed mb-6 max-w-3xl">{req.description}</p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Calendar size={18} /></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                                                        <span className="text-sm font-bold text-slate-700">{new Date(req.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Clock size={18} /></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</span>
                                                        <span className="text-sm font-bold text-slate-700">{new Date(req.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><MapPin size={18} /></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Venue</span>
                                                        <span className="text-sm font-bold text-slate-700">{req.venue}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {req.reviewComment && (
                                            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 md:max-w-xs w-full">
                                                <div className="flex items-center gap-2 mb-3 text-indigo-600">
                                                    <FileText size={18} />
                                                    <span className="font-black text-[10px] uppercase tracking-widest">Administrator's Note</span>
                                                </div>
                                                <p className="text-slate-600 text-sm font-medium italic leading-relaxed">"{req.reviewComment}"</p>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            )) : (
                                <div className="py-20">
                                    <EmptyState message="No event proposals found. Ready to organize something extraordinary?" />
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </div >
    );
};

export default EventRequests;
