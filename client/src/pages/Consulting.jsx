import { useState, useEffect } from 'react';
// import Navbar from '../components/Navbar';
import api from '../api/axios';
import { UserCheck, Clock } from 'lucide-react';

export default function Consulting() {
  const [consultations, setConsultations] = useState([]);
  const [experts, setExperts] = useState([]);
  const [expertId, setExpertId] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [availability, setAvailability] = useState([]);
  const [availabilityStart, setAvailabilityStart] = useState('');
  const [availabilityEnd, setAvailabilityEnd] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchConsultations();
    api.get('/consultations/experts').then(({ data }) => {
      setExperts(data);
      if (data[0]) setExpertId(String(data[0].id));
    });
  }, []);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isExpert = ['Expert', 'Admin'].includes(currentUser.role?.role_name);

  useEffect(() => {
    if (!expertId) return;
    api.get('/consultations/availability', { params: { expert_id: expertId } })
      .then(({ data }) => {
        setAvailability(data);
        setBookingSlot(data[0]?.starts_at || '');
      });
  }, [expertId]);

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
      setStatusMsg(err.response?.data?.message || 'Unable to book that consultation slot.');
    }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/consultations/${id}/status`, { status });
    fetchConsultations();
  };

  const addAvailability = async (event) => {
    event.preventDefault();
    try {
      await api.post('/consultations/availability', {
        starts_at: availabilityStart,
        ends_at: availabilityEnd,
      });
      setAvailabilityStart('');
      setAvailabilityEnd('');
      setStatusMsg('Availability added successfully.');
      if (Number(expertId) === Number(currentUser.id)) {
        const { data } = await api.get('/consultations/availability', { params: { expert_id: expertId } });
        setAvailability(data);
      }
    } catch (error) {
      setStatusMsg(error.response?.data?.message || 'Unable to add availability.');
    }
  };

  const saveProposal = async (id) => {
    const terms = window.prompt('Enter the proposal terms');
    if (!terms) return;
    const budget = window.prompt('Enter the proposed budget', '0');
    if (budget === null) return;
    await api.put(`/consultations/${id}/proposal`, { terms, budget });
    fetchConsultations();
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
                <label htmlFor="consultation-expert" className="block text-xs font-medium text-slate-300 mb-1">
                  Select Expert
                </label>
                <select
                  id="consultation-expert"
                  required
                  value={expertId}
                  onChange={(e) => setExpertId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {experts.map((expert) => <option key={expert.id} value={expert.id}>{expert.name}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="consultation-slot" className="block text-xs font-medium text-slate-300 mb-1">
                  Available Date & Time
                </label>
                <select
                  id="consultation-slot"
                  required
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select an open time</option>
                  {availability.map((slot) => (
                    <option key={slot.id} value={slot.starts_at}>
                      {new Date(slot.starts_at).toLocaleString()} - {new Date(slot.ends_at).toLocaleTimeString()}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl text-sm transition"
              >
                Schedule Session
              </button>
            </form>
          </div>

          {isExpert && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
              <h2 className="text-lg font-bold text-white mb-4">Publish Availability</h2>
              <form onSubmit={addAvailability} className="space-y-4">
                <div>
                  <label htmlFor="availability-start" className="block text-xs font-medium text-slate-300 mb-1">Starts</label>
                  <input id="availability-start" type="datetime-local" required value={availabilityStart} onChange={(event) => setAvailabilityStart(event.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white" />
                </div>
                <div>
                  <label htmlFor="availability-end" className="block text-xs font-medium text-slate-300 mb-1">Ends</label>
                  <input id="availability-end" type="datetime-local" required value={availabilityEnd} onChange={(event) => setAvailabilityEnd(event.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm">Add Open Time</button>
              </form>
            </div>
          )}

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
                    <span className="text-xs text-slate-400 mt-1 block">
                      Expert: {item.expert?.name || item.expert_id} · Client: {item.client?.name || item.client_id}
                    </span>
                    {item.proposal && <p className="text-xs text-slate-300 mt-2">Proposal: {item.proposal.terms} (${item.proposal.budget})</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-medium">{item.status}</span>
                    {Number(item.expert_id) === Number(currentUser.id) && (
                      <div className="flex flex-wrap justify-end gap-2">
                        {['Approved', 'Active', 'Completed', 'Rejected'].map((status) => (
                          <button key={status} onClick={() => updateStatus(item.id, status)} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700">{status}</button>
                        ))}
                        <button onClick={() => saveProposal(item.id)} className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-500">Proposal</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
