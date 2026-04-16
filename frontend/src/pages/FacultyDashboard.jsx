import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Calendar, Users, Bell, Search, Image,
    Plus, FileText, CheckCircle, XCircle,
    UserCheck, UserPlus, ChevronRight, Menu, LogOut, Award, Check, X,
    Upload, User, ImageIcon, Trash2, CheckCheck, BriefcaseBusiness
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../contexts/useAuth';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ProfileModal from '../components/profile/ProfileModal';
import FacultyProfileCard from '../components/profile/FacultyProfileCard';
import { useTheme } from '../contexts/ThemeContext';
import DarkModeToggle from '../components/common/DarkModeToggle';
import RecruitmentCard from '../components/specific/RecruitmentCard';
import GalleryMediaGrid from '../components/specific/GalleryMediaGrid';
import Events from './Events';
import Announcements from './Announcements';
import EventApprovalsView from '../components/specific/EventApprovalsView';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SuccessModal from '../components/common/SuccessModal';

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

const StatsCard = ({ icon: Icon, label, count, color }) => {
    const { darkMode: dm } = useTheme();
    // Explicit color mapping to avoid Tailwind purge issues with dynamic template strings
    const colorMap = {
        blue: { border: 'border-l-blue-500', iconBg: 'bg-blue-50', iconText: 'text-blue-600', dmIconBg: 'bg-blue-500/10' },
        indigo: { border: 'border-l-indigo-500', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600', dmIconBg: 'bg-indigo-500/10' },
        violet: { border: 'border-l-violet-500', iconBg: 'bg-violet-50', iconText: 'text-violet-600', dmIconBg: 'bg-violet-500/10' },
        emerald: { border: 'border-l-emerald-500', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', dmIconBg: 'bg-emerald-500/10' },
        amber: { border: 'border-l-amber-500', iconBg: 'bg-amber-50', iconText: 'text-amber-600', dmIconBg: 'bg-amber-500/10' },
        rose: { border: 'border-l-rose-500', iconBg: 'bg-rose-50', iconText: 'text-rose-600', dmIconBg: 'bg-rose-500/10' },
    };
    const c = colorMap[color] || colorMap.blue;

    return (
        <div className={`${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-2xl shadow-sm border-2 border-l-4 ${c.border} transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className={`${dm ? 'text-slate-400' : 'text-slate-500'} text-xs font-bold uppercase tracking-wider`}>{label}</p>
                    <h3 className={`${dm ? 'text-white' : 'text-slate-900'} text-3xl font-black mt-1`}>{count}</h3>
                </div>
                <div className={`p-2.5 ${dm ? c.dmIconBg : c.iconBg} ${c.iconText} rounded-xl shadow-sm`}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};

const SectionHeader = ({ icon: Icon, title, subtitle, color = 'blue', action }) => {
    const colors = {
        blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-700' },
        indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-700' },
        violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', text: 'text-violet-700' },
        emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700' },
        amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-700' },
        rose: { bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', text: 'text-rose-700' },
    };
    const c = colors[color] || colors.blue;
    return (
        <div className={`rounded-2xl ${c.bg} border border-white p-4 md:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm`}>
            <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon size={22} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                    {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            {action}
        </div>
    );
};

// ─── LOCAL VIEW COMPONENTS ───────────────────────────────────────────────────

const FacultyRecruitmentView = ({ axiosInstance, user }) => {
    const [recruitments, setRecruitments] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('list');
    const [expandedId, setExpandedId] = useState(null);
    const [applicants, setApplicants] = useState({});
    const [loadingApplicants, setLoadingApplicants] = useState({});
    const [form, setForm] = useState({ title: '', description: '', roleType: 'volunteer', branch: user?.branch || '', eventId: '', customRole: '' });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const roleTypes = ['volunteer', 'anchor', 'coordinator', 'technical', 'other'];

    const fetchRecruitments = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/recruitments?status=all');
            const allRecs = res.data.data || [];
            setRecruitments(allRecs.filter(r => r.createdBy?._id === user._id || r.createdBy === user._id));
        } catch { } finally { setLoading(false); }
    };

    const fetchEvents = async () => {
        try {
            const res = await axiosInstance.get('/events');
            const allEvents = res.data.data || [];
            if (!user) return;

            const myId = (user?._id || user?.id || '').toString();
            const myBranch = (user?.branch || '').toUpperCase();

            // EXTREMELY permissive filtering to ensure events show up
            const filtered = allEvents.filter(e => {
                const creatorId = (e.createdBy?._id || e.createdBy || '').toString();
                const eventBranch = (e.branch || 'ALL').toUpperCase();

                const isOwner = myId && creatorId === myId;
                const isBranchMatch = eventBranch === myBranch ||
                    eventBranch === 'ALL' ||
                    myBranch === 'ALL' ||
                    !myBranch ||
                    !eventBranch ||
                    myBranch.includes(eventBranch) ||
                    eventBranch.includes(myBranch);

                return isOwner || isBranchMatch;
            });

            console.log('Recruitment Events Debug:', {
                allCount: allEvents.length,
                filteredCount: filtered.length,
                userBranch: myBranch,
                userId: myId,
                firstEvent: allEvents[0] ? { title: allEvents[0].title, branch: allEvents[0].branch, creator: allEvents[0].createdBy } : 'none'
            });

            setEvents(filtered.length > 0 ? filtered : allEvents); // Fallback to ALL if filter is too strict
        } catch (error) {
            console.error("Error fetching events for recruitment", error);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchRecruitments();
        fetchEvents();
    }, [user]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.eventId) { setFormError('Title, description and event are required.'); return; }
        setSubmitting(true); setFormError('');
        try {
            const payload = { ...form, roleType: form.roleType === 'other' ? form.customRole.trim() : form.roleType };
            await axiosInstance.post('/recruitments', payload);
            setForm({ title: '', description: '', roleType: 'volunteer', branch: user.branch, eventId: '', customRole: '' });
            setTab('list');
            fetchRecruitments();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to create recruitment post.');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await axiosInstance.delete(`/recruitments/${id}`);
            setRecruitments(prev => prev.filter(r => r._id !== id));
        } catch { alert('Failed to delete post.'); }
    };

    const toggleApplicants = async (id) => {
        if (expandedId === id) { setExpandedId(null); return; }
        setExpandedId(id);
        if (applicants[id]) return;
        setLoadingApplicants(p => ({ ...p, [id]: true }));
        try {
            const res = await axiosInstance.get(`/recruitments/${id}/applicants`);
            setApplicants(p => ({ ...p, [id]: res.data.data?.applicants || [] }));
        } catch { setApplicants(p => ({ ...p, [id]: [] })); }
        finally { setLoadingApplicants(p => ({ ...p, [id]: false })); }
    };

    const updateApplicantStatus = async (recruitId, applicantId, status) => {
        try {
            await axiosInstance.patch(`/recruitments/${recruitId}/applicants/${applicantId}`, { status });
            setApplicants(prev => ({
                ...prev,
                [recruitId]: prev[recruitId].map(a => a._id === applicantId ? { ...a, status } : a),
            }));
        } catch { alert('Failed to update applicant status.'); }
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200 mb-6">
                <button onClick={() => setTab('list')} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>List Posts</button>
                <button onClick={() => setTab('create')} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'create' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>New Post</button>
            </div>

            {tab === 'create' ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-xl font-bold mb-6">Create New Recruitment Post</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        {formError && <p className="text-red-500 text-sm">{formError}</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Link to Event</label>
                                <select required value={form.eventId} onChange={e => setForm({ ...form, eventId: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2">
                                    <option value="">Select your event</option>
                                    {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Role Type</label>
                                <select value={form.roleType} onChange={e => setForm({ ...form, roleType: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                                    {roleTypes.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>
                        {form.roleType === 'other' && (
                            <input type="text" placeholder="Specify role name..." value={form.customRole} onChange={e => setForm({ ...form, customRole: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mt-2" />
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                            <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" rows="4"></textarea>
                        </div>
                        <button type="submit" disabled={submitting} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                            {submitting ? 'Creating...' : 'Post Recruitment'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-4">
                    {loading ? <Loader /> : (
                        recruitments.length > 0 ? recruitments.map(rec => (
                            <RecruitmentCard
                                key={rec._id}
                                rec={rec}
                                onDelete={() => handleDelete(rec._id)}
                                onToggleApplicants={() => toggleApplicants(rec._id)}
                                isExpanded={expandedId === rec._id}
                                applicants={applicants[rec._id] || []}
                                loadingApplicants={loadingApplicants[rec._id]}
                                userRole="faculty"
                                onUpdateApplicantStatus={(appId, status) => updateApplicantStatus(rec._id, appId, status)}
                                onCloseApplicants={() => setExpandedId(null)}
                            />
                        )) : <EmptyState message="No recruitment posts yet." />
                    )}
                </div>
            )}
        </div>
    );
};

const FacultyGalleryView = ({ axiosInstance, user }) => {
    const [loading, setLoading] = useState(true);
    const [galleryData, setGalleryData] = useState([]);
    const [generalGalleryItems, setGeneralGalleryItems] = useState([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadEventId, setUploadEventId] = useState('');
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [events, setEvents] = useState([]);
    const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

    const fetchGallery = async () => {
        setLoading(true);
        try {
            const [eventsRes, generalRes] = await Promise.all([
                axiosInstance.get('/events'),
                axiosInstance.get('/gallery')
            ]);
            const allEvents = eventsRes.data.data || [];
            const myEventsWithImages = allEvents.filter(e => (e.createdBy === user._id || e.createdBy?._id === user._id) && e.images && e.images.length > 0);
            setGalleryData(myEventsWithImages);
            setGeneralGalleryItems(generalRes.data.data || []);
            setEvents(allEvents.filter(e => e.createdBy?._id === user._id || e.createdBy === user._id));
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => {
        if (user) fetchGallery();
    }, [user]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadEventId || uploadFiles.length === 0) return;
        setUploading(true);
        const formData = new FormData();
        uploadFiles.forEach(file => formData.append('images', file));
        try {
            if (uploadEventId === 'unlinked') {
                await axiosInstance.post('/gallery/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await axiosInstance.post(`/events/${uploadEventId}/gallery`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            setShowUploadForm(false);
            setUploadFiles([]);
            fetchGallery();
        } catch { alert('Upload failed.'); }
        finally { setUploading(false); }
    };

    const handleDelete = async (eventId, publicId, generalId = null) => {
        if (!window.confirm('Delete this media?')) return;
        try {
            if (generalId) {
                await axiosInstance.delete(`/gallery/${generalId}`);
                setGeneralGalleryItems(prev => prev.filter(img => img._id !== generalId));
            } else {
                await axiosInstance.delete(`/events/${eventId}/gallery/${publicId}`);
                fetchGallery();
            }
        } catch { alert('Delete failed.'); }
    };

    return (
        <div className="animate-fadeIn pb-12">
            <SectionHeader icon={Image} title="Memories & Gallery" color="rose"
                subtitle="Visual highlights from your department activities"
                action={
                    <button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md ${showUploadForm ? 'bg-slate-800 text-white' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
                    >
                        {showUploadForm ? <X size={18} /> : <Upload size={18} />}
                        {showUploadForm ? 'Close Upload' : 'Upload Media'}
                    </button>
                }
            />

            {showUploadForm && (
                <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden animate-fadeIn border border-slate-200 mb-10">
                    <div className="relative bg-gradient-to-br from-rose-500 to-pink-600 px-8 py-10 text-center">
                        <h2 className="text-white font-extrabold text-2xl mb-1">Add New Media</h2>
                        <p className="text-rose-100 text-sm opacity-90">Upload photos or videos to showcase your event highlights</p>
                    </div>

                    <form onSubmit={handleUpload} className="p-8 space-y-8">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Destination</label>
                            <div className="relative">
                                <select
                                    required
                                    value={uploadEventId}
                                    onChange={e => setUploadEventId(e.target.value)}
                                    className="w-full px-6 py-4.5 border border-slate-200 bg-slate-50/50 rounded-2xl text-base font-bold focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Target...</option>
                                    <option value="unlinked">General Gallery (Public)</option>
                                    {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronRight size={20} className="rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Files</label>
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 hover:border-rose-300 transition-all cursor-pointer group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <ImageIcon size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-600">
                                        {uploadFiles.length > 0 ? `${uploadFiles.length} files selected` : 'Drop images/videos here or click'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-black">Support: JPG, PNG, WEBP, MP4</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={e => setUploadFiles(Array.from(e.target.files))}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setShowUploadForm(false)} className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all uppercase tracking-widest">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploading || uploadFiles.length === 0}
                                className="flex-[2] py-4 px-6 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-100 hover:shadow-rose-200 hover:-translate-y-1 transition-all uppercase tracking-widest disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                            >
                                {uploading ? 'Finalizing Upload...' : 'Star Syncing Media'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <Loader /> : (
                <div className="space-y-8">
                    {generalGalleryItems.length > 0 && (
                        <GalleryMediaGrid title="Campus Moments" subtitle="Spontaneous highlights and community memories" items={generalGalleryItems} canManage={true}
                            onItemClick={(items, idx) => setLightbox({ open: true, images: items, index: idx })}
                            onDelete={(pId, gId) => handleDelete(null, pId, gId)}
                            icon={Image} gradientClasses="from-amber-50 to-orange-50/30" headerAccentClasses="bg-amber-500 shadow-amber-200" badgeClasses="text-amber-600 border-amber-200"
                        />
                    )}
                    {galleryData.length > 0 ? galleryData.map(event => (
                        <GalleryMediaGrid key={event._id} title={event.title} subtitle={`${new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`} items={event.images} canManage={true}
                            onItemClick={(items, idx) => setLightbox({ open: true, images: items, index: idx })}
                            onDelete={(pId) => handleDelete(event._id, pId)}
                            icon={Calendar}
                        />
                    )) : !generalGalleryItems.length && <EmptyState message="The gallery is looking a bit empty. Time to share some memories!" />}
                </div>
            )}

            {lightbox.open && (
                <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4" onClick={() => setLightbox({ ...lightbox, open: false })}>
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><X size={40} /></button>
                    <div className="relative w-full max-w-7xl max-h-full flex items-center justify-center">
                        {lightbox.images[lightbox.index]?.resource_type === 'video' ? (
                            <video src={lightbox.images[lightbox.index]?.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
                        ) : (
                            <img src={lightbox.images[lightbox.index]?.url} alt="" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── MAIN DASHBOARD COMPONENT ────────────────────────────────────────────────

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const { logout: authLogout } = useAuth();
    const { darkMode } = useTheme();
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [activeRoute, setActiveRoute] = useState('Dashboard');
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // ── Dialog / Toast State ──────────────────────────────────────────────────
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null, variant: 'danger', loading: false });
    const openConfirm = (opts) => setConfirmDialog({ open: true, loading: false, variant: 'danger', ...opts });
    const closeConfirm = () => setConfirmDialog(d => ({ ...d, open: false, loading: false }));

    const [toast, setToast] = useState(null);
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successEvent, setSuccessEvent] = useState(null);

    // ── Notification state ───────────────────────────────────────
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifClosing, setNotifClosing] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);
    const [readIds, setReadIds] = useState(new Set());
    const [clearedIds, setClearedIds] = useState(new Set());
    const notifRef = useRef(null);
    const notifCloseTimer = useRef(null);

    const notifReadKey = user ? `notif_read_${user._id}` : null;
    const notifClearedKey = user ? `notif_cleared_${user._id}` : null;

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    const fetchNotifications = useCallback(async () => {
        setNotifLoading(true);
        try {
            const [eventsRes, announcementsRes, recruitmentsRes] = await Promise.allSettled([
                axiosInstance.get('/events'),
                axiosInstance.get('/announcements'),
                axiosInstance.get('/recruitments'),
            ]);
            const items = [];

            if (eventsRes.status === 'fulfilled') {
                (eventsRes.value.data?.data || []).forEach(e => {
                    items.push({
                        id: `event_${e._id}`,
                        type: 'event',
                        title: e.title,
                        subtitle: `Event · ${e.venue || 'Campus'}`,
                        time: e.createdAt || e.date,
                        route: 'Events',
                    });
                });
            }
            if (announcementsRes.status === 'fulfilled') {
                (announcementsRes.value.data?.data || []).forEach(a => {
                    items.push({
                        id: `ann_${a._id}`,
                        type: 'announcement',
                        title: a.title,
                        subtitle: `Announcement by ${a.createdBy?.name || 'Faculty'}`,
                        time: a.createdAt,
                        route: 'Announcements',
                    });
                });
            }
            if (recruitmentsRes.status === 'fulfilled') {
                (recruitmentsRes.value.data?.data || recruitmentsRes.value.data || []).forEach(r => {
                    if (r.applicants?.length > 0) {
                        items.push({
                            id: `recruit_${r._id}`,
                            type: 'recruitment',
                            title: r.title || 'Recruitment',
                            subtitle: `${r.applicants.length} applicant(s) waiting`,
                            time: r.createdAt,
                            route: 'Recruitment',
                        });
                    }
                });
            }

            items.sort((a, b) => new Date(b.time) - new Date(a.time));
            setNotifications(items);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setNotifLoading(false);
        }
    }, []);

    const visibleNotifications = notifications.filter(n => !clearedIds.has(n.id));
    const unreadCount = visibleNotifications.filter(n => !readIds.has(n.id)).length;

    const markRead = (id) => setReadIds(prev => {
        const next = new Set(prev); next.add(id);
        if (notifReadKey) localStorage.setItem(notifReadKey, JSON.stringify([...next]));
        return next;
    });

    const markAllRead = () => {
        const allIds = notifications.map(n => n.id);
        setReadIds(prev => {
            const next = new Set([...prev, ...allIds]);
            if (notifReadKey) localStorage.setItem(notifReadKey, JSON.stringify([...next]));
            return next;
        });
    };

    const closeNotifPanel = () => {
        setNotifClosing(true);
        clearTimeout(notifCloseTimer.current);
        notifCloseTimer.current = setTimeout(() => { setNotifOpen(false); setNotifClosing(false); }, 150);
    };

    const clearAllNotifications = () => {
        const allIds = notifications.map(n => n.id);
        setClearedIds(prev => {
            const next = new Set([...prev, ...allIds]);
            if (notifClearedKey) localStorage.setItem(notifClearedKey, JSON.stringify([...next]));
            return next;
        });
        setReadIds(prev => {
            const next = new Set([...prev, ...allIds]);
            if (notifReadKey) localStorage.setItem(notifReadKey, JSON.stringify([...next]));
            return next;
        });
        closeNotifPanel();
    };

    const handleNotifClick = (notif) => {
        markRead(notif.id);
        closeNotifPanel();
        handleRouteChange(notif.route);
    };

    // Stats
    const [stats, setStats] = useState({
        ongoing: 0,
        upcoming: 0,
        finished: 0,
        students: 0
    });

    // Data Lists
    const [students, setStudents] = useState([]);
    const [pendingEventRequests, setPendingEventRequests] = useState([]);

    // Loading States
    const [loading, setLoading] = useState({
        events: false,
        students: false
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch (_) { }
        }
        axiosInstance.get('/users/me')
            .then(res => {
                const freshUser = res.data?.data || res.data;
                if (freshUser) { setUser(freshUser); localStorage.setItem('user', JSON.stringify(freshUser)); }
            })
            .catch(() => { });
    }, []);

    // Load persisted read/cleared IDs
    useEffect(() => {
        if (!user?._id) return;
        try {
            setReadIds(new Set(JSON.parse(localStorage.getItem(`notif_read_${user._id}`) || '[]')));
            setClearedIds(new Set(JSON.parse(localStorage.getItem(`notif_cleared_${user._id}`) || '[]')));
        } catch { }
    }, [user?._id]);

    // Fetch notifications when user is ready
    useEffect(() => { if (user) fetchNotifications(); }, [user, fetchNotifications]);

    // Cleanup timer on unmount
    useEffect(() => () => clearTimeout(notifCloseTimer.current), []);

    // Close panel on outside click
    useEffect(() => {
        if (!notifOpen) return;
        const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) closeNotifPanel(); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [notifOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!user) return;
        if (activeRoute === 'Dashboard') {
            fetchStats();
            fetchEventRequests();
        } else if (activeRoute === 'Students') {
            fetchStudents();
        } else if (activeRoute === 'Event Requests') {
            fetchEventRequests();
        }
    }, [activeRoute, user]);

    const fetchEventRequests = async () => {
        try {
            const res = await axiosInstance.get('/event-requests');
            const pending = (res.data.data || []).filter(r => r.status === 'pending');
            setPendingEventRequests(pending);
        } catch (error) {
            console.error("Failed to fetch event requests", error);
        }
    };

    // API Calls
    const fetchStats = async () => {
        setLoading(prev => ({ ...prev, events: true }));
        try {
            const [eventsRes, studentsRes] = await Promise.all([
                axiosInstance.get('/events'),
                axiosInstance.get('/users/students')
            ]);
            const allEvents = eventsRes.data.data || [];
            const studentList = studentsRes.data.data || [];

            const now = new Date();
            const ongoing = allEvents.filter(e => new Date(e.date).toDateString() === now.toDateString()).length;
            const upcoming = allEvents.filter(e => new Date(e.date) > now).length;
            const finished = allEvents.filter(e => new Date(e.date) < now && new Date(e.date).toDateString() !== now.toDateString()).length;

            setStats({ ongoing, upcoming, finished, students: studentList.length });
        } catch (error) {
            console.error("Error fetching stats", error);
        } finally {
            setLoading(prev => ({ ...prev, events: false }));
        }
    };

    const fetchStudents = async () => {
        setLoading(prev => ({ ...prev, students: true }));
        try {
            const res = await axiosInstance.get('/users/students');
            setStudents(res.data.data || []);
        } catch (error) {
            console.error("Error fetching students", error);
        } finally {
            setLoading(prev => ({ ...prev, students: false }));
        }
    };

    // Handlers
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleRouteChange = (route) => {
        setActiveRoute(route);
        setMobileSidebarOpen(false);
    };

    const renderStats = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8" role="region" aria-label="Statistics">
            <StatsCard icon={Calendar} label="Ongoing Events" count={stats.ongoing} color="blue" />
            <StatsCard icon={Calendar} label="Upcoming Events" count={stats.upcoming} color="indigo" />
            <StatsCard icon={CheckCircle} label="Finished Events" count={stats.finished} color="emerald" />
            <StatsCard icon={Users} label="Total Students" count={stats.students} color="amber" />
        </div>
    );

    const navigation = [
        { name: 'Dashboard', icon: UserCheck },
        { name: 'Events', icon: Calendar },
        { 
            name: 'Event Requests', 
            icon: Award, 
            badge: pendingEventRequests.length > 0 ? pendingEventRequests.length : null 
        },
        { name: 'Recruitment', icon: UserPlus },
        { name: 'Students', icon: Users },
        { name: 'Announcements', icon: Bell },
        { name: 'Gallery', icon: Image },
        { name: 'Profile', icon: User },
    ];

    if (!user) return <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div><span className="sr-only">Loading...</span></div>;

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-slate-950' : 'bg-[#f9f8f6]'}`}>
            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileSidebarOpen(false)} aria-hidden="true" />
            )}

            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-50 shadow-2xl ${mobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} md:translate-x-0 ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`} role="navigation">
                <div className="flex flex-col h-full">
                    <div className="p-4 md:p-6 border-b border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">GP</div>
                            {(!sidebarCollapsed || mobileSidebarOpen) && <span className="font-bold text-lg uppercase tracking-tight">Campus Pulse</span>}
                        </div>
                        <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"><X size={20} /></button>
                    </div>

                    <nav className="flex-1 py-4 md:py-6 px-3 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeRoute === item.name;
                            return (
                                <button key={item.name} onClick={() => handleRouteChange(item.name)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${sidebarCollapsed && !mobileSidebarOpen ? 'justify-center' : ''}`}>
                                    <Icon size={20} />
                                    {(!sidebarCollapsed || mobileSidebarOpen) && <span className="font-medium flex-1 text-left">{item.name}</span>}
                                    {(!sidebarCollapsed || mobileSidebarOpen) && item.badge && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${isActive ? 'bg-white/30 text-white' : 'bg-amber-500 text-white'}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-700/50">
                        <div className={`flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl ${sidebarCollapsed && !mobileSidebarOpen ? 'justify-center' : ''}`}>
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{user.name.charAt(0)}</div>
                            {(!sidebarCollapsed || mobileSidebarOpen) && (
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold truncate">{user.name}</p>
                                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Collapse Toggle (desktop only) */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronRight size={14} className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                </button>
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 ml-0 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                <header className={`sticky top-0 z-30 backdrop-blur-xl border-b shadow-sm transition-colors duration-300 ${darkMode ? 'bg-slate-900/90 border-slate-700/60' : 'bg-white/80 border-slate-200/60'}`}>
                    <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4">
                        <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"><Menu size={24} className="text-slate-700" /></button>
                        <div className="hidden sm:block">
                            <h1 className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{getGreeting()}, <span className="text-blue-500">{user.name.split(' ')[0]}</span></h1>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4 flex-1 sm:flex-none justify-end">
                            <DarkModeToggle />

                            {/* Notification Bell */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => {
                                        if (notifOpen || notifClosing) { closeNotifPanel(); }
                                        else { setNotifOpen(true); fetchNotifications(); }
                                    }}
                                    className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                                >
                                    <Bell size={20} className={(notifOpen || notifClosing) ? 'text-blue-600' : 'text-slate-600'} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-0.5" aria-hidden="true">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown Panel */}
                                {(notifOpen || notifClosing) && (
                                    <div className={`absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden ${notifClosing ? 'animate-notifSlideOut' : 'animate-notifSlide'}`}>
                                        {/* Panel Header */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                                            <div className="flex items-center gap-2">
                                                <Bell size={16} className="text-blue-600" />
                                                <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {unreadCount > 0 && (
                                                    <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors" title="Mark all as read">
                                                        <CheckCheck size={13} /> All read
                                                    </button>
                                                )}
                                                {visibleNotifications.length > 0 && (
                                                    <button onClick={clearAllNotifications} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold px-2 py-1 hover:bg-red-50 rounded-lg transition-colors" title="Clear all">
                                                        <Trash2 size={13} /> Clear
                                                    </button>
                                                )}
                                                <button onClick={closeNotifPanel} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Notification List */}
                                        <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
                                            {notifLoading ? (
                                                <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
                                                    <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                                                    <span className="text-sm">Loading…</span>
                                                </div>
                                            ) : visibleNotifications.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                                                        <Bell size={22} className="text-slate-300" />
                                                    </div>
                                                    <p className="text-sm font-medium">All caught up!</p>
                                                    <p className="text-xs mt-1">No notifications</p>
                                                </div>
                                            ) : visibleNotifications.map(notif => {
                                                const isUnread = !readIds.has(notif.id);
                                                const cfg = {
                                                    event: { bg: 'bg-blue-100', text: 'text-blue-600', Icon: Calendar, label: 'Event' },
                                                    announcement: { bg: 'bg-amber-100', text: 'text-amber-600', Icon: Bell, label: 'Announcement' },
                                                    recruitment: { bg: 'bg-emerald-100', text: 'text-emerald-600', Icon: BriefcaseBusiness, label: 'Recruitment' },
                                                }[notif.type] || { bg: 'bg-slate-100', text: 'text-slate-600', Icon: Bell, label: 'Notice' };
                                                const TypeIcon = cfg.Icon;
                                                return (
                                                    <button
                                                        key={notif.id}
                                                        onClick={() => handleNotifClick(notif)}
                                                        className={`w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors ${isUnread ? 'bg-blue-50/40' : ''}`}
                                                    >
                                                        <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                            <TypeIcon size={16} className={cfg.text} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-1">
                                                                <p className={`text-sm leading-snug truncate ${isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>{notif.title}</p>
                                                                {isUnread && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{notif.subtitle}</p>
                                                            <p className="text-[10px] text-slate-400 mt-1">{timeAgo(notif.time)}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setShowProfilePanel(true)} className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden ring-2 ring-blue-500/30 shadow-md hover:ring-blue-500/60 transition-all">
                                {user.profilePic?.url ? <img src={user.profilePic.url} alt={user.name} className="w-full h-full object-cover" /> : <span className="bg-blue-100 text-blue-600 w-full h-full flex items-center justify-center">{user.name.charAt(0)}</span>}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-6 lg:p-8">
                    {activeRoute === 'Dashboard' && (
                        <div className="animate-fadeIn space-y-6 md:space-y-8">
                            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 md:p-10 text-white shadow-xl">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">Faculty Portal</p>
                                        <h2 className="text-3xl md:text-4xl font-black">{getGreeting()}, {user.name.split(' ')[0]} 👋</h2>
                                        <p className="text-blue-100 mt-2 text-base max-w-md opacity-90">Manage your department activities, events, and student engagements from one central hub.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setShowProfilePanel(true)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 transition-all font-semibold text-sm">View Profile</button>
                                        <button onClick={() => handleRouteChange('Events')} className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm shadow-lg hover:shadow-white/20 hover:scale-105 transition-all">Create Event</button>
                                    </div>
                                </div>
                            </div>

                            {renderStats()}

                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                    <h3 className="font-extrabold text-slate-800 text-lg">Quick Actions</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                                    {[
                                        { title: 'Create Event', desc: 'Schedule a new campus event', icon: Plus, color: 'blue', onClick: () => handleRouteChange('Events') },
                                        { title: 'Post Announcement', desc: 'Share news with students', icon: Bell, color: 'violet', onClick: () => handleRouteChange('Announcements') },
                                        { title: 'Review Applicants', desc: 'Check recruitment applications', icon: UserCheck, color: 'emerald', onClick: () => handleRouteChange('Recruitment') },
                                    ].map(a => {
                                        const gradients = { blue: 'from-blue-500 to-indigo-500', violet: 'from-violet-500 to-purple-500', emerald: 'from-emerald-500 to-teal-500' };
                                        const Icon = a.icon;
                                        return (
                                            <button key={a.title} onClick={a.onClick} className="group text-left bg-white border border-slate-100 hover:border-blue-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[a.color]} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                                    <Icon size={22} className="text-white" />
                                                </div>
                                                <p className="font-bold text-slate-900 text-base">{a.title}</p>
                                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{a.desc}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeRoute === 'Events' && <Events userRole={user.role} user={user} />}
                    {activeRoute === 'Event Requests' && <EventApprovalsView 
                        pendingEventRequests={pendingEventRequests} 
                        fetchEventRequests={fetchEventRequests} 
                        showToast={(msg, type) => showToast ? showToast(msg, type) : alert(msg)} 
                        openConfirm={openConfirm} 
                        closeConfirm={closeConfirm} 
                        setConfirmDialog={setConfirmDialog} 
                    />}
                    {activeRoute === 'Recruitment' && <FacultyRecruitmentView axiosInstance={axiosInstance} user={user} />}
                    {activeRoute === 'Students' && (
                        <div className="animate-fadeIn">
                            <SectionHeader icon={Users} title={`Students · ${user.branch}`} color="emerald" subtitle={`${students.length} student${students.length !== 1 ? 's' : ''} in your department`} />
                            {loading.students ? <Loader /> : (
                                <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Student</th>
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Email</th>
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {students.map((student, i) => {
                                                    const initials = student.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                                                    return (
                                                        <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 text-sm font-bold shadow-sm">{initials}</div>
                                                                    <span className="text-sm font-bold text-slate-800">{student.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-sm font-medium text-slate-500">{student.email}</td>
                                                            <td className="px-6 py-5 text-center">
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 uppercase tracking-tighter shadow-sm">Active</span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {students.length === 0 && (
                                                    <tr><td colSpan="3" className="px-6 py-16 text-center text-slate-400 font-medium font-italic">No students found</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {activeRoute === 'Announcements' && <Announcements userRole={user.role} user={user} />}
                    {activeRoute === 'Gallery' && <FacultyGalleryView axiosInstance={axiosInstance} user={user} />}
                    {activeRoute === 'Profile' && (
                        <div className="animate-fadeIn max-w-4xl mx-auto">
                            <SectionHeader icon={User} title="Faculty Profile" color="blue" subtitle="Manage your account settings and personal information" />
                            <FacultyProfileCard user={user} stats={stats} onUserUpdate={(u) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); }} onLogout={handleLogout} />
                        </div>
                    )}
                </div>
            </main>

            <ProfileModal open={showProfilePanel} onClose={() => setShowProfilePanel(false)} user={user} onUserUpdate={(u) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); setShowProfilePanel(false); }} onLogout={handleLogout} />

            {/* Global Overlay Components */}
            {toast && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-2xl animate-fadeIn flex items-center gap-3 border ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-slate-900 border-slate-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
                    <span className="font-bold text-sm tracking-tight">{toast.msg}</span>
                </div>
            )}

            <ConfirmDialog
                {...confirmDialog}
                onClose={closeConfirm}
            />

            <SuccessModal
                open={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                eventDetails={successEvent}
                hideActions={true}
                autoCloseMs={2000}
            />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                .dark .bg-white { background-color: #1e293b !important; }
                .dark .text-slate-900 { color: #f8fafc !important; }
                .dark .text-slate-800 { color: #f1f5f9 !important; }
                .dark .text-slate-700 { color: #e2e8f0 !important; }
                .dark .text-slate-600 { color: #cbd5e1 !important; }
                .dark .text-slate-500 { color: #94a3b8 !important; }
                .dark .border-slate-200 { border-color: #334155 !important; }
                .dark .border-slate-100 { border-color: #334155 !important; }
                .dark .bg-slate-50 { background-color: #0f172a !important; }
                .dark .bg-slate-100 { background-color: #0f172a !important; }
                .dark .hover\\:bg-slate-50:hover { background-color: #334155 !important; }
                .dark input, .dark select, .dark textarea { 
                    background-color: #0f172a !important; 
                    border-color: #334155 !important;
                    color: #f1f5f9 !important;
                }
            `}</style>
        </div>
    );
};

export default FacultyDashboard;
