import React from 'react';
import { Sparkles, Users, Briefcase, Calendar, MessageSquare } from 'lucide-react';

export default function PublicAbout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> About AQDesk Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Bridging Academic Learning & Industry Execution
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto">
            AQDesk is an all-in-one collaborative learning platform uniting technical Q&A, workspace management, mentorship, and career placements.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Community Q&A Engine</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Threaded technical discussions with markdown support, upvoting, and verified solution badges from experienced software engineers.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-2">
            <Users className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900">Collaborative Workspaces</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Form development teams, issue secure invitation tokens, upload project assets, and exchange structured peer feedback.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Career Opportunities</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              A dedicated hiring hub connecting employers directly with students and tech talent through verified applications.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-2">
            <Calendar className="w-6 h-6 text-amber-600" />
            <h3 className="text-lg font-bold text-slate-900">Events & Consultation</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Schedule 1-on-1 advisory sessions with verified faculty experts and attend live tech workshops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}