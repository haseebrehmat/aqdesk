import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import opportunityService from '../../services/opportunityService';
import { 
  Briefcase, MapPin, Building2, UploadCloud, CheckCircle2, 
  AlertCircle, ArrowLeft, Clock, ShieldCheck, FileText, Sparkles
} from 'lucide-react';

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [otherOpportunities, setOtherOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    fetchOpportunityDetails();
  }, [id]);

  const fetchOpportunityDetails = async () => {
    setLoading(true);
    try {
      // Fetch target opportunity and overall job listings for the "Other Jobs" section
      const [currRes, allRes] = await Promise.allSettled([
        opportunityService.getOpportunity(id),
        opportunityService.getOpportunities ? opportunityService.getOpportunities() : Promise.resolve({ data: [] })
      ]);

      if (currRes.status === 'fulfilled') {
        setOpportunity(currRes.value.data.data || currRes.value.data);
      } else {
        throw currRes.reason;
      }

      if (allRes.status === 'fulfilled') {
        const list = allRes.value.data.data || allRes.value.data || [];
        // Filter out current job to show other listings
        setOtherOpportunities(list.filter(item => String(item.id) !== String(id)).slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load opportunity:', err);
      setError(err.response?.data?.message || 'Failed to load opportunity details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) {
      setError('Please select a PDF resume file.');
      return;
    }

    const formData = new FormData();
    formData.append('opportunity_id', id);
    formData.append('resume', resume);

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await opportunityService.applyToOpportunity(formData);
      setMessage('Application submitted successfully!');
      setResume(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const roleName = user?.role?.role_name || '';
  const roleId = user?.role_id;
  const isEmployer = user && (
    roleName.toLowerCase() === 'employer' || 
    roleName.toLowerCase() === 'admin' || 
    roleName.toLowerCase() === 'administrator' || 
    [1, 2, 3].includes(roleId)
  );

  if (loading) return <div className="p-20 text-center text-slate-500 font-sans">Loading opportunity details...</div>;
  if (error && !opportunity) return <div className="p-20 text-center text-rose-600 font-sans">{error}</div>;
  if (!opportunity) return <div className="p-20 text-center text-slate-500 font-sans">Opportunity not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 font-semibold text-xs hover:underline flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl transition w-fit shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Opportunities Board
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Main Job Details & Description */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 inline-block">
                    {opportunity.job_type || 'Full-Time'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{opportunity.title}</h1>
                  <p className="text-slate-600 text-sm font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" /> {opportunity.company_name}
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {opportunity.location || 'Remote'}
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Posted</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> {new Date(opportunity.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Listing Status</p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {opportunity.status || 'Published'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</p>
                  <p className="text-xs font-bold text-purple-600 mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Software & Tech
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Deadline</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {opportunity.application_deadline
                      ? new Date(opportunity.application_deadline).toLocaleString()
                      : 'Open until filled'}
                  </p>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">Job Description & Requirements</h3>
                <div className="text-slate-600 text-xs sm:text-sm whitespace-pre-line leading-relaxed bg-white border border-slate-100 rounded-2xl p-4">
                  {opportunity.description}
                </div>
              </div>

              <div className="text-xs text-slate-400 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span>Opportunity ID: #{opportunity.id}</span>
                <span>Verified AQDesk Talent Network</span>
              </div>
            </div>
          </div>

          {/* Right Column: Application Form or Employer Management */}
          <div className="lg:col-span-4 space-y-6">
            {isEmployer ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Employer Management View</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You are signed in with employer/administrator credentials. Candidate applications are managed through the dashboard.
                </p>
                <Link
                  to="/applications"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition shadow-md shadow-blue-600/20"
                >
                  Manage Candidate Pipeline
                </Link>
              </div>
            ) : !opportunity.accepts_applications ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-center">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">Applications Closed</h3>
                <p className="text-xs text-slate-500 mt-2">This listing is no longer accepting applications.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 sticky top-20">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900">Apply for Position</h3>
                  <p className="text-xs text-slate-500">Submit your professional PDF resume for review.</p>
                </div>
                
                {message && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{message}</span>
                  </div>
                )}
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleApply} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Upload Resume Document
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition bg-slate-50/50">
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => setResume(e.target.files[0])}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 mt-2">PDF only (Max 2MB)</p>
                    </div>
                    {resume && (
                      <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-1">
                        <FileText className="w-3.5 h-3.5" /> Selected: {resume.name}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                  >
                    <UploadCloud className="w-4 h-4" />
                    {submitting ? 'Transmitting Application...' : 'Submit Application Now'}
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1.5">
                  <p className="font-semibold text-slate-600">Application Guidelines:</p>
                  <p>• Ensure your contact email is up to date in your profile settings.</p>
                  <p>• Applications are reviewed directly by the employer.</p>
                </div>
              </div>
            )}

            {/* Other Available Jobs Card */}
            {otherOpportunities.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Other Open Roles</h3>
                <div className="space-y-3">
                  {otherOpportunities.map((job) => (
                    <Link
                      key={job.id}
                      to={`/opportunities/${job.id}`}
                      className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition space-y-1"
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold text-emerald-700">
                        <span>{job.job_type}</span>
                        <span className="text-slate-400 font-normal">{job.location || 'Remote'}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{job.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{job.company_name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
