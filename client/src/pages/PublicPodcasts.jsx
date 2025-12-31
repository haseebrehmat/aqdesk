import { useState, useEffect } from 'react';
import { Mic2, Play, Radio } from 'lucide-react';
import api from '../api/axios';

export default function PublicPodcasts() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/podcasts')
      .then(res => setPodcasts(res.data.data || res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Radio className="w-3.5 h-3.5" /> Audio Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">Podcasts & Technical Interviews</h1>
          <p className="text-slate-600 text-sm">Listen to software engineering deep-dives and career discussions.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading broadcasts...</div>
        ) : podcasts.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 text-sm">
            No podcasts available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {podcasts.map((pod) => (
              <div
                key={pod.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center shrink-0">
                    <Mic2 className="w-7 h-7 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900">{pod.title}</h3>
                    <p className="text-slate-600 text-xs line-clamp-1">{pod.description}</p>
                    <span className="text-xs text-slate-400 font-medium block">Host: {pod.expert?.name || 'Expert Consultant'}</span>
                  </div>
                </div>

                <a
                  href={pod.media_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-5 py-3 rounded-2xl transition shadow-sm shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" /> Listen Broadcast
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
