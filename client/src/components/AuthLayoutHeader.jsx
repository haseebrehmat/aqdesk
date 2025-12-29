import { useLayout } from '../context/LayoutContext';
import { Menu, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthLayoutHeader() {
  const { toggleSidebar, isSidebarExpanded } = useLayout();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 sticky top-0 z-30 font-sans flex items-center justify-between px-4 lg:px-8">
      {/* Sidebar Toggle Button (Visible on Mobile & when Sidebar is Collasped on Desktop) */}
      <div className="flex items-center gap-4">
        {(!isSidebarExpanded || window.innerWidth < 1024) && (
            <button 
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition lg:hidden"
                title="Open Navigation"
            >
                <Menu className="h-6 w-6" />
            </button>
        )}
        
        {/* Placeholder Search */}
        <div className="relative w-full max-w-sm hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
                type="search"
                placeholder="Search resources, users..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
            />
        </div>
      </div>

      {/* Profile/Role Pill */}
      <Link to="/profile" className="flex items-center space-x-2 text-slate-200 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 hover:bg-slate-800 transition">
        <div className="h-7 w-7 rounded-lg bg-slate-700 flex items-center justify-center font-semibold text-slate-300 text-sm border border-slate-600 shrink-0">
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{user.name || 'User'}</span>
      </Link>
    </header>
  );
}
