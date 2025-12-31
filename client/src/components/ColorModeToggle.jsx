import { Button, useTheme } from 'reshaped';
import { materialIcon } from './MaterialIcon';

const DarkMode = materialIcon('dark_mode');
const LightMode = materialIcon('light_mode');

export default function ColorModeToggle() {
  const { colorMode, setColorMode } = useTheme();
  const next = colorMode === 'dark' ? 'light' : 'dark';

  const toggle = () => {
    setColorMode(next);
    try { localStorage.setItem('__reshaped-mode', next); } catch { /* ignore */ }
  };

  return (
    <Button
      variant="ghost"
      icon={colorMode === 'dark' ? LightMode : DarkMode}
      onClick={toggle}
      attributes={{ 'aria-label': `Switch to ${next} mode`, title: `Switch to ${next} mode` }}
    />
  );
}
