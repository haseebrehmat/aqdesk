import React, { useState, useEffect } from 'react';
import opportunityService from '../../services/opportunityService';
import { FileText, Building2, Calendar, CheckCircle } from 'lucide-react';

export default function ApplicationManagement() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await opportunityService.getApplications();
      setApplications(response.data.data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await opportunityService.updateApplicationStatus(id, newStatus);
      setApplications(
        applications.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app,
        ),
      );
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-slate-400 font-sans">
        Loading applications...
      </div>
    );

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileText className="w-7 h-7 text-blue-500" /> Applications Dashboard
        </h1>
      </div>

      {applications.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400">
          <p className="text-base font-medium text-slate-300">No applications found.</p>
          <p className="text-xs text-slate-500 mt-1">Applications you submit or receive will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2.5 py-1 bg-slate-800 text-blue-400 rounded-md text-xs font-medium border border-blue-500/20">
                    {app.status}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />{' '}
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">
                  {app.opportunity?.title || 'N/A'}
                </h3>

                <p className="text-slate-300 text-sm font-medium flex items-center gap-1.5 mb-4">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />{' '}
                  {app.opportunity?.company_name || 'N/A'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <a
                  href={`http://localhost:8000/storage/${app.resume_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> View Resume
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}