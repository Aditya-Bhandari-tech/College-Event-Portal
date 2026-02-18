import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Bell, Search, User } from 'lucide-react';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/announcements');
            setAnnouncements(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAnnouncements = announcements.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fadeIn">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Announcements</h2>

            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-2 w-full sm:max-w-md">
                <Search size={20} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Search updates..."
                    className="flex-1 outline-none text-slate-700 min-w-0"
                    aria-label="Search announcements"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? <Loader /> : (
                <div className="space-y-4">
                    {filteredAnnouncements.length > 0 ? filteredAnnouncements.map(ann => (
                        <article key={ann._id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg sm:text-xl">
                                    {(ann.createdBy?.name || 'A').charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg text-slate-900">{ann.title}</h3>
                                                {ann.important && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                                        Important
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Posted by <span className="font-medium text-slate-700">{ann.createdBy?.name || 'Admin'}</span> • {new Date(ann.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed">{ann.message}</p>
                                </div>
                            </div>
                        </article>
                    )) : (
                        <EmptyState message="No announcements found." />
                    )}
                </div>
            )}
        </div>
    );
};

export default Announcements;
