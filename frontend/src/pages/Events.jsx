import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Calendar, MapPin, Search, Clock, Users } from 'lucide-react';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const Events = ({ userRole }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming'); // upcoming, past, all
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/events');
            setEvents(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredEvents = () => {
        const now = new Date();
        let filtered = events;

        if (filter === 'upcoming') {
            filtered = events.filter(e => new Date(e.date) >= now);
        } else if (filter === 'past') {
            filtered = events.filter(e => new Date(e.date) < now);
        }

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

    const filteredEvents = getFilteredEvents();

    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Events</h2>

                <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto" role="tablist" aria-label="Event filters">
                    {['upcoming', 'past', 'all'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium capitalize transition-all flex-1 sm:flex-initial ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            role="tab"
                            aria-selected={filter === f}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-2 w-full sm:max-w-md">
                <Search size={20} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Search events..."
                    className="flex-1 outline-none text-slate-700 min-w-0"
                    aria-label="Search events"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? <Loader /> : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredEvents.length > 0 ? filteredEvents.map(event => (
                        <article key={event._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col h-full">
                            <div className="relative h-36 sm:h-48">
                                <img
                                    src={event.image || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop'}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${new Date(event.date) >= new Date() ? 'bg-blue-500 text-white' : 'bg-slate-500 text-white'}`}>
                                        {new Date(event.date) >= new Date() ? 'Upcoming' : 'Completed'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-lg text-slate-900 mb-2">{event.title}</h3>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar size={16} className="text-blue-500" />
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Clock size={16} className="text-amber-500" />
                                        <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <MapPin size={16} className="text-red-500" />
                                        <span>{event.venue}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Users size={16} className="text-emerald-500" />
                                        <span>{event.branch || 'All Branches'}</span>
                                    </div>
                                </div>

                                {userRole === 'student' && new Date(event.date) >= new Date() && (
                                    <button onClick={() => alert("Registration feature coming soon!")} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors">
                                        Register
                                    </button>
                                )}
                            </div>
                        </article>
                    )) : (
                        <div className="col-span-full">
                            <EmptyState message={`No ${filter} events found.`} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Events;
