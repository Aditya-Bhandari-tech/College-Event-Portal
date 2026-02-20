import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Calendar, MapPin, Search, Clock, Users, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';

// Full branch name mapping
const BRANCH_LABELS = {
    IT: 'Information Technology',
    CS: 'Computer Science',
    ENTC: 'Electronics & Telecom',
    ME: 'Mechanical Engineering',
    CE: 'Civil Engineering',
    ALL: 'All Branches',
    all: 'All Branches',
};
const getBranchLabel = (val) => BRANCH_LABELS[val?.toUpperCase?.()] || val || 'All Branches';

const BRANCH_OPTIONS = [
    { value: 'ALL', label: 'All Branches' },
    { value: 'IT', label: 'Information Technology' },
    { value: 'CS', label: 'Computer Science' },
    { value: 'ENTC', label: 'Electronics & Telecom' },
    { value: 'ME', label: 'Mechanical Engineering' },
    { value: 'CE', label: 'Civil Engineering' },
];

const EMPTY_FORM = { title: '', description: '', date: '', venue: '', branch: 'ALL' };

/* ─── Confirm Delete Dialog ─── */
const DeleteConfirm = ({ item, onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 bg-black/50 z-[80] backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl p-6 text-center animate-fadeIn">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">Delete Event?</h3>
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
const EventModal = ({ event, onClose, onSaved, userRole }) => {
    const [form, setForm] = useState(
        event
            ? {
                title: event.title,
                description: event.description,
                date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
                venue: event.venue,
                branch: event.branch || 'ALL',
            }
            : { ...EMPTY_FORM }
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim() || !form.date || !form.venue.trim()) {
            setError('Title, description, date and venue are required.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (event) {
                const res = await axiosInstance.put(`/events/${event._id}`, form);
                onSaved(res.data.data, 'update');
            } else {
                const res = await axiosInstance.post('/events', form);
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
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <h2 className="text-white font-bold text-lg">{event ? 'Edit Event' : 'Create Event'}</h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
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
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Event title"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Description *</label>
                        <textarea
                            name="description" value={form.description} onChange={handleChange} rows={3}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                            placeholder="Describe the event…"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Date & Time *</label>
                            <input
                                type="datetime-local" name="date" value={form.date} onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Venue *</label>
                            <input
                                name="venue" value={form.venue} onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder="Hall / Room / Ground"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Branch</label>
                        <select
                            name="branch" value={form.branch} onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                        >
                            {BRANCH_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1" loading={loading} icon={event ? Edit2 : Plus}>
                            {event ? 'Save Changes' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════
   Main Events Component
════════════════════════════════════════════════ */
const Events = ({ userRole, user }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');  // default: all
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const canManage = userRole === 'admin' || userRole === 'faculty';

    useEffect(() => { fetchEvents(); }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/events');
            setEvents(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    /* ── Filtered list ── */
    const getFilteredEvents = () => {
        const now = new Date();
        let filtered = [...events];
        if (filter === 'upcoming') filtered = filtered.filter(e => new Date(e.date) >= now);
        else if (filter === 'past') filtered = filtered.filter(e => new Date(e.date) < now);
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                e.title.toLowerCase().includes(lower) ||
                e.description.toLowerCase().includes(lower) ||
                e.venue.toLowerCase().includes(lower)
            );
        }
        return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    /* ── CRUD handlers ── */
    const handleSaved = (savedEvent, mode) => {
        if (mode === 'create') {
            setEvents(prev => [savedEvent, ...prev]);
        } else {
            setEvents(prev => prev.map(e => e._id === savedEvent._id ? savedEvent : e));
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await axiosInstance.delete(`/events/${deleteTarget._id}`);
            setEvents(prev => prev.filter(e => e._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch (err) {
            console.error('Delete failed', err);
        } finally {
            setDeleteLoading(false);
        }
    };

    const canEditEvent = (event) => {
        if (userRole === 'admin') return true;
        if (userRole === 'faculty') {
            return event.createdBy === user?._id || event.createdBy?._id === user?._id ||
                event.createdBy === user?.id || event.createdBy?._id === user?.id;
        }
        return false;
    };

    const filteredEvents = getFilteredEvents();

    return (
        <div className="animate-fadeIn">
            {/* ── Header row ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Events</h2>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Filter tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-lg flex-1 sm:flex-initial" role="tablist">
                        {['all', 'upcoming', 'past'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all flex-1 sm:flex-initial ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                role="tab"
                                aria-selected={filter === f}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Create button — faculty/admin only */}
                    {canManage && (
                        <Button
                            icon={Plus}
                            size="md"
                            onClick={() => { setEditingEvent(null); setShowModal(true); }}
                        >
                            <span className="hidden sm:inline">Create Event</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Search ── */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-2 w-full sm:max-w-md">
                <Search size={18} className="text-slate-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search events…"
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

            {/* ── Event cards ── */}
            {loading ? <Loader /> : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {filteredEvents.length > 0 ? filteredEvents.map(event => {
                        const isUpcoming = new Date(event.date) >= new Date();
                        const canEdit = canEditEvent(event);

                        return (
                            <article
                                key={event._id}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col group"
                            >
                                {/* Image */}
                                <div className="relative h-40 sm:h-48 overflow-hidden">
                                    <img
                                        src={event.image || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop'}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Status badge */}
                                    <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-full shadow ${isUpcoming ? 'bg-blue-500 text-white' : 'bg-slate-500 text-white'}`}>
                                        {isUpcoming ? 'Upcoming' : 'Completed'}
                                    </span>

                                    {/* Edit/Delete buttons */}
                                    {canEdit && (
                                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditingEvent(event); setShowModal(true); }}
                                                className="bg-white/90 hover:bg-white text-blue-600 p-1.5 rounded-lg shadow-md transition-colors"
                                                title="Edit event"
                                            >
                                                <Edit2 size={13} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(event)}
                                                className="bg-white/90 hover:bg-white text-red-500 p-1.5 rounded-lg shadow-md transition-colors"
                                                title="Delete event"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-4 sm:p-5 flex flex-col flex-1">
                                    <h3 className="font-bold text-base text-slate-900 mb-1.5">{event.title}</h3>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Calendar size={13} className="text-blue-500 flex-shrink-0" />
                                            <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <Clock size={13} className="text-amber-500 flex-shrink-0 ml-1" />
                                            <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <MapPin size={13} className="text-red-500 flex-shrink-0" />
                                            <span>{event.venue}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Users size={13} className="text-emerald-500 flex-shrink-0" />
                                            <span>{getBranchLabel(event.branch)}</span>
                                        </div>
                                    </div>

                                    {userRole === 'student' && isUpcoming && (
                                        <button
                                            onClick={() => alert('Registration feature coming soon!')}
                                            className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors"
                                        >
                                            Register
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    }) : (
                        <div className="col-span-full">
                            <EmptyState message={`No ${filter === 'all' ? '' : filter + ' '}events found.`} />
                        </div>
                    )}
                </div>
            )}

            {/* ── Modals ── */}
            {showModal && (
                <EventModal
                    event={editingEvent}
                    onClose={() => { setShowModal(false); setEditingEvent(null); }}
                    onSaved={handleSaved}
                    userRole={userRole}
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

export default Events;
