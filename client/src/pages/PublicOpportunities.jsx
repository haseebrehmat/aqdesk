import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Search, ArrowUpRight, Sparkles } from 'lucide-react';
import api from '../api/axios';

export default function PublicOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/opportunities')
      .then(res => setOpportunities(res.data.data || res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = opportunities.filter(opp =>
    opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" /> Career Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">Tech Opportunities & Gigs</h1>
            <p className="text-slate-600 text-sm">Explore verified remote and on-site software engineering roles.</p>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition shadow-md shadow-emerald-600/20 shrink-0"
          >
            Post a Listing
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by job title, company name, or tech stack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs transition"
          />
        </div>

        {/* Job Listings Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading listings...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 text-sm">
            No opportunities currently available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((opp) => (
              <div
                key={opp.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 transition shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                      {opp.job_type}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {opp.location || 'Remote'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{opp.title}</h3>
                    <p className="text-slate-600 text-xs font-semibold flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" /> {opp.company_name}
                    </p>
                  </div>

                  <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    Posted by: {opp.employer?.name || 'Recruiter'}
                  </span>

                  <Link
                    to={`/opportunities/${opp.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    View Details & Apply <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
