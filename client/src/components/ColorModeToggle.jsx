import { Button, useTheme } from 'reshaped';
import { Moon, Sun } from 'lucide-react';

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
      icon={colorMode === 'dark' ? Sun : Moon}
      onClick={toggle}
      attributes={{ 'aria-label': `Switch to ${next} mode`, title: `Switch to ${next} mode` }}
    />
  );
}
