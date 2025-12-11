import React, { useMemo } from 'react';
import { 
  Home, Package, AlertCircle, CreditCard, 
  Settings, ChevronRight, ChevronLeft, Moon, Sun,
  Building, ShoppingCart, Truck, Store, Users, Zap,
  Sparkles, ChevronDown, LogOut, User, Bell,
  TrendingUp, Clock, CheckCircle2, CircleDot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from 'next-themes';
import logoLight from '@/assets/buy2rent.png';
import logoDark from '@/assets/buy2rent_white.png';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDataStore } from '@/stores/useDataStore';

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
  badge?: number;
  color?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar({ isCollapsed, onToggle, className, isMobileOpen = false }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  
  // Get real data from store
  const { apartments, clients, vendors, products, deliveries, payments, issues } = useDataStore();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };
  
  // Calculate dynamic stats
  const stats = useMemo(() => {
    const totalApartments = apartments.length;
    const activeApartments = apartments.filter(a => a.status === 'In Progress' || a.status === 'Active').length;
    const completedApartments = apartments.filter(a => a.status === 'Completed' || a.status === 'Done').length;
    
    // Count pending deliveries
    const pendingDeliveries = deliveries.filter(d => 
      d.status === 'Scheduled' || d.status === 'In Transit'
    ).length;
    
    // Count open issues
    const openIssues = issues.filter(i => 
      i.resolutionStatus === 'Open' || i.resolutionStatus === 'Pending Vendor Response'
    ).length;
    
    // Count pending payments
    const pendingPayments = payments.filter(p => 
      p.status === 'Partial' || p.status === 'Unpaid'
    ).length;
    
    // Calculate overall progress
    const totalProgress = apartments.reduce((sum, a) => sum + (a.progress || 0), 0);
    const avgProgress = totalApartments > 0 ? Math.round(totalProgress / totalApartments) : 0;
    
    return {
      totalApartments,
      activeApartments,
      completedApartments,
      pendingDeliveries,
      openIssues,
      pendingPayments,
      avgProgress,
      totalClients: clients.length,
      totalVendors: vendors.length,
      totalProducts: products.length,
    };
  }, [apartments, clients, vendors, products, deliveries, payments, issues]);
  
  const navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { title: 'Overview', icon: Home, href: '/overview', color: 'text-blue-500' },
      ]
    },
    {
      title: 'Management',
      items: [
        { title: 'Clients', icon: Users, href: '/clients', color: 'text-violet-500' },
        { title: 'Apartments', icon: Building, href: '/apartments', color: 'text-emerald-500' },
        { title: 'Orders', icon: ShoppingCart, href: '/orders', color: 'text-orange-500' },
        { title: 'Deliveries', icon: Truck, href: '/deliveries', badge: stats.pendingDeliveries > 0 ? stats.pendingDeliveries : undefined, color: 'text-cyan-500' },
        { title: 'Payments', icon: CreditCard, href: '/payments', badge: stats.pendingPayments > 0 ? stats.pendingPayments : undefined, color: 'text-green-500' },
        { title: 'Issues', icon: AlertCircle, href: '/issues', badge: stats.openIssues > 0 ? stats.openIssues : undefined, color: 'text-red-500' },
        { title: 'Vendors', icon: Store, href: '/vendors', color: 'text-amber-500' },
      ]
    },
    {
      title: 'System',
      items: [
        { title: 'Automations', icon: Zap, href: '/automations', color: 'text-yellow-500' },
        { title: 'Settings', icon: Settings, href: '/settings', color: 'text-slate-500' },
      ]
    }
  ];

  const NavItemComponent = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
    const content = (
      <Link
        to={item.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ease-out",
          "hover:bg-gradient-to-r hover:from-sidebar-accent hover:to-sidebar-accent/50",
          isActive 
            ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm" 
            : "text-sidebar-foreground/80 hover:text-sidebar-foreground",
          isCollapsed && !isMobile && "justify-center px-2.5"
        )}
      >
        
        
        {/* Icon with glow effect */}
        <div className={cn(
          "relative flex items-center justify-center transition-transform duration-300",
          "group-hover:scale-110",
          isActive && "scale-110"
        )}>
          <item.icon className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors duration-300",
            isActive ? "text-primary" : item.color || "text-sidebar-foreground/70",
            "group-hover:text-primary"
          )} />
          {isActive && (
            <div className={cn(
              "absolute inset-0 blur-lg opacity-50",
              item.color || "bg-primary"
            )} />
          )}
        </div>
        
        {/* Title */}
        <span className={cn(
          "text-sm font-medium transition-all duration-300 whitespace-nowrap",
          isCollapsed && !isMobile ? "opacity-0 w-0 hidden" : "opacity-100",
          isActive && "font-semibold"
        )}>
          {item.title}
        </span>
        
        {/* Badge */}
        {item.badge && !isCollapsed && (
          <span className={cn(
            "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5",
            "text-[10px] font-semibold",
            "bg-primary/10 text-primary",
            "animate-pulse"
          )}>
            {item.badge}
          </span>
        )}
        
        {/* Collapsed badge indicator */}
        {item.badge && isCollapsed && !isMobile && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </Link>
    );

    if (isCollapsed && !isMobile) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            sideOffset={12}
            className="z-[100] flex items-center gap-2 bg-popover/95 backdrop-blur-sm shadow-lg border-border/50"
          >
            {item.title}
            {item.badge && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-1.5">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "fixed top-0 left-0 flex flex-col h-screen",
        "bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95",
        "border-r border-sidebar-border/50",
        "transition-all duration-300 ease-out",
        "backdrop-blur-xl",
        isMobile 
          ? cn(
              "w-72 z-50 shadow-2xl",
              isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )
          : cn(
              isCollapsed ? "w-[72px]" : "w-72",
              "z-40"
            ),
        className
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center shrink-0 relative",
          "h-16 px-4",
          "border-b border-sidebar-border/50",
          "bg-gradient-to-r from-sidebar to-sidebar/80"
        )}>
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            isCollapsed && !isMobile ? "justify-center w-full" : ""
          )}>
            <div className={cn(
              "relative flex items-center justify-center",
              "transition-all duration-300",
              isCollapsed && !isMobile ? "w-10 h-10" : "w-auto h-10"
            )}>
              <img 
                src={isDark ? logoDark : logoLight} 
                alt="Buy2Rent" 
                className={cn(
                  "transition-all duration-300 object-contain",
                  isCollapsed && !isMobile ? "h-8 w-8" : "h-9 max-w-[160px]"
                )}
              />
            </div>
          </div>
          
          {/* Collapse toggle */}
          {!isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggle}
              className={cn(
                "absolute -right-4 top-1/2 -translate-y-1/2 z-50",
                "h-7 w-7 rounded-full",
                "bg-background border-2 border-border shadow-lg",
                "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                "hover:scale-110",
                "transition-all duration-300",
                "flex items-center justify-center"
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-1">
          <nav className="px-3 ">
            {navSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                
                
                {/* Section items */}
                <div className="">
                  {section.items.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <NavItemComponent key={index} item={item} isActive={isActive} />
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
        
        {/* Footer */}
        <div className={cn(
          "mt-auto shrink-0",
          "border-t border-sidebar-border/50",
          "bg-gradient-to-t from-sidebar/50 to-transparent"
        )}>
          {/* Theme toggle */}
          <div className={cn(
            "p-3",
            isCollapsed && !isMobile ? "px-2" : "px-4"
          )}>
            <button
              onClick={toggleTheme}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl p-2.5 transition-all duration-300",
                "bg-sidebar-accent/30 hover:bg-sidebar-accent/50",
                "group",
                isCollapsed && !isMobile && "justify-center"
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center",
                "h-8 w-8 rounded-lg",
                "bg-gradient-to-br transition-all duration-500",
                isDark 
                  ? "from-indigo-500/20 to-purple-500/20" 
                  : "from-amber-500/20 to-orange-500/20",
                "group-hover:scale-110"
              )}>
                <Sun className={cn(
                  "h-4 w-4 absolute transition-all duration-500",
                  isDark 
                    ? "opacity-0 rotate-90 scale-0" 
                    : "opacity-100 rotate-0 scale-100 text-amber-500"
                )} />
                <Moon className={cn(
                  "h-4 w-4 absolute transition-all duration-500",
                  isDark 
                    ? "opacity-100 rotate-0 scale-100 text-indigo-400" 
                    : "opacity-0 -rotate-90 scale-0"
                )} />
              </div>
              
              {(!isCollapsed || isMobile) && (
                <div className="flex-1 text-left">
                  <p className="text-xs font-medium text-sidebar-foreground">
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </p>
                  <p className="text-[10px] text-sidebar-foreground/50">
                    Click to switch
                  </p>
                </div>
              )}
            </button>
          </div>
          
          {/* Stats card */}
          {(!isCollapsed || isMobile) && (
            <div className="p-4 pt-0">
              <div className={cn(
                "relative overflow-hidden rounded-xl p-4",
                "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
                "border border-primary/10"
              )}>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full blur-xl" />
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-sidebar-foreground">
                      Project Overview
                    </span>
                  </div>
                  
                  <div className="space-y-0">
                    {/* Apartments count */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-sidebar-foreground">{stats.totalApartments}</span>
                      <span className="text-xs text-sidebar-foreground/60">Apartments</span>
                    </div>
                    
                  
                    
                    {/* Quick stats grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sidebar-border/30">
                     
                      <div className="flex items-center gap-1.5">
                        <Truck className="h-3 w-3 text-cyan-500" />
                        <span className="text-[10px] text-sidebar-foreground/70">
                          <span className="font-semibold text-sidebar-foreground">{stats.pendingDeliveries}</span> Deliveries
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-[10px] text-sidebar-foreground/70">
                          <span className="font-semibold text-sidebar-foreground">{stats.openIssues}</span> Issues
                        </span>
                      </div>
                    </div>
                    
                    {/* Additional info */}
                    <div className="flex items-center justify-between pt-2 border-t border-sidebar-border/30">
                      <p className="text-[10px] text-sidebar-foreground/50 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {stats.totalClients} Clients
                      </p>
                      <p className="text-[10px] text-sidebar-foreground/50 flex items-center gap-1">
                        <Store className="h-3 w-3" />
                        {stats.totalVendors} Vendors
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
