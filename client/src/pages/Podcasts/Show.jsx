import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios'; // Adjust path to your custom api instance

export default function PodcastShow() {
    const { id } = useParams();
    const [podcast, setPodcast] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/podcasts/${id}`)
            .then(response => setPodcast(response.data))
            .catch(error => console.error('Error loading podcast', error))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-6 text-center text-white">Loading podcast...</div>;
    if (!podcast) return <div className="p-6 text-center text-white">Podcast episode not found.</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-6">
                <div className="flex items-center space-x-4">
                    <img
                        src={podcast.cover_image_url || 'https://via.placeholder.com/150'}
                        alt={podcast.title}
                        className="w-24 h-24 rounded-lg object-cover shadow-sm"
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{podcast.title}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Expert: <span className="font-medium text-gray-800">{podcast.expert?.name}</span>
                        </p>
                        {podcast.duration_in_minutes && (
                            <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                {podcast.duration_in_minutes} minutes
                            </span>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Episode Audio</h3>
                    <audio controls className="w-full">
                        <source src={podcast.media_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                    <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                        {podcast.description || 'No description provided for this episode.'}
                    </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <Link to="/podcasts" className="text-indigo-600 text-sm hover:underline">
                        &larr; Back to Podcasts
                    </Link>
                </div>
            </div>
        </div>
    );
}
