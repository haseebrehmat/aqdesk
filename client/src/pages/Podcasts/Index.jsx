import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../components/ToastContainer';
import { Loader2, Mic } from 'lucide-react';

export default function PodcastIndex() {
    const { addToast } = useToast();
    const [podcasts, setPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        api.get('/podcasts')
            .then(response => setPodcasts(response.data.data || response.data))
            .catch(error => {
                console.error(error);
                addToast('Failed to load podcasts.', 'error');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                <p className="mt-2 text-sm">Loading podcasts...</p>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Mic className="w-7 h-7 text-blue-500" /> Expert Podcasts
                    </h1>
                </div>
                <Link
                    to="/podcasts/create"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center space-x-2 transition w-fit"
                >
                    <span>Publish Podcast</span>
                </Link>
            </div>

            {podcasts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <p className="text-base font-medium text-slate-300">No podcast episodes found</p>
                    <p className="text-xs text-slate-400 mt-1">Be the first one to publish a podcast episode!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {podcasts.map((podcast) => {
                        const isHost = podcast.expert_id === currentUser?.id || podcast.expert?.id === currentUser?.id;

                        return (
                            <div
                                key={podcast.id}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700 transition"
                            >
                                <div className="flex items-center space-x-4 flex-1">
                                    <img
                                        src={podcast.cover_image_url || 'https://via.placeholder.com/150'}
                                        alt={podcast.title}
                                        className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                                    />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {isHost && (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                                    Your Episode
                                                </span>
                                            )}
                                            {podcast.duration_in_minutes && (
                                                <span className="text-xs text-slate-400">
                                                    {podcast.duration_in_minutes} mins
                                                </span>
                                            )}
                                        </div>
                                        <Link
                                            to={`/podcasts/${podcast.id}`}
                                            className="text-lg font-semibold text-white hover:text-blue-400 transition block"
                                        >
                                            {podcast.title}
                                        </Link>
                                        <p className="text-xs text-slate-400">Expert: <span className="text-slate-300">{podcast.expert?.name || "Anonymous"}</span></p>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 flex items-center justify-between md:justify-end gap-4">
                                    <audio controls className="h-10 accent-blue-500 max-w-[240px] sm:max-w-xs">
                                        <source src={podcast.media_url} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}