import { Avatar, Button, Hidden, TextField, View, Text } from 'reshaped';
import { useLayout } from '../context/LayoutContext';
import { routerLink } from './RouterLink';
import ColorModeToggle from './ColorModeToggle';
import { Menu, Search } from './icons';

export default function AuthLayoutHeader() {
  const { toggleSidebar } = useLayout();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <View
      as="header"
      height="64px"
      direction="row"
      align="center"
      justify="space-between"
      paddingInline={{ s: 4, l: 8 }}
      backgroundColor="elevation-base"
      borderBottom
      position="sticky"
      insetTop={0}
      zIndex={30}
    >
      <View direction="row" align="center" gap={3} grow>
        <View className="lg:hidden">
          <Button variant="ghost" icon={Menu} onClick={toggleSidebar} attributes={{ 'aria-label': 'Open navigation' }} />
        </View>
        <Hidden hide={{ s: true, m: false }}>
          <View width="360px">
            <TextField
              name="search"
              icon={Search}
              placeholder="Search resources, users..."
              inputAttributes={{ type: 'search', 'aria-label': 'Search' }}
            />
          </View>
        </Hidden>
      </View>

      <View direction="row" align="center" gap={2}>
      <ColorModeToggle />
      <Button variant="faded" {...routerLink('/profile')} startSlot={<Avatar size={6} initials={(user.name || 'U').charAt(0).toUpperCase()} />}>
        <Text variant="body-2" weight="medium">{user.name || 'User'}</Text>
      </Button>
      </View>
    </View>
  );
}
