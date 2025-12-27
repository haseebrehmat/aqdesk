import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import opportunityService from '../../services/opportunityService';
import { Briefcase, MapPin, Search, PlusCircle, Building2 } from 'lucide-react';

export default function OpportunityList() {
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const response = await opportunityService.getOpportunities({ search, job_type: jobType });
      setOpportunities(response.data.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [search, jobType]);

  const roleName = user?.role?.role_name?.toLowerCase() || '';
  const canPost = roleName === 'expert' || roleName === 'admin';

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-blue-500" /> Job Opportunities
          </h1>
        </div>
        {canPost && (
          <Link
            to="/dashboard/opportunities/create"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center space-x-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Opportunity</span>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Job Types</option>
          <option value="Full-Time">Full-Time</option>
          <option value="Internship">Internship</option>
          <option value="Contract">Contract</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading opportunities...</div>
      ) : opportunities.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-base font-medium text-slate-300">No opportunities found.</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2.5 py-1 bg-slate-800 text-blue-400 rounded-md text-xs font-medium border border-blue-500/20">
                    {opp.job_type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {opp.location || 'Remote'}
                  </span>
                </div>

                <Link
                  to={`/dashboard/opportunities/${opp.id}`}
                  className="text-lg font-semibold text-white hover:text-blue-400 transition block mb-1"
                >
                  {opp.title}
                </Link>

                <p className="text-slate-300 text-sm font-medium flex items-center gap-1.5 mb-3">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> {opp.company_name}
                </p>

                <p className="text-slate-400 text-sm line-clamp-3 mb-6">
                  {opp.description}
                </p>
              </div>

              <Link
                to={`/dashboard/opportunities/${opp.id}`}
                className="w-full text-center bg-blue-500/10 text-blue-400 py-2.5 px-4 rounded-xl font-medium text-xs border border-blue-500/20 hover:bg-blue-500/20 transition block"
              >
                {canPost ? 'View Details & Manage' : 'View Details & Apply'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
