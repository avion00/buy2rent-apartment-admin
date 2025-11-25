
import React from 'react';
import { 
  Home, Package, AlertCircle, CreditCard, 
  Settings, ChevronRight, ChevronLeft, Moon, Sun,
  Building, ShoppingCart, Truck, Store, Users, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, useLocation } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from 'next-themes';
import logoLight from '@/assets/buy2rent.png';
import logoDark from '@/assets/buy2rent_white.png';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
  isMobileOpen?: boolean;
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
}

export function Sidebar({ isCollapsed, onToggle, className, isMobileOpen = false }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };
  
  const navItems = [
    { title: 'Overview', icon: Home, href: '/overview' },
    { title: 'Clients', icon: Users, href: '/clients' },
    { title: 'Apartments', icon: Building, href: '/apartments' },
    { title: 'Orders', icon: ShoppingCart, href: '/orders' },
    { title: 'Deliveries', icon: Truck, href: '/deliveries' },
    { title: 'Payments', icon: CreditCard, href: '/payments' },
    { title: 'Issues', icon: AlertCircle, href: '/issues' },
    { title: 'Vendors', icon: Store, href: '/vendors' },
    { title: 'Automations', icon: Zap, href: '/automations' },
    { title: 'Settings', icon: Settings, href: '/settings' }
  ];

  return (
    <aside className={cn(
      "bg-sidebar text-sidebar-foreground fixed top-0 left-0 transition-all duration-300 ease-in-out flex flex-col border-r border-sidebar-border overflow-hidden",
      "h-screen",
      isMobile 
        ? cn(
            "w-64 z-50",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )
        : cn(
            isCollapsed ? "w-16" : "w-64",
            "z-30"
          ),
      className
    )}>
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border shrink-0 relative">
        <img 
          src={isDark ? logoDark : logoLight} 
          alt="Buy2Rent" 
          className={cn(
            "transition-all duration-200 object-contain",
            isCollapsed && !isMobile ? "h-8 w-8" : "h-10 max-w-[180px]"
          )}
        />
        
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "absolute right-2 text-sidebar-foreground h-8 w-8 hover:bg-sidebar-accent",
              isCollapsed ? "right-2" : "right-4"
            )}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden py-4"
        style={{ 
          maxHeight: 'calc(100dvh - 200px)',
        }}
      >
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm" 
                    : "text-sidebar-foreground font-medium",
                  isCollapsed && !isMobile && "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0")} />
                <span className={cn(
                  "text-sm transition-opacity duration-200 whitespace-nowrap",
                  isCollapsed && !isMobile ? "opacity-0 w-0 hidden" : "opacity-100"
                )}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto border-t border-sidebar-border shrink-0 bg-sidebar">
        <div className="p-4">
          <div className={cn(
            "flex items-center gap-2 mb-4 justify-center",
            isCollapsed && !isMobile ? "flex-col gap-2" : "justify-between"
          )}>
            {(!isCollapsed || isMobile) && <Sun className="h-4 w-4 text-sidebar-foreground" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className={cn(
                "relative h-8 rounded-full transition-all",
                isCollapsed && !isMobile ? "w-8 p-0" : "w-14 px-0",
                isDark ? "bg-sidebar-accent" : "bg-sidebar-accent/70"
              )}
            >
              <div className={cn(
                "absolute h-6 w-6 rounded-full bg-sidebar-primary transition-all duration-300 flex items-center justify-center",
                isCollapsed && !isMobile ? "left-1" : (isDark ? "left-7" : "left-1")
              )}>
                {isDark ? (
                  <Moon className="h-3 w-3 text-sidebar-primary-foreground" />
                ) : (
                  <Sun className="h-3 w-3 text-sidebar-primary-foreground" />
                )}
              </div>
            </Button>
            {(!isCollapsed || isMobile) && <Moon className="h-4 w-4 text-sidebar-foreground" />}
          </div>
          
          {(!isCollapsed || isMobile) && (
            <div className="transition-opacity duration-200 rounded-lg bg-sidebar-accent/50 p-3 text-xs text-sidebar-accent-foreground">
              <p className="font-bold mb-1">Active Projects</p>
              <p className="font-medium">12 Apartments</p>
              <p className="text-[10px] opacity-75 mt-1">5 Pending Approvals</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
