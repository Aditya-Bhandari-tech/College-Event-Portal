import React, { useState, useMemo } from 'react';
import { X, Users, FileText, Search, Filter } from 'lucide-react';

import { BRANCHES } from '../../utils/constants';

const YEARS = [
    { value: 'ALL', label: 'All Years' },
    { value: 'First Year', label: 'First Year' },
    { value: 'Second Year', label: 'Second Year' },
    { value: 'Third Year', label: 'Third Year' },
];

const AttendeesModal = ({ event, onClose, userRole, onDownloadPDF }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('ALL');
    const [yearFilter, setYearFilter] = useState('ALL');
    const [showExportConfirm, setShowExportConfirm] = useState(false);

    const filteredAttendees = useMemo(() => {
        let list = (event.registrations || []).filter(a => a && typeof a === 'object' && (a.name || a.email));

        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            list = list.filter(a =>
                a.name?.toLowerCase().includes(s) ||
                a.email?.toLowerCase().includes(s) ||
                a.phone?.includes(s)
            );
        }

        if (branchFilter !== 'ALL') {
            list = list.filter(a => a.branch === branchFilter);
        }

        if (yearFilter !== 'ALL') {
            list = list.filter(a => a.year === yearFilter);
        }

        return list;
    }, [event.registrations, searchTerm, branchFilter, yearFilter]);

    if (!event) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">Event Attendees</h3>
                            <p className="text-sm text-slate-500 mt-1">{event.title} • {filteredAttendees.length} Students</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email or mobile..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {(userRole === 'admin' || userRole?.toLowerCase() === 'admin') && (
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                            >
                                {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                        >
                            {YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-auto p-6 bg-slate-50/30">
                    {filteredAttendees.length > 0 ? (
                        <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Student Details</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Academic</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Contact Info</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAttendees.map((student, idx) => (
                                        <tr key={student._id || idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">{student.name || 'Anonymous Student'}</span>
                                                    <span className="text-xs text-slate-500">{student.email || 'No email provided'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase self-start">
                                                        {student.branch || 'Not Specified'}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-600">{student.year || 'Not Specified'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-700">{student.phone || 'No mobile number'}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Mobile Number</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Users size={32} className="text-slate-200" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-lg">
                                {(event.registrations || []).length === 0 ? 'No Students Registered Yet' : 'No Results Found'}
                            </h4>
                            <p className="text-sm text-slate-500 mt-1 max-w-xs text-center">
                                {(event.registrations || []).length === 0
                                    ? 'Registration for this event is still open. Students will appear here once they sign up.'
                                    : "We couldn't find any students matching your current search or filter criteria."}
                            </p>
                            {(searchTerm || branchFilter !== 'ALL' || yearFilter !== 'ALL') && (
                                <button
                                    onClick={() => { setSearchTerm(''); setBranchFilter('ALL'); setYearFilter('ALL'); }}
                                    className="mt-4 text-blue-600 font-bold text-sm hover:underline"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                    <button
                        onClick={() => setShowExportConfirm(true)}
                        disabled={filteredAttendees.length === 0}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                        <FileText size={18} />
                        Export Filtered List (PDF)
                    </button>
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Export Confirmation Modal */}
            {showExportConfirm && (
                <div className="fixed inset-0 bg-black/50 z-[110] backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-fadeIn">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={30} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 mb-2">Confirm Download</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Are you sure you want to download the attendee list for <span className="font-semibold text-slate-700">"{event.title}"</span>?
                            <br />
                            <span className="text-xs mt-2 block italic text-slate-400">
                                This will include {filteredAttendees.length} filtered records.
                            </span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowExportConfirm(false)}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Close modal first to provide immediate feedback
                                    setShowExportConfirm(false);
                                    // Trigger actual PDF generation and download
                                    if (typeof onDownloadPDF === 'function') {
                                        onDownloadPDF({ ...event, registrations: filteredAttendees });
                                    }
                                }}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/30"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendeesModal;
