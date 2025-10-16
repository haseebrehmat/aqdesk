import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../components/ToastContainer';
import { Loader2 } from 'lucide-react';

export default function EventCreate() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        webinar_url: '',
        scheduled_at: '',
        ends_at: '',
    });
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await api.post('/events', form);
            addToast('Event created successfully!', 'success');
            navigate('/events');
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                addToast('Please check the form for validation errors.', 'error');
            } else {
                addToast(error.response?.data?.message || 'Failed to create event.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 font-sans text-white">
            <h1 className="text-2xl font-bold mb-6">Create Event</h1>
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    {errors.title && <span className="text-red-400 text-xs mt-1 block">{errors.title[0]}</span>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                    <textarea
                        rows={4}
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Webinar URL</label>
                    <input
                        type="url"
                        value={form.webinar_url}
                        onChange={e => setForm({ ...form, webinar_url: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    {errors.webinar_url && <span className="text-red-400 text-xs mt-1 block">{errors.webinar_url[0]}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Scheduled At</label>
                        <input
                            type="datetime-local"
                            value={form.scheduled_at}
                            onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                        {errors.scheduled_at && <span className="text-red-400 text-xs mt-1 block">{errors.scheduled_at[0]}</span>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Ends At</label>
                        <input
                            type="datetime-local"
                            value={form.ends_at}
                            onChange={e => setForm({ ...form, ends_at: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                        {errors.ends_at && <span className="text-red-400 text-xs mt-1 block">{errors.ends_at[0]}</span>}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                    <Link to="/events" className="px-4 py-2.5 border border-slate-800 rounded-xl text-slate-300 text-sm hover:bg-slate-800 transition">Cancel</Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Event</span>}
                    </button>
                </div>
            </form>
        </div>
    );
}