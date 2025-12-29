import { useState, useEffect } from 'react';
import { Video, Users, Sparkles } from 'lucide-react';
import api from '../api/axios';
import { echo } from '../utils/echo';

export default function PublicEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events')
      .then(res => setEvents(res.data.data || res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    const channel = echo.channel('public-events');
    channel.listen('.EventAttendeeRegistered', (e) => {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === e.eventId ? { ...ev, attendees_count: (ev.attendees_count || 0) + 1 } : ev
        )
      );
    });

    return () => echo.leaveChannel('public-events');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <Sparkles className="w-3.5 h-3.5" /> Virtual Meetups
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">Live Tech Workshops & Webinars</h1>
          <p className="text-slate-600 text-sm">Join scheduled live sessions and workshops hosted by experienced engineers.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 text-sm">
            No upcoming events found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 transition shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold">
                      {new Date(ev.scheduled_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {ev.attendees_count || 0} Registered
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{ev.title}</h3>
                  <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                    {ev.description}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Host: {ev.host?.name || 'Expert'}</span>
                  <a
                    href={ev.webinar_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline"
                  >
                    <Video className="w-3.5 h-3.5" /> Join Session
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
