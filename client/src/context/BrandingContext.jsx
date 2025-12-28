import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

export const DEFAULT_LOGO = '/favicon.svg';

const BrandingContext = createContext(null);

function applyFavicon(href) {
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.removeAttribute('type');
  link.href = href;
}

export function BrandingProvider({ children }) {
  const [settings, setSettings] = useState({ app_name: 'AQDesk', logo_url: null });

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/settings');
      if (data?.settings) setSettings(data.settings);
    } catch {
      // Fall back to the built-in brand mark when the API is unreachable.
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const logoUrl = settings.logo_url || DEFAULT_LOGO;

  // The logo and the favicon are always the same image.
  useEffect(() => {
    applyFavicon(logoUrl);
    document.title = settings.app_name;
  }, [logoUrl, settings.app_name]);

  const value = useMemo(
    () => ({ appName: settings.app_name, logoUrl, hasCustomLogo: !!settings.logo_url, setSettings, refresh }),
    [settings, logoUrl, refresh],
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within a BrandingProvider');
  return ctx;
}
