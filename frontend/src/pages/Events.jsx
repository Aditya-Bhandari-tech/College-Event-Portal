import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Calendar, MapPin, Search, Clock, Users, Plus, Edit2, Trash2, X, AlertCircle, FileText, CheckCircle, Share2 } from 'lucide-react';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import AttendeesModal from '../components/specific/AttendeesModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SuccessModal from '../components/common/SuccessModal';
import { generateNoticePDF } from '../utils/NoticeGenerator';

import { BRANCHES as BRANCH_OPTIONS, getBranchLabel } from '../utils/constants';

const EMPTY_FORM = { title: '', description: '', date: '', venue: '', branch: 'ALL' };


/* ─── Create / Edit Card (Inline) ─── */
const EventForm = ({ event, onCancel, onSaved, userRole }) => {
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
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-10 text-center">
                <h2 className="text-white font-extrabold text-2xl">
                    {event ? 'Edit Event' : 'New Event'}
                </h2>
                <p className="text-blue-100 text-sm mt-1 opacity-90">
                    {event ? 'Refine the details of your upcoming event' : 'Organize and publish a new event for students'}
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
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Event Title</label>
                    <input
                        name="title" value={form.title} onChange={handleChange}
                        className="w-full px-5 py-4 border border-slate-200 bg-slate-50/50 rounded-2xl text-base focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                        placeholder="e.g. Annual Technical Symposium 2024"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Detailed Description</label>
                    <textarea
                        name="description" value={form.description} onChange={handleChange} rows={5}
                        className="w-full px-5 py-4 border border-slate-200 bg-slate-50/50 rounded-2xl text-base focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none placeholder:text-slate-300"
                        placeholder="What is this event about? Mention key highlights..."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Date & Time</label>
                        <input
                            type="datetime-local" name="date" value={form.date} onChange={handleChange}
                            className="w-full px-5 py-4 border border-slate-200 bg-slate-50/50 rounded-2xl text-base focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Location / Venue</label>
                        <input
                            name="venue" value={form.venue} onChange={handleChange}
                            className="w-full px-5 py-4 border border-slate-200 bg-slate-50/50 rounded-2xl text-base focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                            placeholder="e.g. Main Auditorium"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target Audience (Branch)</label>
                    <div className="relative">
                        <select
                            name="branch" value={form.branch} onChange={handleChange}
                            className="w-full px-5 py-4 border border-slate-200 bg-slate-50/50 rounded-2xl text-base focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                        >
                            {BRANCH_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Clock size={18} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button type="button" onClick={onCancel} className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all uppercase tracking-widest" disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex-[2] py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all uppercase tracking-widest">
                        {loading ? 'Processing...' : (event ? 'Save Changes' : 'Publish Event')}
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ═══════════════════════════════════════════════
   Main Events Component
   Converted to Tabbed Interface (No Overlays)
════════════════════════════════════════════════ */
const Events = ({ userRole, user, onRegister, onShowStatus, initialSearch = '' }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [tab, setTab] = useState('list'); // 'list' | 'create'

    useEffect(() => {
        if (initialSearch) {
            setSearchTerm(initialSearch);
            setFilter('all'); // Ensure we look in all categories when searching from dashboard
        }
    }, [initialSearch]);

    // Form/Edit state
    const [editingEvent, setEditingEvent] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [showShareSuccess, setShowShareSuccess] = useState(false);
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [lastDeletedTitle, setLastDeletedTitle] = useState('');
    const [newlyCreatedEvent, setNewlyCreatedEvent] = useState(null);

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
                e.title?.toLowerCase().includes(lower) ||
                e.description?.toLowerCase().includes(lower) ||
                e.venue?.toLowerCase().includes(lower)
            );
        }
        return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const handleShare = async (event) => {
        const shareData = {
            title: event.title,
            text: `Check out this event: ${event.title}\nVenue: ${event.venue}\nDate: ${new Date(event.date).toLocaleDateString()}`,
            url: window.location.origin + '/student?event=' + event._id
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Share failed', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(shareData.url);
                setShowShareSuccess(true);
            } catch (err) {
                console.error('Clipboard failed', err);
            }
        }
    };

    /* ── CRUD handlers ── */
    const handleSaved = (savedEvent, mode) => {
        if (mode === 'create') {
            setEvents(prev => [savedEvent, ...prev]);
            // Show professional download message card for faculty instead of auto-download
            if (userRole === 'faculty' || userRole === 'admin') {
                setNewlyCreatedEvent(savedEvent);
                setShowNoticeModal(true);
            }
        } else {
            setEvents(prev => prev.map(e => e._id === savedEvent._id ? savedEvent : e));
        }
        setTab('list');
        setEditingEvent(null);
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            const title = deleteTarget.title;
            await axiosInstance.delete(`/events/${deleteTarget._id}`);
            setEvents(prev => prev.filter(e => e._id !== deleteTarget._id));
            setLastDeletedTitle(title);
            setDeleteTarget(null);
            setShowDeleteSuccess(true);
        } catch (err) {
            console.error('Delete failed', err);
            // We can still use a toast or another SuccessModal with variant="error" if desired, 
            // but for now, we'll just log it. The user specifically asked for professional cards for deletion.
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

    const handleEdit = (event) => {
        setEditingEvent(event);
        setTab('create');
    };

    const handleCancelForm = () => {
        setTab('list');
        setEditingEvent(null);
    };

    const handleDownloadPDF = (event) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246);
        doc.text("Registered Students List", 14, 22);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Event: ${event.title}`, 14, 32);
        doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`, 14, 38);
        doc.text(`Venue: ${event.venue}`, 14, 44);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 50);

        const tableColumn = ["#", "Name", "Branch", "Year", "Mobile", "Email"];
        const tableRows = (event.registrations || []).map((student, index) => [
            index + 1,
            student.name,
            student.branch,
            student.year || 'N/A',
            student.phone || 'N/A',
            student.email
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            margin: { top: 60 },
        });

        doc.save(`${event.title.replace(/\s+/g, '_')}_Attendees.pdf`);
    };

    const filteredEvents = getFilteredEvents();

    return (
        <div className="animate-fadeIn">
            {/* ── Header & Tab Switcher ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Events</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage and discover campus activities</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Tab Switcher (Faculty/Admin only) */}
                    {canManage && (
                        <div className="flex bg-white rounded-2xl p-1 shadow-md border border-slate-200">
                            <button
                                onClick={() => handleCancelForm()}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Calendar size={18} /> View Feed
                            </button>
                            <button
                                onClick={() => { setEditingEvent(null); setTab('create'); }}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'create' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Plus size={18} /> New Event
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {tab === 'create' ? (
                <EventForm
                    event={editingEvent}
                    onCancel={handleCancelForm}
                    onSaved={handleSaved}
                    userRole={userRole}
                />
            ) : (
                <>
                    {/* ── Filter Bar & Search ── */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-8">
                        {/* Status Filters */}
                        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto no-scrollbar">
                            {['all', 'upcoming', 'past'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => { setFilter(f); setSearchTerm(''); }}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${filter === f ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {f} Events
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="flex-1 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 transition-all focus-within:shadow-md focus-within:border-blue-200">
                            <Search size={20} className="text-slate-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by title, description or venue…"
                                className="flex-1 outline-none text-slate-700 font-medium placeholder:text-slate-300"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-blue-600">
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Event Grid ── */}
                    {loading ? <Loader /> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.length > 0 ? filteredEvents.map(event => {
                                const isUpcoming = new Date(event.date) >= new Date();
                                const canEdit = canEditEvent(event);
                                const isRegistered = event.registrations?.some(r => (r._id || r) === user?._id);

                                return (
                                    <article
                                        key={event._id}
                                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-200 hover:shadow-2xl transition-all duration-500 flex flex-col group h-full"
                                    >
                                        {/* Image Section */}
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={event.image || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop'}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />

                                            {/* Status Badge */}
                                            <div className="absolute top-4 left-4">
                                                {(() => {
                                                    const eventDate = new Date(event.date);
                                                    const now = new Date();
                                                    const isToday = eventDate.toDateString() === now.toDateString();

                                                    if (isToday) return <span className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Live Now</span>;
                                                    if (eventDate > now) return <span className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">Upcoming</span>;
                                                    return <span className="px-3 py-1.5 bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">Completed</span>;
                                                })()}
                                            </div>

                                            {/* Action Buttons overlay */}
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 text-white">
                                                <button onClick={() => handleShare(event)} title="Share Event" className="bg-white/90 hover:bg-white text-indigo-600 p-2.5 rounded-xl shadow-xl backdrop-blur-md transition-all hover:scale-110"><Share2 size={16} /></button>
                                                {canEdit && (
                                                    <>
                                                        <button onClick={() => generateNoticePDF(event, user)} title="Download Notice" className="bg-white/90 hover:bg-white text-indigo-600 p-2.5 rounded-xl shadow-xl backdrop-blur-md transition-all hover:scale-110"><FileText size={16} /></button>
                                                        <button onClick={() => handleEdit(event)} title="Edit Event" className="bg-white/90 hover:bg-white text-blue-600 p-2.5 rounded-xl shadow-xl backdrop-blur-md transition-all hover:scale-110"><Edit2 size={16} /></button>
                                                        <button onClick={() => setDeleteTarget(event)} title="Delete Event" className="bg-white/90 hover:bg-white text-red-500 p-2.5 rounded-xl shadow-xl backdrop-blur-md transition-all hover:scale-110"><Trash2 size={16} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info Section */}
                                        <div className="p-7 flex flex-col flex-1">
                                            <h3 className="font-extrabold text-xl text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">{event.title}</h3>
                                            <p className="text-slate-500 font-medium text-sm mb-6 line-clamp-3 leading-relaxed flex-1">{event.description}</p>

                                            <div className="space-y-3.5 mb-6">
                                                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar size={14} /></div>
                                                    <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><MapPin size={14} /></div>
                                                    <span>{event.venue}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Users size={14} /></div>
                                                    <span>{getBranchLabel(event.branch)}</span>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            {userRole?.toLowerCase() === 'student' && isUpcoming ? (
                                                <div className="flex flex-col gap-3">
                                                    <button
                                                        onClick={() => isRegistered ? onShowStatus(event) : onRegister(event._id)}
                                                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${isRegistered ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-1'}`}
                                                    >
                                                        <div className="flex items-center justify-center gap-2">
                                                            {isRegistered && <CheckCircle size={16} />}
                                                            {isRegistered ? 'Registered' : 'Register Now'}
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => handleShare(event)}
                                                        className="w-full py-4 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-slate-100"
                                                    >
                                                        <Share2 size={18} /> Share Event
                                                    </button>
                                                </div>
                                            ) : userRole !== 'student' && (
                                                <div className="flex flex-col gap-3">
                                                    <button
                                                        onClick={() => { setSelectedItem(event); setShowAttendeesModal(true); }}
                                                        className="w-full py-4 bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                                                    >
                                                        <Users size={18} />
                                                        Attendees ({event.registrations?.length || 0})
                                                    </button>

                                                    <button
                                                        onClick={() => generateNoticePDF(event, user)}
                                                        className="w-full py-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-indigo-100"
                                                    >
                                                        <FileText size={18} />
                                                        Download Notice
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                );
                            }) : (
                                <div className="col-span-full py-20">
                                    <EmptyState message={`No ${filter === 'all' ? '' : filter + ' '}events found matching your search.`} />
                                </div>
                            )}
                        </div>
                    )}
                </>
            )
            }

            {/* ── Light Dialogs ── */}
            {deleteTarget && (
                <ConfirmDialog
                    open={!!deleteTarget}
                    variant="danger"
                    title="Delete Event?"
                    message={`"${deleteTarget.title}" will be permanently removed. This action cannot be undone.`}
                    confirmLabel="Delete Event"
                    loading={deleteLoading}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {showDeleteSuccess && (
                <SuccessModal
                    open={showDeleteSuccess}
                    onClose={() => setShowDeleteSuccess(false)}
                    title="Event Deleted"
                    message={`"${lastDeletedTitle}" has been successfully removed from the system.`}
                    hideActions={true}
                    autoCloseMs={1500}
                />
            )}

            {showShareSuccess && (
                <SuccessModal
                    open={showShareSuccess}
                    onClose={() => setShowShareSuccess(false)}
                    title="Link Copied"
                    message="Event link has been copied to your clipboard. Send it to your friends!"
                    hideActions={true}
                    autoCloseMs={2000}
                />
            )}

            {showNoticeModal && (
                <SuccessModal
                    open={showNoticeModal}
                    onClose={() => { setShowNoticeModal(false); setNewlyCreatedEvent(null); }}
                    title="Event Published!"
                    message="Your professional notice is ready for download."
                    eventDetails={newlyCreatedEvent}
                    confirmLabel="Download Notice"
                    onConfirm={() => {
                        generateNoticePDF(newlyCreatedEvent, user);
                        setShowNoticeModal(false);
                        setNewlyCreatedEvent(null);
                    }}
                />
            )}

            {
                showAttendeesModal && selectedItem && (
                    <AttendeesModal
                        event={selectedItem}
                        onClose={() => { setShowAttendeesModal(false); setSelectedItem(null); }}
                        userRole={userRole}
                        onDownloadPDF={handleDownloadPDF}
                    />
                )
            }
        </div >
    );
};

export default Events;
