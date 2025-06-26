import { createContext, useContext, useState } from 'react';

const LayoutContext = createContext();

export function LayoutProvider({ children }) {
  // Sidebar state (expanded by default on desktop)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Helper function to toggle sidebar expansion state
  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => !prev);
  };

  // Helper function to close sidebar explicitly (e.g., when clicking links on mobile)
  const closeSidebar = () => {
    setIsSidebarExpanded(false);
  };

  return (
    <LayoutContext.Provider value={{ isSidebarExpanded, toggleSidebar, closeSidebar }}>
      {children}
    </LayoutContext.Provider>
  );
}

// Custom hook for easier context access
export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}