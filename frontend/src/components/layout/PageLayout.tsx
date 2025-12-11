import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  fullWidth?: boolean;
  noPadding?: boolean;
}

export function PageLayout({ 
  children, 
  title, 
  subtitle,
  actions,
  fullWidth = false,
  noPadding = false 
}: PageLayoutProps) {
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
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Backdrop overlay for mobile */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className={cn(
            "fixed inset-0 z-40 lg:hidden",
            "bg-background/80 backdrop-blur-sm",
            "animate-in fade-in-0 duration-200"
          )} 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar} 
        isMobileOpen={isMobileSidebarOpen} 
      />

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 w-full lg:w-auto h-screen",
          "transition-all duration-300 ease-out",
          "relative z-10"
        )}
        style={{ 
          marginLeft: isMobile ? 0 : isSidebarCollapsed ? "72px" : "288px" 
        }}
      >
        {/* Navbar */}
        <Navbar onMenuToggle={toggleSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-background via-background to-muted/20">
          {/* Content wrapper */}
          <div className={cn(
            "animate-in fade-in-0  slide-in-from-bottom-4 duration-500",
            !noPadding && "p-4 lg:p-6 xl:p-8",
            !fullWidth && "max-w-[1600px] mx-auto"
          )}>
            {/* Page header */}
            {(title || actions) && (
              <div className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                "mb-6 lg:mb-8"
              )}>
                <div className="space-y-1">
                  <h1 className={cn(
                    "text-2xl lg:text-3xl font-bold tracking-tight",
                    "bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
                  )}>
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {subtitle}
                    </p>
                  )}
                </div>
                
                {actions && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {actions}
                  </div>
                )}
              </div>
            )}
            
            {/* Page content */}
            <div className="relative">
              {children}
            </div>
          </div>
        </main>
        
        {/* Optional footer */}
        {/* <footer className={cn(
          "hidden lg:flex items-center justify-between",
          "px-6 py-3 border-t border-border/40",
          "bg-background/50 backdrop-blur-sm",
          "text-xs text-muted-foreground"
        )}>
          <span>© 2025 Buy2Rent Procurement System</span>
          <span>Version 1.0.0</span>
        </footer> */}
      </div>
    </div>
  );
}
