import React, { useState } from 'react';
import {
    User, Mail, Phone, MapPin, Calendar, LogOut,
    Edit2, BookOpen, GraduationCap, Clock
} from 'lucide-react';
import ProfileModal from './ProfileModal';

/**
 * FacultyProfileCard
 * A rich, visible profile card for the Faculty Dashboard "Profile" section.
 * Reuses the shared <ProfileModal> for view/edit/logout.
 *
 * Props:
 *   user        – current faculty user object
 *   stats       – { ongoing, upcoming, finished, students }
 *   onUserUpdate(updatedUser) – callback after profile save
 *   onLogout()  – callback to perform logout
 */
const FacultyProfileCard = ({ user, stats = {}, onUserUpdate, onLogout }) => {
    const [showModal, setShowModal] = useState(false);

    if (!user) return null;

    const joinDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : null;

    // Info rows — only rendered if value exists
    const infoRows = [
        { icon: Mail, label: 'Email', value: user.email, color: 'indigo' },
        { icon: MapPin, label: 'Branch', value: user.branch, color: 'emerald' },
        { icon: Phone, label: 'Phone', value: user.phone, color: 'violet' },
        { icon: BookOpen, label: 'Department', value: user.department, color: 'amber' },
        { icon: GraduationCap, label: 'Designation', value: user.designation, color: 'rose' },
        { icon: Clock, label: 'Joined', value: joinDate, color: 'slate' },
    ].filter(row => row.value);

    const colorMap = {
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
        emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
        violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
        rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
        slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
    };

    const statCards = [
        { label: 'Ongoing', value: stats.ongoing ?? 0, color: 'blue' },
        { label: 'Upcoming', value: stats.upcoming ?? 0, color: 'indigo' },
        { label: 'Done', value: stats.finished ?? 0, color: 'emerald' },
        { label: 'Students', value: stats.students ?? 0, color: 'amber' },
    ];

    const statColorMap = {
        blue: 'from-blue-500    to-blue-600',
        indigo: 'from-indigo-500  to-indigo-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500   to-amber-600',
    };

    return (
        <>
            <div className="max-w-xl mx-auto space-y-5 animate-fadeIn">

                {/* ── Hero card ─────────────────────────────────────────────────── */}
                <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
                    {/* Banner */}
                    <div className="h-28 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 relative">
                        <div className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                            }}
                        />
                    </div>

                    {/* Avatar */}
                    <div className="flex justify-center -mt-14 mb-3 relative z-10">
                        {user.profilePic?.url ? (
                            <img
                                src={user.profilePic.url}
                                alt={user.name}
                                className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-xl"
                            />
                        ) : (
                            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-4xl text-white ring-4 ring-white shadow-xl">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Name + badge */}
                    <div className="text-center px-6 pb-5">
                        <h2 className="font-bold text-2xl text-slate-900">{user.name}</h2>
                        <span className="inline-block mt-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full capitalize">
                            Faculty
                        </span>
                        {user.branch && (
                            <p className="text-sm text-slate-500 mt-1">{user.branch}</p>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="px-6 pb-6 flex gap-3">
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                        >
                            <Edit2 size={15} />
                            Edit Profile
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-colors"
                        >
                            <LogOut size={15} />
                            Logout
                        </button>
                    </div>
                </div>

                {/* ── Stats row ─────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statCards.map(s => (
                        <div
                            key={s.label}
                            className={`bg-gradient-to-br ${statColorMap[s.color]} text-white rounded-2xl p-4 text-center shadow-sm`}
                        >
                            <p className="text-2xl font-extrabold">{s.value}</p>
                            <p className="text-xs font-medium opacity-80 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Info rows ─────────────────────────────────────────────────── */}
                {infoRows.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-5 space-y-2.5">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                            Contact &amp; Details
                        </h3>
                        {infoRows.map(({ icon: Icon, label, value, color }) => {
                            const c = colorMap[color] || colorMap.slate;
                            return (
                                <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                    <div className={`w-8 h-8 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                        <Icon size={14} className={c.text} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
                                        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Quick tips card ───────────────────────────────────────────── */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-5">
                    <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
                        Quick Reminders
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                            Review pending student event requests in <strong className="text-slate-800 ml-1">Event Requests</strong>.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                            Accept or reject applicants via <strong className="text-slate-800 ml-1">Recruitment</strong>.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                            Upload event photos in the <strong className="text-slate-800 ml-1">Gallery</strong> section.
                        </li>
                    </ul>
                </div>
            </div>

            {/* ── Shared ProfileModal ───────────────────────────────────────── */}
            <ProfileModal
                open={showModal}
                onClose={() => setShowModal(false)}
                user={user}
                onUserUpdate={(updated) => {
                    onUserUpdate?.(updated);
                    setShowModal(false);
                }}
                onLogout={() => {
                    onLogout?.(); // triggers window.location.replace → full reload
                }}
            />
        </>
    );
};

export default FacultyProfileCard;
