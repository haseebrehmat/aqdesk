import { useState, useEffect } from 'react';
// import Navbar from '../components/Navbar';
import api from '../api/axios';
import { UserCheck, Clock, CheckCircle2, Shield } from 'lucide-react';

export default function Consulting() {
  const [consultations, setConsultations] = useState([]);
  const [expertId, setExpertId] = useState('2'); // Pre-seeded Expert ID (Mr. Abdullah Qamar)
  const [bookingSlot, setBookingSlot] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await api.get('/consultations');
      setConsultations(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to load consultations', err);
    }
  };

  const handleBookConsultation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/consultations', {
        expert_id: expertId,
        booking_slot: bookingSlot
      });
      setStatusMsg('Consultation request submitted successfully!');
      fetchConsultations();
    } catch (err) {
      console.error('Booking error', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* <Navbar /> */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Expert Consulting & Advisory
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Book advisory sessions with verified software engineering consultants.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Request Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <span>Book Consultation</span>
            </h2>

            {statusMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs mb-4">
                {statusMsg}
              </div>
            )}

            <form onSubmit={handleBookConsultation} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Expert ID
                </label>
                <input
                  type="number"
                  required
                  value={expertId}
                  onChange={(e) => setExpertId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Booking Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl text-sm transition"
              >
                Schedule Session
              </button>
            </form>
          </div>

          {/* Bookings History */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-white mb-2">My Scheduled Consultations</h2>
            {consultations.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                No consultations requested yet.
              </div>
            ) : (
              consultations.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>{new Date(item.booking_slot).toLocaleString()}</span>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">Expert ID: {item.expert_id}</span>
                  </div>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-medium">
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}