import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Bell, Search, Plus, Edit2, Trash2, X, AlertCircle, Star } from 'lucide-react';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';

const BRANCH_OPTIONS = [
    { value: 'all', label: 'All Branches' },
    { value: 'IT', label: 'Information Technology' },
    { value: 'CS', label: 'Computer Science' },
    { value: 'ENTC', label: 'Electronics & Telecom' },
    { value: 'ME', label: 'Mechanical Engineering' },
    { value: 'CE', label: 'Civil Engineering' },
];

const EMPTY_FORM = { title: '', message: '', branch: 'all', important: false };

/* ─── Delete Confirm Dialog ─── */
const DeleteConfirm = ({ item, onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 bg-black/50 z-[110] backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl p-6 text-center animate-fadeIn">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">Delete Announcement?</h3>
            <p className="text-sm text-slate-500 mb-6">
                "<span className="font-semibold text-slate-700">{item?.title}</span>" will be permanently deleted.
            </p>
            <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>Cancel</Button>
                <Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>Delete</Button>
            </div>
        </div>
    </div>
);

/* ─── Create / Edit Card (Inline) ─── */
const AnnouncementForm = ({ ann, onCancel, onSaved }) => {
    const [form, setForm] = useState(
        ann
            ? { title: ann.title, message: ann.message, branch: ann.branch || 'all', important: ann.important || false }
            : { ...EMPTY_FORM }
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.message.trim()) {
            setError('Title and message are required.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (ann) {
                const res = await axiosInstance.put(`/announcements/${ann._id}`, form);
                onSaved(res.data.data, 'update');
            } else {
                const res = await axiosInstance.post('/announcements', form);
                onSaved(res.data.data, 'create');
            }
            onCancel();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-fadeIn mb-8 border border-slate-200">
            {/* Header - Profile Hero Style */}
            <div className="relative bg-gradient-to-br from-violet-600 to-indigo-600 px-6 py-10 text-center">
                <h2 className="text-white font-extrabold text-2xl">
                    {ann ? 'Edit Announcement' : 'New Announcement'}
                </h2>
                <p className="text-violet-100 text-sm mt-1 opacity-90">
                    {ann ? 'Update the details of your announcement' : 'Share important news with your department'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm animate-shake">
                        <AlertCircle size={18} className="flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Announcement Title</label>
                    <input
                        name="title" value={form.title} onChange={handleChange}
                        className="w-full px-5 py-4 border border-slate-200 bg-slate-50/50 rounded-2xl text-base focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                        placeholder="e.g. Important Update regarding Internal Exams"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Message Content</label>
                    <textarea
                        name="message" value={form.message} onChange={handleChange} rows={6}
                        className="w-full px-5 py-4 border border-slate-200 bg-slate-50/50 rounded-2xl text-base focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all resize-none placeholder:text-slate-300"
                        placeholder="Write your message here…"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target Department</label>
                        <select
                            name="branch" value={form.branch} onChange={handleChange}
                            className="w-full px-5 py-4 border border-slate-200 bg-slate-50/50 rounded-2xl text-base focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                        >
                            {BRANCH_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Priority Level</label>
                        <label className={`flex items-center justify-between px-5 py-4 border rounded-2xl cursor-pointer transition-all ${form.important ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-slate-50/50 border-slate-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${form.important ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-200 text-slate-400'}`}>
                                    <Star size={16} className={form.important ? 'fill-current' : ''} />
                                </div>
                                <span className={`text-sm font-bold ${form.important ? 'text-amber-700' : 'text-slate-500'}`}>Mark as Important</span>
                            </div>
                            <input type="checkbox" name="important" checked={form.important} onChange={handleChange} className="w-5 h-5 rounded-lg text-amber-500 border-slate-300 focus:ring-amber-500 transition-all" />
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button type="button" onClick={onCancel} className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all uppercase tracking-widest" disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex-[2] py-4 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-1 transition-all uppercase tracking-widest">
                        {loading ? 'Posting...' : (ann ? 'Save Changes' : 'Post Announcement')}
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ═══════════════════════════════════════════════
   Main Announcements Component
   Converted to Tabbed Interface (No Overlays)
   Matches Profile Card & Recruitment Design
════════════════════════════════════════════════ */
const Announcements = ({ userRole, user }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tab, setTab] = useState('list'); // 'list' | 'create'

    // Form/Edit state
    const [editingAnn, setEditingAnn] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const canManage = userRole === 'admin' || userRole === 'faculty';

    useEffect(() => { fetchAnnouncements(); }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/announcements');
            setAnnouncements(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch announcements', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAnnouncements = announcements.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /* ── CRUD handlers ── */
    const handleSaved = (saved, mode) => {
        if (mode === 'create') {
            setAnnouncements(prev => [saved, ...prev]);
        } else {
            setAnnouncements(prev => prev.map(a => a._id === saved._id ? saved : a));
        }
        setTab('list');
        setEditingAnn(null);
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await axiosInstance.delete(`/announcements/${deleteTarget._id}`);
            setAnnouncements(prev => prev.filter(a => a._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch (err) {
            console.error('Delete failed', err);
        } finally {
            setDeleteLoading(false);
        }
    };

    const canEditAnn = (ann) => {
        if (userRole === 'admin') return true;
        if (userRole === 'faculty') {
            return ann.createdBy === user?._id || ann.createdBy?._id === user?._id ||
                ann.createdBy === user?.id || ann.createdBy?._id === user?.id;
        }
        return false;
    };

    const handleEdit = (ann) => {
        setEditingAnn(ann);
        setTab('create');
    };

    const handleCancelForm = () => {
        setTab('list');
        setEditingAnn(null);
    };

    return (
        <div className="animate-fadeIn">
            {/* ── Header & Tab Switcher ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Announcements</h2>
                    <p className="text-slate-500 font-medium mt-1">Keep track of important updates and news</p>
                </div>

                {canManage && (
                    <div className="flex bg-white rounded-2xl p-1 shadow-md border border-slate-200">
                        <button
                            onClick={() => handleCancelForm()}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'list' ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Bell size={18} /> View Feed
                        </button>
                        <button
                            onClick={() => { setEditingAnn(null); setTab('create'); }}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'create' ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Plus size={18} /> New Post
                        </button>
                    </div>
                )}
            </div>

            {tab === 'create' ? (
                <AnnouncementForm
                    ann={editingAnn}
                    onCancel={handleCancelForm}
                    onSaved={handleSaved}
                />
            ) : (
                <>
                    {/* ── Search Bar ── */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex items-center gap-4 w-full sm:max-w-xl transition-all focus-within:shadow-md focus-within:border-violet-200">
                        <Search size={20} className="text-slate-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Find specific announcements…"
                            className="flex-1 outline-none text-slate-700 text-base font-medium placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-violet-600 transition-colors">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* ── Announcement Feed ── */}
                    {loading ? <Loader /> : (
                        <div className="grid gap-6">
                            {filteredAnnouncements.length > 0 ? filteredAnnouncements.map(ann => {
                                const canEdit = canEditAnn(ann);
                                return (
                                    <article
                                        key={ann._id}
                                        className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                                    >
                                        <div className="flex flex-col sm:flex-row items-start gap-6">
                                            {/* Profile style Avatar */}
                                            <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center flex-shrink-0 font-black text-xl shadow-lg shadow-violet-100 group-hover:scale-110 transition-transform duration-500">
                                                {(ann.createdBy?.name || 'A').charAt(0).toUpperCase()}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {/* Header Row */}
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <h3 className="font-extrabold text-xl text-slate-900 leading-tight">{ann.title}</h3>
                                                        {ann.important && (
                                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 border border-amber-200 shadow-sm">
                                                                <Star size={12} className="fill-current" /> Important
                                                            </span>
                                                        )}
                                                    </div>

                                                    {canEdit && (
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEdit(ann)}
                                                                className="p-2.5 text-slate-400 hover:text-white hover:bg-blue-600 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-100"
                                                                title="Edit Announcement"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteTarget(ann)}
                                                                className="p-2.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-xl transition-all hover:shadow-lg hover:shadow-red-100"
                                                                title="Delete Announcement"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Meta Info */}
                                                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
                                                    <span className="text-slate-900">{ann.createdBy?.name || 'Admin'}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                    {ann.branch && ann.branch !== 'all' && (
                                                        <>
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">{ann.branch}</span>
                                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                        </>
                                                    )}
                                                    <span>{new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>

                                                <p className="text-slate-600 text-base leading-relaxed font-medium whitespace-pre-wrap">{ann.message}</p>
                                            </div>
                                        </div>
                                    </article>
                                );
                            }) : (
                                <EmptyState message="No announcements matches your search." />
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── Dialogs (Keep these as light overlays) ── */}
            {deleteTarget && (
                <DeleteConfirm
                    item={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleteLoading}
                />
            )}
        </div>
    );
};

export default Announcements;
