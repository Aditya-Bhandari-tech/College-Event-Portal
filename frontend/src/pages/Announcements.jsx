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
    <div className="fixed inset-0 bg-black/50 z-[80] backdrop-blur-sm flex items-center justify-center p-4">
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

/* ─── Create / Edit Modal ─── */
const AnnouncementModal = ({ ann, onClose, onSaved }) => {
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
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm flex items-start justify-center p-4 pt-16 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fadeIn mb-8"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-600 to-indigo-600">
                    <h2 className="text-white font-bold text-lg">{ann ? 'Edit Announcement' : 'Create Announcement'}</h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            <AlertCircle size={15} className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Title *</label>
                        <input
                            name="title" value={form.title} onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none transition"
                            placeholder="Announcement title"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Message *</label>
                        <textarea
                            name="message" value={form.message} onChange={handleChange} rows={4}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none transition resize-none"
                            placeholder="Write your announcement…"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Target Branch</label>
                        <select
                            name="branch" value={form.branch} onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none transition bg-white"
                        >
                            {BRANCH_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Important toggle */}
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className={`w-10 h-5 rounded-full transition-colors relative ${form.important ? 'bg-amber-500' : 'bg-slate-200'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.important ? 'translate-x-5' : ''}`} />
                        </div>
                        <input type="checkbox" name="important" checked={form.important} onChange={handleChange} className="sr-only" />
                        <div className="flex items-center gap-2">
                            <Star size={14} className={form.important ? 'text-amber-500' : 'text-slate-400'} />
                            <span className="text-sm font-medium text-slate-700">Mark as Important</span>
                        </div>
                    </label>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600" loading={loading} icon={ann ? Edit2 : Plus}>
                            {ann ? 'Save Changes' : 'Post Announcement'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════
   Main Announcements Component
════════════════════════════════════════════════ */
const Announcements = ({ userRole, user }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
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

    return (
        <div className="animate-fadeIn">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Announcements</h2>
                {canManage && (
                    <Button
                        icon={Plus}
                        onClick={() => { setEditingAnn(null); setShowModal(true); }}
                    >
                        <span className="hidden sm:inline">New Announcement</span>
                    </Button>
                )}
            </div>

            {/* ── Search ── */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-2 w-full sm:max-w-md">
                <Search size={18} className="text-slate-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search announcements…"
                    className="flex-1 outline-none text-slate-700 text-sm min-w-0"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                        <X size={15} />
                    </button>
                )}
            </div>

            {/* ── Cards ── */}
            {loading ? <Loader /> : (
                <div className="space-y-4">
                    {filteredAnnouncements.length > 0 ? filteredAnnouncements.map(ann => {
                        const canEdit = canEditAnn(ann);
                        return (
                            <article
                                key={ann._id}
                                className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-3 sm:gap-4">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-base shadow-sm">
                                        {(ann.createdBy?.name || 'A').charAt(0).toUpperCase()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Title row */}
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-slate-900">{ann.title}</h3>
                                                {ann.important && (
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                        <Star size={10} /> Important
                                                    </span>
                                                )}
                                            </div>

                                            {/* Edit / Delete */}
                                            {canEdit && (
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <button
                                                        onClick={() => { setEditingAnn(ann); setShowModal(true); }}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(ann)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-500 mb-2">
                                            Posted by <span className="font-medium text-slate-700">{ann.createdBy?.name || 'Admin'}</span>
                                            {ann.branch && ann.branch !== 'all' && (
                                                <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{ann.branch}</span>
                                            )}
                                            <span className="ml-1">• {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </p>

                                        <p className="text-slate-600 text-sm leading-relaxed">{ann.message}</p>
                                    </div>
                                </div>
                            </article>
                        );
                    }) : (
                        <EmptyState message="No announcements found." />
                    )}
                </div>
            )}

            {/* ── Modals ── */}
            {showModal && (
                <AnnouncementModal
                    ann={editingAnn}
                    onClose={() => { setShowModal(false); setEditingAnn(null); }}
                    onSaved={handleSaved}
                />
            )}
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
