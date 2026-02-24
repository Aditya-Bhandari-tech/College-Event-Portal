import React from 'react';
import {
    Calendar, Users, Award, Trash, Edit,
    ChevronDown, FileText, Trash2, Mail
} from 'lucide-react';

/**
 * Premium Recruitment Card Component
 * Used in both Admin and Faculty Dashboards
 */
const RecruitmentCard = ({
    rec,
    onEdit,
    onDelete,
    onToggleApplicants,
    isExpanded,
    applicants = [],
    loadingApplicants = false,
    onUpdateApplicantStatus,
    onCloseRecruitment,
    userRole // 'admin' or 'faculty'
}) => {
    const isFaculty = userRole === 'faculty';

    const statusBadge = (s) => s === 'open'
        ? <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm bg-emerald-500 text-white">Open</span>
        : <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm bg-slate-500 text-white">Closed</span>;

    const applicantBadge = (s) => {
        const map = {
            selected: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
            applied: 'bg-amber-100 text-amber-700 border-amber-200'
        };
        return (
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full capitalize border shadow-sm ${map[s] || map.applied}`}>
                {s}
            </span>
        );
    };

    return (
        <div className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-500 overflow-hidden">
            {/* Main Card Content */}
            <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between gap-5">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="font-extrabold text-slate-900 text-lg md:text-xl tracking-tight group-hover:text-violet-700 transition-colors">
                            {rec.title}
                        </h3>
                        {statusBadge(rec.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-xl text-xs font-bold border border-violet-100 uppercase tracking-tight">
                            <Award size={14} /> {rec.roleType}
                        </div>

                        {rec.event && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                                <Calendar size={14} className="text-violet-400" /> {rec.event.title}
                            </div>
                        )}

                        {rec.branch && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                                <Users size={14} className="text-blue-400" /> {rec.branch === 'ALL' ? 'All Branches' : rec.branch}
                            </div>
                        )}
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-2 md:line-clamp-none">
                        {rec.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-auto">
                        <button
                            onClick={() => onToggleApplicants(rec._id)}
                            className={`inline-flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-2xl transition-all shadow-sm active:scale-95 ${isExpanded
                                ? 'bg-violet-600 text-white shadow-violet-200'
                                : 'bg-slate-900 text-white hover:bg-violet-700 shadow-slate-200'
                                }`}
                        >
                            <Users size={16} />
                            {isExpanded ? 'Hide Applicants' : `View ${rec.applicants?.length || 0} Applicant${(rec.applicants?.length || 0) !== 1 ? 's' : ''}`}
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {!isFaculty && rec.status === 'open' && onCloseRecruitment && (
                            <button
                                onClick={() => onCloseRecruitment(rec._id)}
                                className="px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-2xl text-xs font-black border border-amber-200 transition-colors uppercase tracking-wider"
                            >
                                Close Post
                            </button>
                        )}
                    </div>
                </div>

                {/* Responsive Desktop Actions */}
                <div className="flex md:flex-col gap-2 justify-end items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button
                        onClick={() => onEdit(rec)}
                        className="p-3 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-2xl transition-all border border-transparent hover:border-violet-100"
                        title="Edit Recruitment"
                    >
                        <Edit size={20} />
                    </button>
                    <button
                        onClick={() => onDelete(rec._id)}
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                        title="Delete Post"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Expandable Applicants Panel */}
            {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-5 md:p-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-5">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} /> Applicant Details
                        </h4>
                        <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-full shadow-sm">
                            {applicants.length} Total
                        </span>
                    </div>

                    {loadingApplicants ? (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                        </div>
                    ) : applicants.length === 0 ? (
                        <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-200 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                <Users size={30} className="text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-bold">No applications yet</p>
                            <p className="text-slate-400 text-xs mt-1">Check back later once students start applying.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {applicants.map(app => (
                                <div key={app._id} className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-lg transition-all duration-300 group/app">
                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-lg shadow-indigo-100">
                                        {app.student?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-extrabold text-slate-900 text-base mb-0.5">{app.student?.name || 'Unknown User'}</p>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-1.5"><Mail size={12} className="text-violet-400" /> {app.student?.email}</span>
                                            <span className="flex items-center gap-1.5"><Award size={12} className="text-indigo-400" /> {app.student?.branch}</span>
                                        </div>
                                        {app.note && (
                                            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 italic relative">
                                                <span className="absolute -top-2 left-3 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 rounded-md">Note</span>
                                                "{app.note}"
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto self-end sm:self-center">
                                        {applicantBadge(app.status)}
                                        {app.status === 'applied' && onUpdateApplicantStatus && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onUpdateApplicantStatus(rec._id, app._id, 'selected')}
                                                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95"
                                                >Select</button>
                                                <button
                                                    onClick={() => onUpdateApplicantStatus(rec._id, app._id, 'rejected')}
                                                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-black hover:bg-red-100 transition-all active:scale-95"
                                                >Reject</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecruitmentCard;
