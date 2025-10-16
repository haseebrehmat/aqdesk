import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios'; // Adjust path to your custom api instance

export default function EventShow() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/events/${id}`)
            .then(response => setEvent(response.data))
            .catch(error => console.error('Error loading event', error))
            .finally(() => setLoading(false));
    }, [id]);

    const handleRegister = async () => {
        try {
            await api.post(`/events/${id}/register`);
            alert('Registered successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error');
        }
    };

    const handleUnregister = async () => {
        try {
            await api.delete(`/events/${id}/register`);
            alert('Unregistered successfully!');
        } catch (error) {
            alert('Error unregistering');
        }
    };

    if (loading) return <div className="p-6 text-center text-white">Loading...</div>;
    if (!event) return <div className="p-6 text-center text-white">Event not found.</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                    {event.status}
                </span>
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <p className="text-sm text-gray-500">Hosted by: <span className="font-medium">{event.host?.name}</span></p>
                <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                
                <div className="flex space-x-4 pt-4 border-t border-gray-100">
                    <button onClick={handleRegister} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700">
                        Register
                    </button>
                    <button onClick={handleUnregister} className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded-md hover:bg-gray-300">
                        Unregister
                    </button>
                </div>
                <div>
                    <Link to="/events" className="text-indigo-600 text-sm hover:underline">&larr; Back to Events</Link>
                </div>
            </div>
        </div>
    );
}