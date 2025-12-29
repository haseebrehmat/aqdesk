import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Container, Divider, Hidden, View } from 'reshaped';
import { MessageSquare, Briefcase, Calendar, Mic2, Info, LayoutDashboard, LogIn, Menu, X } from 'lucide-react';
import Logo from './Logo';
import ColorModeToggle from './ColorModeToggle';
import { routerLink } from './RouterLink';

const navItems = [
  { label: 'Q&A Board', path: '/questions', icon: MessageSquare },
  { label: 'Opportunities', path: '/opportunities', icon: Briefcase },
  { label: 'Events', path: '/events', icon: Calendar },
  { label: 'Podcasts', path: '/podcasts', icon: Mic2 },
  { label: 'About Us', path: '/about', icon: Info },
];

function NavButton({ item, onNavigate }) {
  return (
    <NavLink to={item.path} onClick={onNavigate} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <Button
          as="span"
          variant={isActive ? 'faded' : 'ghost'}
          color={isActive ? 'primary' : 'neutral'}
          icon={item.icon}
          attributes={{ tabIndex: -1 }}
        >
          {item.label}
        </Button>
      )}
    </NavLink>
  );
}

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const token = localStorage.getItem('token');
  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch { user = {}; }

  const dashboardPath = user.role?.role_name?.toLowerCase() === 'admin' ? '/admin/dashboard' : '/dashboard';
  const accountLink = token ? dashboardPath : '/login';
  const accountLabel = token ? 'Go to Dashboard' : 'Sign In';

  return (
    <View as="header" backgroundColor="elevation-base" borderBottom position="sticky" insetTop={0} zIndex={50}>
      <Container width="1200px" padding={{ s: 4, m: 6 }}>
        <View direction="row" align="center" justify="space-between" height="64px">
          <Logo />

          <Hidden hide={{ s: true, m: false }}>
            <View as="nav" direction="row" gap={1} attributes={{ 'aria-label': 'Primary' }}>
              {navItems.map((item) => <NavButton key={item.path} item={item} />)}
            </View>
          </Hidden>

          <View direction="row" align="center" gap={2}>
            <ColorModeToggle />
            <Hidden hide={{ s: true, m: false }}>
              <Button color="primary" icon={token ? LayoutDashboard : LogIn} {...routerLink(accountLink)}>
                {accountLabel}
              </Button>
            </Hidden>
            <Hidden hide={{ s: false, m: true }}>
              <Button
                variant="ghost"
                icon={isOpen ? X : Menu}
                onClick={() => setIsOpen((v) => !v)}
                attributes={{ 'aria-label': 'Toggle menu', 'aria-expanded': isOpen }}
              />
            </Hidden>
          </View>
        </View>
      </Container>

      {isOpen && (
        <Hidden hide={{ m: true }}>
          <Divider />
          <View as="nav" padding={4} gap={1} attributes={{ 'aria-label': 'Mobile' }}>
            {navItems.map((item) => <NavButton key={item.path} item={item} onNavigate={() => setIsOpen(false)} />)}
            <Divider />
            <Button color="primary" fullWidth icon={token ? LayoutDashboard : LogIn} {...routerLink(accountLink, { onClick: () => setIsOpen(false) })}>
              {accountLabel}
            </Button>
          </View>
        </Hidden>
      )}
    </View>
  );
}
