import { Link } from "react-router-dom";
import { FolderKanban, HelpCircle, Briefcase, User, ArrowRight } from "lucide-react";

export default function UserDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {user?.role?.role_name || "Standard User"}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || "Collaborator"}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Here is your AQDesk activity hub. Manage your workspaces, explore community questions, and track career opportunities.
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/projects"
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-white">Workspaces</h3>
              <p className="text-slate-400 text-xs mt-1">Collaborate on team project files and share feedback.</p>
            </div>
            <div className="mt-6 flex items-center text-xs text-blue-400 font-medium">
              <span>View projects</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/dashboard/questions"
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-white">Community Q&A</h3>
              <p className="text-slate-400 text-xs mt-1">Ask technical questions and share solutions with peers.</p>
            </div>
            <div className="mt-6 flex items-center text-xs text-indigo-400 font-medium">
              <span>Browse discussions</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/dashboard/opportunities"
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-white">Opportunities</h3>
              <p className="text-slate-400 text-xs mt-1">Explore verified internships, jobs, and academic openings.</p>
            </div>
            <div className="mt-6 flex items-center text-xs text-emerald-400 font-medium">
              <span>View listings</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/profile"
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-white">Profile Settings</h3>
              <p className="text-slate-400 text-xs mt-1">Update your personal bio, developer skills, and tags.</p>
            </div>
            <div className="mt-6 flex items-center text-xs text-purple-400 font-medium">
              <span>Edit profile</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
