import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';
import { 
  Sparkles, MessageSquare, FolderKanban, Briefcase, Calendar, 
  Mic2, Shield, LayoutDashboard, LogOut, ChevronLeft, ChevronRight, PanelLeftClose, Mail
} from 'lucide-react';

export default function AuthSidebar() {
  const navigate = useNavigate();
  const { isSidebarExpanded, toggleSidebar, closeSidebar } = useLayout();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check if user is an admin based on role object or role string
  const isAdmin = user.role?.role_name?.toLowerCase() === 'admin' || user.role === 'admin';

  const handleLogout = (e) => {
    e.stopPropagation();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    closeSidebar();
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    toggleSidebar();
  };

  // Base navigation items available to all users
  const navItems = [
    { label: 'Q&A Board', path: '/dashboard/questions', icon: MessageSquare },
    { label: 'Workspaces', path: '/projects', icon: FolderKanban },
    { label: 'Opportunities', path: '/dashboard/opportunities', icon: Briefcase },
    { label: 'Events', path: '/dashboard/events', icon: Calendar },
    { label: 'Podcasts', path: '/dashboard/podcasts', icon: Mic2 },
  ];

  // Dynamically add Admin User Management panel if the user is an admin
  if (isAdmin) {
    navItems.push({ label: 'User Management', path: '/admin/users', icon: Shield });
    navItems.push({ label: 'Newsletter', path: '/admin/newsletters', icon: Mail });
  }

  const sidebarWidth = isSidebarExpanded ? 'w-64' : 'w-20';

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarExpanded && (
        <div 
          onClick={closeSidebar} 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden animate-in fade-in duration-300" 
        />
      )}

      {/* Main Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 lg:static z-40 bg-slate-900 border-r border-slate-800 ${sidebarWidth} flex flex-col justify-between transition-all duration-300 ease-in-out font-sans overflow-hidden`}
      >
        {/* Sidebar Top Section */}
        <div>
          {/* Logo & Toggle Header */}
          <div className={`flex items-center h-16 border-b border-slate-800/80 px-4 shrink-0 transition-all ${isSidebarExpanded ? 'justify-between' : 'justify-center'}`}>
            <Link to="/" className="flex items-center space-x-2.5 shrink-0">
              <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-blue-500/10 ring-1 ring-white/10 shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xl font-extrabold tracking-tight text-white transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                AQ<span className="text-blue-500">Desk</span>
              </span>
            </Link>
            
            <button 
              type="button"
              onClick={handleToggle}
              aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              className="hidden lg:flex p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800/80 transition shrink-0 cursor-pointer"
              title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isSidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); closeSidebar(); }}
              aria-label="Close sidebar"
              className="flex lg:hidden p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-950/50 transition shrink-0"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow space-y-1.5 p-3.5 pt-6">
            {/* Dynamic Dashboard / Admin Home Button */}
            <NavLink
              to={isAdmin ? "/admin/users" : "/dashboard"}
              onClick={() => { if (window.innerWidth < 1024) closeSidebar(); }}
              className={({ isActive }) => `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition group mb-3 ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 shrink-0 transition-colors ${isSidebarExpanded ? '' : 'group-hover:text-blue-400'}`} />
              <span className={`transition-opacity duration-300 ease-in-out whitespace-nowrap ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 lg:w-0 overflow-hidden'}`}>
                {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
              </span>
            </NavLink>

            <div className="border-t border-slate-800/60 my-2 pt-2"></div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) closeSidebar();
                  }}
                  className={({ isActive }) => `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition group ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isSidebarExpanded ? '' : 'group-hover:text-blue-400'}`} />
                  <span className={`transition-opacity duration-300 ease-in-out whitespace-nowrap ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 lg:w-0 overflow-hidden'}`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom / User Profile */}
        <div className="p-3.5 border-t border-slate-800/80">
          <div className={`flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 ${isSidebarExpanded ? 'justify-between' : 'justify-center'}`}>
            <div className={`flex items-center gap-3 transition-opacity ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 lg:w-0 overflow-hidden'}`}>
              <div className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-lg border border-slate-700 shrink-0">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="whitespace-nowrap overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user.email || 'authenticated'}</p>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              className={`p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition shrink-0 cursor-pointer ${isSidebarExpanded ? '' : 'w-full flex justify-center'}`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
