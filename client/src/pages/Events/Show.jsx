import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios'; // Adjust path to your custom api instance
import { useToast } from '../../components/ToastContainer';

export default function EventShow() {
    const { id } = useParams();
    const { addToast } = useToast();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchEvent = () => api.get(`/events/${id}`).then(response => setEvent(response.data));

    useEffect(() => {
        fetchEvent()
            .catch(error => console.error('Error loading event', error))
            .finally(() => setLoading(false));
    }, [id]);

    const handleRegister = async () => {
        try {
            const response = await api.post(`/events/${id}/register`);
            setEvent(response.data.data);
            addToast('Registered successfully!', 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Unable to register.', 'error');
        }
    };

    const handleUnregister = async () => {
        try {
            await api.delete(`/events/${id}/register`);
            await fetchEvent();
            addToast('Unregistered successfully!', 'success');
        } catch {
            addToast('Unable to unregister.', 'error');
        }
    };

    if (loading) return <div className="p-6 text-center text-white">Loading...</div>;
    if (!event) return <div className="p-6 text-center text-white">Event not found.</div>;

    const isRegistered = event.attendees?.some(attendee => attendee.id === currentUser.id);

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                    {event.status}
                </span>
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <p className="text-sm text-gray-500">Hosted by: <span className="font-medium">{event.host?.name}</span></p>
                <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                <p className="text-sm text-gray-600">
                    Attendance: {event.attendees_count || 0}{event.max_attendees ? ` / ${event.max_attendees}` : ' (unlimited)'}
                </p>
                
                <div className="flex space-x-4 pt-4 border-t border-gray-100">
                    {isRegistered ? (
                        <button onClick={handleUnregister} className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded-md hover:bg-gray-300">
                            Unregister
                        </button>
                    ) : (
                        <button
                            onClick={handleRegister}
                            disabled={event.is_full}
                            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {event.is_full ? 'Fully Booked' : 'Register'}
                        </button>
                    )}
                </div>
                <div>
                    <Link to="/events" className="text-indigo-600 text-sm hover:underline">&larr; Back to Events</Link>
                </div>
            </div>
        </div>
    );
}
