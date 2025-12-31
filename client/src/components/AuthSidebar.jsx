import { NavLink, useNavigate } from 'react-router-dom';
import { Avatar, Button, Divider, Text, View } from 'reshaped';
import { useLayout } from '../context/LayoutContext';
import { useBranding } from '../context/BrandingContext';
import Logo from './Logo';
import { materialIcon } from './MaterialIcon';

const MessageSquare = materialIcon('forum');
const Folder = materialIcon('folder');
const Briefcase = materialIcon('work');
const Calendar = materialIcon('calendar_month');
const Podcast = materialIcon('podcast');
const Shield = materialIcon('admin_panel_settings');
const LayoutDashboard = materialIcon('dashboard');
const LogOut = materialIcon('logout');
const ChevronLeft = materialIcon('chevron_left');
const ChevronRight = materialIcon('chevron_right');
const Close = materialIcon('close');
const Mail = materialIcon('mail');
const Settings = materialIcon('settings');

function SidebarLink({ to, icon: Icon, label, expanded, onNavigate }) {
  return (
    <NavLink to={to} onClick={onNavigate} title={label} aria-label={label} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <View
          direction="row"
          align="center"
          gap={3}
          padding={3}
          borderRadius="medium"
          backgroundColor={isActive ? 'primary-faded' : undefined}
          justify={expanded ? 'start' : 'center'}
        >
          <Icon size={20} filled={isActive} aria-hidden="true" color={isActive ? 'var(--rs-color-foreground-primary)' : 'var(--rs-color-foreground-neutral-faded)'} />
          {expanded && (
            <Text variant="body-2" weight="medium" color={isActive ? 'primary' : 'neutral'}>{label}</Text>
          )}
        </View>
      )}
    </NavLink>
  );
}

export default function AuthSidebar() {
  const navigate = useNavigate();
  const { appName } = useBranding();
  const { isSidebarExpanded, toggleSidebar, closeSidebar } = useLayout();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role?.role_name?.toLowerCase() === 'admin' || user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    closeSidebar();
  };

  const closeOnMobile = () => { if (window.innerWidth < 1024) closeSidebar(); };

  const navItems = [
    { label: 'Q&A Board', path: '/dashboard/questions', icon: MessageSquare },
    { label: 'Workspaces', path: '/projects', icon: Folder },
    { label: 'Opportunities', path: '/dashboard/opportunities', icon: Briefcase },
    { label: 'Events', path: '/dashboard/events', icon: Calendar },
    { label: 'Podcasts', path: '/dashboard/podcasts', icon: Podcast },
  ];
  if (isAdmin) {
    navItems.push({ label: 'User Management', path: '/admin/users', icon: Shield });
    navItems.push({ label: 'Newsletter', path: '/admin/newsletters', icon: Mail });
    navItems.push({ label: 'Site Settings', path: '/admin/settings', icon: Settings });
  }

  return (
    <>
      {isSidebarExpanded && (
        <div
          onClick={closeSidebar}
          aria-hidden="true"
          className="lg:hidden"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 30 }}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 lg:static z-40 flex flex-col ${isSidebarExpanded ? 'w-64' : 'w-0 lg:w-20'}`}
        style={{ background: 'var(--rs-color-background-elevation-base)', borderRight: '1px solid var(--rs-color-border-neutral-faded)', overflow: 'hidden', transition: 'width 200ms ease' }}
      >
        <View height="64px" direction="row" align="center" justify="space-between" paddingInline={4} borderBottom>
          {isSidebarExpanded ? <Logo size={28} showName to="/" /> : <Logo size={28} showName={false} to="/" />}
          <View className="hidden lg:flex">
            <Button
              variant="ghost"
              size="small"
              icon={isSidebarExpanded ? ChevronLeft : ChevronRight}
              onClick={toggleSidebar}
              attributes={{ 'aria-label': isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar' }}
            />
          </View>
          <View className="lg:hidden">
            <Button variant="ghost" size="small" icon={Close} onClick={closeSidebar} attributes={{ 'aria-label': 'Close sidebar' }} />
          </View>
        </View>

        <View as="nav" grow padding={3} gap={1} attributes={{ 'aria-label': `${appName} workspace`, style: { overflowY: 'auto' } }}>
          <SidebarLink
            to={isAdmin ? '/admin/users' : '/dashboard'}
            icon={LayoutDashboard}
            label={isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            expanded={isSidebarExpanded}
            onNavigate={closeOnMobile}
          />
          <Divider />
          {navItems.map((item) => (
            <SidebarLink key={item.path} to={item.path} icon={item.icon} label={item.label} expanded={isSidebarExpanded} onNavigate={closeOnMobile} />
          ))}
        </View>

        <View padding={3} borderTop>
          <View direction="row" align="center" gap={2} justify={isSidebarExpanded ? 'space-between' : 'center'}>
            {isSidebarExpanded && (
              <View direction="row" align="center" gap={2} grow attributes={{ style: { minWidth: 0 } }}>
                <Avatar size={9} initials={(user.name || 'U').charAt(0).toUpperCase()} />
                <View attributes={{ style: { minWidth: 0 } }}>
                  <Text variant="body-2" weight="medium" maxLines={1}>{user.name || 'User'}</Text>
                  <Text variant="caption-1" color="neutral-faded" maxLines={1}>{user.email || 'authenticated'}</Text>
                </View>
              </View>
            )}
            <Button variant="ghost" color="critical" icon={LogOut} onClick={handleLogout} attributes={{ 'aria-label': 'Sign out', title: 'Sign Out' }} />
          </View>
        </View>
      </aside>
    </>
  );
}
