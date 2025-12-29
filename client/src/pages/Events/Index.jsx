import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../components/ToastContainer';
import { Loader2 } from 'lucide-react';

export default function EventIndex() {
    const { addToast } = useToast();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching events', error);
            addToast('Failed to load events.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleRegister = async (eventId) => {
        try {
            await api.post(`/events/${eventId}/register`);
            addToast('Successfully registered for the event!', 'success');
            fetchEvents();
        } catch (error) {
            addToast(error.response?.data?.message || 'Error registering for event', 'error');
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                <p className="mt-2 text-sm">Loading events...</p>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Events & Webinars</h1>
                </div>
                <Link
                    to="/events/create"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center space-x-2 transition w-fit"
                >
                    <span>Create Event</span>
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <p className="text-base font-medium text-slate-300">No events found</p>
                    <p className="text-xs text-slate-400 mt-1">Be the first one to create an event!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => {
                        const isHost = event.host_id === currentUser?.id || event.host?.id === currentUser?.id;
                        const isRegistered = event.attendees?.some((attendee) => attendee.id === currentUser?.id);

                        return (
                            <div
                                key={event.id}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-4 hover:border-slate-700 transition"
                            >
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                                            {event.status}
                                        </span>
                                        {isHost && (
                                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                                Host
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {event.title}
                                    </h3>
                                    <p className="text-slate-300 text-sm line-clamp-2">{event.description}</p>
                                    
                                    <div className="text-xs text-slate-400 space-y-1 pt-1">
                                        {event.scheduled_at && (
                                            <p><span className="font-medium text-slate-300">Scheduled At:</span> {new Date(event.scheduled_at).toLocaleString()}</p>
                                        )}
                                        {event.ends_at && (
                                            <p><span className="font-medium text-slate-300">Ends At:</span> {new Date(event.ends_at).toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 shrink-0 text-xs text-slate-400">
                                    <div>
                                        <span className="font-medium text-slate-300">Host:</span> {event.host?.name || "Anonymous"}
                                    </div>
                                    <div className="flex items-center space-x-2 mt-3">
                                        <Link
                                            to={`/events/${event.id}`}
                                            className="text-blue-400 hover:underline font-medium text-xs px-2.5 py-1"
                                        >
                                            View Details &rarr;
                                        </Link>
                                        
                                        {isHost ? (
                                            <span className="text-emerald-400 font-medium text-xs px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                                Hosting
                                            </span>
                                        ) : isRegistered ? (
                                            <span className="text-slate-400 font-medium text-xs px-3 py-1.5 bg-slate-800 rounded-xl">
                                                Registered
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleRegister(event.id)}
                                                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-xl font-medium transition"
                                            >
                                                Register
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
