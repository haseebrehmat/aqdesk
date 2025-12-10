import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, MessageSquare, Briefcase, Calendar, Mic2, 
  ArrowRight, CheckCircle2, Flame, Hash, ChevronRight,
  Star, Database, Server
} from 'lucide-react';
import api from '../api/axios';

export default function HomePage() {
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);

  useEffect(() => {
    // Fetch real seeded content from backend APIs
    Promise.allSettled([
      api.get('/questions'),
      api.get('/opportunities')
    ]).then(([qRes, jRes]) => {
      if (qRes.status === 'fulfilled') {
        setRecentQuestions(qRes.value.data.data || qRes.value.data || []);
      }
      if (jRes.status === 'fulfilled') {
        setFeaturedJobs(jRes.value.data.data || jRes.value.data || []);
      }
    });
  }, []);

  // Fallback to actual seed data if API is loading or empty
  const displayQuestion = recentQuestions[0] || {
    title: 'How to resolve API state synchronization error in unified routing?',
    body: 'When issuing PUT requests across multi-role layouts...',
    tags: [{ tag_name: 'Web Development' }]
  };

  const displayJob = featuredJobs[0] || {
    title: 'Senior Full-Stack Laravel & React Developer',
    description: 'Remote • Enterprise Tech Architecture...',
    job_type: 'Full-Time'
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* SECTION 1: HERO BANNER */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-200 bg-white">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-[500px] h-[500px] bg-purple-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600" /> AQDesk Community & Learning Portal
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Bridge Academic Knowledge with <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Industry Execution</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              AQDesk unifies technical Q&A, collaborative team workspaces, expert mentorship, live webinars, and career opportunities into a single real-time ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to="/questions"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition shadow-md shadow-blue-600/20"
              >
                Explore Q&A Board <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/opportunities"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-xl transition shadow-xs"
              >
                <Briefcase className="w-4 h-4 text-emerald-600" /> Browse Opportunities
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-100 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-black text-slate-900">4.8k+</p>
                <p className="text-xs text-slate-600 font-medium">Active Peers</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">1.2k</p>
                <p className="text-xs text-slate-600 font-medium">Solved Threads</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">350+</p>
                <p className="text-xs text-slate-600 font-medium">Tech Gigs</p>
              </div>
            </div>
          </div>

          {/* Hero Feature Card Showcase (Bound to Actual Seed Data) */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5" /> Live Seeded Platform Feed
                </span>
                <span className="text-xs text-slate-400">Sanctum Auth</span>
              </div>

              <div className="space-y-4">
                {/* Seeded Question Item */}
                <Link to="/questions" className="block bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 hover:bg-white/10 transition">
                  <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
                    <Hash className="w-3.5 h-3.5" /> {displayQuestion.tags?.[0]?.tag_name || 'Web Development'}
                  </div>
                  <h3 className="text-sm font-bold leading-snug">{displayQuestion.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{displayQuestion.body}</p>
                </Link>

                {/* Seeded Job Opportunity Item */}
                <Link to="/opportunities" className="block bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 hover:bg-white/10 transition">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <Hash className="w-3.5 h-3.5" /> {displayJob.job_type || 'Full-Time'} Opportunity
                  </div>
                  <h3 className="text-sm font-bold leading-snug">{displayJob.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{displayJob.company_name || 'TechCorp'} • {displayJob.description}</p>
                </Link>
              </div>

              <Link
                to="/questions"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
              >
                Join the Community <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ECOSYSTEM MODULES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">Explore Platform Ecosystem</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Tailored modules for Students, Experts, Recruiters, and Administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/questions" className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-500 hover:shadow-xl transition space-y-4">
            <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600">Community Q&A</h3>
            <p className="text-slate-600 text-xs leading-relaxed">Ask coding questions, share insights, and get verified expert solutions.</p>
          </Link>

          <Link to="/opportunities" className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition space-y-4">
            <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600">Job Opportunities</h3>
            <p className="text-slate-600 text-xs leading-relaxed">Discover remote developer roles, tech internships, and upload PDF resumes.</p>
          </Link>

          <Link to="/events" className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-purple-500 hover:shadow-xl transition space-y-4">
            <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600">Live Events</h3>
            <p className="text-slate-600 text-xs leading-relaxed">Participate in virtual webinars and schedule 1-on-1 advisory booking slots.</p>
          </Link>

          <Link to="/podcasts" className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-amber-500 hover:shadow-xl transition space-y-4">
            <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Mic2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600">Audio Broadcasts</h3>
            <p className="text-slate-600 text-xs leading-relaxed">Listen to engaging technical interviews and career advice published by experts.</p>
          </Link>
        </div>
      </section>

      {/* SECTION 3: LIVE RECENT DISCUSSIONS */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Live Knowledge Base
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Recent Community Discussions</h2>
            </div>
            <Link to="/questions" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All Questions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentQuestions.length > 0 ? (
              recentQuestions.slice(0, 3).map((q) => (
                <div key={q.id} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-blue-400 transition">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100/80 px-2.5 py-0.5 rounded-md uppercase">
                      {q.tags?.[0]?.tag_name || 'Discussion'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">{q.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{q.body}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
                    <span>By {q.user?.name || 'Developer'}</span>
                    <span className="font-semibold text-blue-600">{q.answers_count || 0} Answers</span>
                  </div>
                </div>
              ))
            ) : (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
                  <div className="h-5 bg-slate-200 rounded w-full animate-pulse" />
                  <div className="h-10 bg-slate-200 rounded w-full animate-pulse" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURED JOB OPPORTUNITIES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Careers & Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Latest Featured Gigs & Roles</h2>
          </div>
          <Link to="/opportunities" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
            Explore Job Board <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredJobs.length > 0 ? (
            featuredJobs.slice(0, 3).map((job) => (
              <div key={job.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4 hover:border-emerald-400 transition">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg border border-emerald-200">
                    {job.job_type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{job.location || 'Remote'}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                  <p className="text-xs font-semibold text-slate-600">{job.company_name}</p>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>
                <Link to={`/opportunities/${job.id}`} className="block text-center py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition">
                  Apply Now
                </Link>
              </div>
            ))
          ) : (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
                <div className="h-6 bg-slate-200 rounded w-3/4 animate-pulse" />
                <div className="h-12 bg-slate-200 rounded w-full animate-pulse" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* SECTION 5: ROLE-BASED ARCHITECTURE */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Role-Based Access Control (RBAC)
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Designed for Every Tech Stakeholder</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              How AQDesk powers students, experts, employers, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl space-y-3">
              <div className="h-10 w-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center font-bold">1</div>
              <h3 className="text-base font-bold text-white">Students & Developers</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Post coding questions, manage project workspaces, share asset files, and apply to job roles.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl space-y-3">
              <div className="h-10 w-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center font-bold">2</div>
              <h3 className="text-base font-bold text-white">Faculty Experts</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Offer 1-on-1 advisory calendar consultations, verify accepted answers, and publish podcasts.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl space-y-3">
              <div className="h-10 w-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold">3</div>
              <h3 className="text-base font-bold text-white">Recruiters & Employers</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Post employment opportunities, review applicant PDF resumes, and track candidate pipelines.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl space-y-3">
              <div className="h-10 w-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">4</div>
              <h3 className="text-base font-bold text-white">Administrators</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Moderate content, approve job listings, dispatch bulk newsletter email campaigns, and suspend accounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: ACTUAL PLATFORM SEEDS & DATABASE INSPECTOR */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Database className="w-4 h-4" /> Relational Database Seeders
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Preloaded With Verified System Seed Data</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              AQDesk initializes relational integrity using automated database seeders for roles, taxonomy categories, default expert profiles, and sample discussion threads.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> RoleSeeder: Guest, Standard User, Expert, Admin
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> TagSeeder: Web Development, EdTech, AI Taxonomies
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> UserSeeder: Preconfigured student & faculty accounts
              </div>
            </div>
          </div>

          {/* Actual Platform Seed Inspector Widget */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 border border-slate-800 font-mono">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 min-w-0">
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 truncate">database/seeders/DatabaseSeeder.php</span>
              </div>
              <span className="shrink-0 flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Seeded
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">1. RoleSeeder (roles table)</span>
                <span className="text-blue-400 font-bold">4 Records [Guest, User, Expert, Admin]</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">2. TagSeeder (tags table)</span>
                <span className="text-purple-400 font-bold">12 Taxonomies [WebDev, AI, EdTech]</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">3. UserSeeder (users & profiles)</span>
                <span className="text-emerald-400 font-bold">25 Initial Accounts</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">4. QuestionSeeder (questions)</span>
                <span className="text-amber-400 font-bold">40 Technical Threads</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/questions"
                className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-center text-xs rounded-xl transition shadow-md no-underline font-sans"
              >
                Inspect Live Seeded Community Data
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Community Feedback
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">Trusted by Developers & Faculty</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "AQDesk allowed our semester project team to share project assets and generate join tokens instantly without configuring complex permissions."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">H</div>
              <div>
                <p className="text-xs font-bold text-slate-900">Hamza Ali</p>
                <p className="text-[10px] text-slate-500">Full-Stack Student Developer</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "As a faculty supervisor, scheduling advisory booking slots and verifying accepted Q&A solutions has streamlined student mentorship significantly."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">A</div>
              <div>
                <p className="text-xs font-bold text-slate-900">Mr. Abdullah Qamar</p>
                <p className="text-[10px] text-slate-500">Senior Engineering Consultant</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "We posted our junior developer position on the AQDesk career board and received well-documented PDF applications directly from candidates."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">R</div>
              <div>
                <p className="text-xs font-bold text-slate-900">TechCorp Employer</p>
                <p className="text-[10px] text-slate-500">Technical Talent Partner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FINAL CALL TO ACTION BANNER */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">Ready to Join the AQDesk Community?</h2>
          <p className="text-white text-sm max-w-xl mx-auto">
            Create your account today to participate in Q&A discussions, form team project workspaces, and apply to tech opportunities.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="bg-white text-blue-600 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition shadow-lg hover:bg-slate-100"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="bg-blue-700 text-white border border-blue-500 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition hover:bg-blue-800"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
