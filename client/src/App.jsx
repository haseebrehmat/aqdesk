import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import PublicNavbar from './components/PublicNavbar';
import AuthSidebar from './components/AuthSidebar';
import AuthLayoutHeader from './components/AuthLayoutHeader';
import { LayoutProvider } from './context/LayoutContext';

import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';

// Public Pages
import HomePage from './pages/HomePage';
import PublicQA from './pages/PublicQA';
import PublicOpportunities from './pages/PublicOpportunities';
import PublicEvents from './pages/PublicEvents';
import PublicPodcasts from './pages/PublicPodcasts';
import PublicAbout from './pages/PublicAbout';

// Protected / Workspace Pages
import QuestionDetail from './pages/QuestionDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import JoinProject from './pages/JoinProject';
import Consulting from './pages/Consulting';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { ToastProvider } from './components/ToastContainer';

// Opportunities Pages
import OpportunityDetail from './pages/Opportunities/Show';
import OpportunityForm from './pages/Opportunities/Create';
import ApplicationManagement from './pages/Opportunities/ApplicationManagement';

// Events & Podcasts Pages
import EventShow from './pages/Events/Show';
import EventCreate from './pages/Events/Create';
import PodcastShow from './pages/Podcasts/Show';
import PodcastCreate from './pages/Podcasts/Create';
import PublicFooter from './components/PublicFooter';
import NewsletterAdmin from './pages/NewsletterAdmin';
import AuthSuccess from './pages/AuthSuccess';

// Layout for Guest (Public) Website Pages
function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <PublicNavbar />
      <main id="main-content" tabIndex="-1" className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

// Layout for Authenticated (Private) Workspace Pages
function ProtectedLayout() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  return (
    <LayoutProvider>
      <div className="min-h-screen flex bg-slate-950">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <AuthSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AuthLayoutHeader />
          <main id="main-content" tabIndex="-1" className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </LayoutProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Standalone Authentication & Direct Join Pages */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/projects/join/:token" element={<JoinProject />} />

          {/* Public Website Routes (Wrapped in PublicNavbar) */}
          <Route element={<PublicLayout />}>
            {/* Home Page loads directly on default root path */}
            <Route path="/" element={<HomePage />} />
            
            {/* Public Community & Content Hubs */}
            <Route path="/questions" element={<PublicQA />} />
            <Route path="/questions/:slug" element={<QuestionDetail />} />
            
            <Route path="/opportunities" element={<PublicOpportunities />} />
            <Route path="/opportunities/:id" element={<OpportunityDetail />} />
            
            <Route path="/events" element={<PublicEvents />} />
            <Route path="/events/:id" element={<EventShow />} />
            
            <Route path="/podcasts" element={<PublicPodcasts />} />
            <Route path="/podcasts/:id" element={<PodcastShow />} />
            
            <Route path="/about" element={<PublicAbout />} />
          </Route>

          {/* Protected Workspace & Management Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            
            {/* Admin Control Panel */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/newsletters" element={<NewsletterAdmin />} />

            {/* Account Settings & Workspaces */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/consulting" element={<Consulting />} />

            {/* Creator / Management Actions */}
            <Route path="/opportunities/create" element={<OpportunityForm />} />
            <Route path="/applications" element={<ApplicationManagement />} />
            <Route path="/events/create" element={<EventCreate />} />
            <Route path="/podcasts/create" element={<PodcastCreate />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
