import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../components/ToastContainer';
import { Loader2 } from 'lucide-react';

export default function PodcastCreate() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        title: '',
        description: '',
        media_url: '',
        cover_image_url: '',
        duration_in_minutes: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await api.post('/podcasts', form);
            addToast('Podcast episode published successfully!', 'success');
            navigate('/podcasts');
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                addToast('Please check the form for validation errors.', 'error');
            } else {
                addToast(error.response?.data?.message || 'Failed to publish podcast episode.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 font-sans text-white">
            <h1 className="text-2xl font-bold mb-6">Publish Podcast Episode</h1>
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
                    {errors.description && <span className="text-red-400 text-xs mt-1 block">{errors.description[0]}</span>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Media URL</label>
                    <input
                        type="url"
                        value={form.media_url}
                        onChange={e => setForm({ ...form, media_url: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    {errors.media_url && <span className="text-red-400 text-xs mt-1 block">{errors.media_url[0]}</span>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Cover Image URL</label>
                    <input
                        type="url"
                        value={form.cover_image_url}
                        onChange={e => setForm({ ...form, cover_image_url: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    {errors.cover_image_url && <span className="text-red-400 text-xs mt-1 block">{errors.cover_image_url[0]}</span>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Duration (minutes)</label>
                    <input
                        type="number"
                        value={form.duration_in_minutes}
                        onChange={e => setForm({ ...form, duration_in_minutes: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    {errors.duration_in_minutes && <span className="text-red-400 text-xs mt-1 block">{errors.duration_in_minutes[0]}</span>}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                    <Link to="/podcasts" className="px-4 py-2.5 border border-slate-800 rounded-xl text-slate-300 text-sm hover:bg-slate-800 transition">Cancel</Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Publish</span>}
                    </button>
                </div>
            </form>
        </div>
    );
}
