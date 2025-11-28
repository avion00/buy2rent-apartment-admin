import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function PageLayout({ children, title }: PageLayoutProps) {
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Listen for sidebar preference changes from Settings
  React.useEffect(() => {
    const handleSidebarPreferenceChange = (event: CustomEvent) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebarPreferenceChanged' as any, handleSidebarPreferenceChange);
    return () => {
      window.removeEventListener('sidebarPreferenceChanged' as any, handleSidebarPreferenceChange);
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => {
        const newValue = !prev;
        localStorage.setItem('sidebarCollapsed', String(newValue));
        return newValue;
      });
    }
  };

  return (
    <div className="h-screen flex">
      {/* Backdrop overlay for mobile */}
      {isMobile && isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} isMobileOpen={isMobileSidebarOpen} />

      <div
        className="flex-1 flex flex-col transition-all duration-300 min-w-0 w-full lg:w-auto"
        style={{ marginLeft: isMobile ? 0 : isSidebarCollapsed ? "4rem" : "16rem" }}
      >
        <Navbar onMenuToggle={toggleSidebar} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="container max-w-full p-4 lg:p-6 animate-fade-in">
            <h1 className="text-2xl mb-3 font-bold ">{title}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
