import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Bell, User, UserCircle, Settings, Users, LogOut, Menu, 
  Building2, Package, UserCheck, Command as CommandIcon, 
  ChevronDown, Sparkles, X, Check, Clock, ShoppingCart, CreditCard, Truck,
  Store, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { authApi, tokenManager, type UserProfile } from '@/services/authApi';
import { notificationApi, type Notification, formatNotificationTime, getNotificationColor } from '@/services/notificationApi';
import { searchApi, type GlobalSearchResponse } from '@/services/searchApi';
import { useToast } from '@/hooks/use-toast';

interface NavbarProps {
  className?: string;
  onMenuToggle?: () => void;
}

export function Navbar({ className, onMenuToggle }: NavbarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [searchResults, setSearchResults] = useState<GlobalSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (tokenManager.isAuthenticated()) {
          const profile = await authApi.getProfile();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, []);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (tokenManager.isAuthenticated()) {
          setIsLoadingNotifications(true);
          const [recentNotifs, count] = await Promise.all([
            notificationApi.getRecentNotifications(),
            notificationApi.getUnreadCount()
          ]);
          setNotifications(recentNotifs);
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };
    
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mark all notifications as read
  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast({
        title: 'Notifications marked as read',
        description: 'All notifications have been marked as read.',
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [toast]);

  // Mark single notification as read
  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
      tokenManager.clearTokens();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear tokens anyway and redirect
      tokenManager.clearTokens();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  }, [navigate, toast]);

  // Get user initials for avatar
  const userInitials = useMemo(() => {
    if (!userProfile) return 'U';
    const first = userProfile.first_name?.[0] || '';
    const last = userProfile.last_name?.[0] || '';
    if (first || last) return (first + last).toUpperCase();
    return userProfile.username?.[0]?.toUpperCase() || 'U';
  }, [userProfile]);

  // Get display name
  const displayName = useMemo(() => {
    if (!userProfile) return 'User';
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    return userProfile.username || 'User';
  }, [userProfile]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Get icon component based on notification type
  const getNotificationIconComponent = (type: string) => {
    switch (type) {
      case 'order': return ShoppingCart;
      case 'payment': return CreditCard;
      case 'delivery': return Truck;
      case 'issue': return AlertCircle;
      case 'warning': return AlertCircle;
      case 'success': return Check;
      default: return Bell;
    }
  };

  // Search with debounce using API
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      const query = searchQuery.trim();
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          console.log('Searching for:', query);
          const results = await searchApi.globalSearch(query, 5);
          console.log('Search results:', results);
          setSearchResults(results);
        } catch (error: any) {
          console.error('Search failed:', error);
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
          setSearchResults(null);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleSelect = (type: 'apartment' | 'client' | 'product' | 'vendor' | 'delivery' | 'issue', id: string, apartmentId?: string) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults(null);
    if (type === 'apartment') {
      navigate(`/apartments/${id}`);
    } else if (type === 'client') {
      navigate('/clients');
    } else if (type === 'vendor') {
      navigate('/vendors');
    } else if (type === 'delivery') {
      navigate('/deliveries');
    } else if (type === 'issue') {
      navigate(apartmentId ? `/apartments/${apartmentId}` : '/issues');
    } else if (type === 'product') {
      if (apartmentId) {
        navigate(`/apartments/${apartmentId}`);
      }
    }
  };

  return (
    <>
      <header className={cn(
        "sticky top-0 z-20 w-full",
        "bg-background/80 backdrop-blur-xl",
        "border-b border-border/40",
        "supports-[backdrop-filter]:bg-background/60",
        className
      )}>
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left section */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 hover:bg-muted/80"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-foreground">
                    Buy2Rent
                  </span>
                  <span className="text-[10px] text-muted-foreground -mt-0.5">
                    Procurement
                  </span>
                </div>
              </div>
            </div>
            
            {/* Search bar */}
            <Button
              variant="outline"
              className={cn(
                "relative hidden lg:flex items-center gap-3",
                "h-10 rounded-xl px-4",
                "bg-muted/30 hover:bg-muted/50",
                "border-border/50 hover:border-primary/30",
                "text-sm text-muted-foreground",
                "transition-all duration-300",
                "min-w-[280px] lg:min-w-[360px]",
                "justify-start",
                "group"
              )}
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary transition-colors" />
              <span className="flex-1 text-left text-muted-foreground/70">
                Search apartments, clients, products...
              </span>
              <kbd className={cn(
                "hidden lg:inline-flex h-5 select-none items-center gap-1",
                "rounded-md border border-border/50 bg-background/80",
                "px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70"
              )}>
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
          
          {/* Right section */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Mobile search */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-9 w-9 hover:bg-muted/80"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "relative h-9 w-9 rounded-xl",
                "hover:bg-muted/80 transition-all duration-200",
                "group"
              )}
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              {unreadCount > 0 && (
                <span className={cn(
                  "absolute -top-0.5 -right-0.5",
                  "flex h-5 min-w-5 items-center justify-center",
                  "rounded-full bg-primary px-1",
                  "text-[10px] font-bold text-primary-foreground",
                  "shadow-lg shadow-primary/30",
                  "animate-in zoom-in-50"
                )}>
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {/* Divider */}
            <div className="hidden lg:block h-6 w-px bg-border/50 mx-2" />
            
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "h-10 gap-2 px-2 lg:px-3 rounded-xl",
                    "hover:bg-muted/80 transition-all duration-200"
                  )}
                >
                  <Avatar className={cn(
                    "h-8 w-8",
                    "ring-2 ring-primary/20 ring-offset-2 ring-offset-background",
                    "transition-all duration-300"
                  )}>
                    <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-medium">{displayName}</span>
                    <span className="text-[10px] text-muted-foreground">{userProfile?.username || 'User'}</span>
                  </div>
                  <ChevronDown className="hidden lg:block h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className={cn(
                  "w-64 p-2",
                  "bg-popover/95 backdrop-blur-xl",
                  "border-border/50",
                  "shadow-xl"
                )}
              >
                {/* User info header */}
                <div className="flex items-center gap-3 p-2 mb-2">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{displayName}</span>
                    <span className="text-xs text-muted-foreground">{userProfile?.email || 'user@example.com'}</span>
                  </div>
                </div>
                
                <DropdownMenuSeparator className="bg-border/50" />
                
                <DropdownMenuItem className="cursor-pointer rounded-lg h-10 gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-lg h-10 gap-3" onClick={() => navigate('/settings')}>
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-lg h-10 gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span>Team</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-border/50" />
                
                <DropdownMenuItem 
                  className="cursor-pointer rounded-lg h-10 gap-3 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <LogOut className={cn("h-4 w-4", isLoggingOut && "animate-spin")} />
                  </div>
                  <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <CommandDialog 
        open={showSearch} 
        onOpenChange={(open) => {
          setShowSearch(open);
          if (!open) setSearchQuery('');
        }}
        shouldFilter={false}
      >
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <CommandInput 
            placeholder="Search apartments, clients, vendors, products..." 
            className="h-14 text-base border-0 focus:ring-0"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
        </div>
        <CommandList className="min-h-[350px] max-h-[450px]">
          {/* Loading state */}
          {isSearching && (
            <div className="py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">Searching...</p>
              </div>
            </div>
          )}
          
          {/* No results */}
          {!isSearching && searchQuery.length >= 2 && searchResults && searchResults.total_results === 0 && (
            <div className="py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <Search className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="text-xs text-muted-foreground/70">Try searching for apartments, clients, vendors, or products</p>
              </div>
            </div>
          )}
          
          {/* Apartments */}
          {searchResults && searchResults.apartments.length > 0 && (
            <CommandGroup heading={`Apartments (${searchResults.apartments.length})`}>
              {searchResults.apartments.map((apartment) => (
                <CommandItem
                  key={apartment.id}
                  value={`apartment-${apartment.id}`}
                  onSelect={() => handleSelect('apartment', apartment.id)}
                  className="cursor-pointer py-3 px-4 rounded-lg mx-2 my-1"
                >
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3">
                    <Building2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{apartment.name}</span>
                    <span className="text-xs text-muted-foreground">{apartment.address}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    apartment.status === 'In Progress' ? "bg-blue-500/10 text-blue-500" :
                    apartment.status === 'Completed' ? "bg-green-500/10 text-green-500" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {apartment.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {/* Clients */}
          {searchResults && searchResults.clients.length > 0 && (
            <CommandGroup heading={`Clients (${searchResults.clients.length})`}>
              {searchResults.clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={`client-${client.id}`}
                  onSelect={() => handleSelect('client', client.id)}
                  className="cursor-pointer py-3 px-4 rounded-lg mx-2 my-1"
                >
                  <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center mr-3">
                    <UserCheck className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{client.name}</span>
                    <span className="text-xs text-muted-foreground">{client.email}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    client.account_status === 'Active' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {client.account_status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {/* Vendors */}
          {searchResults && searchResults.vendors.length > 0 && (
            <CommandGroup heading={`Vendors (${searchResults.vendors.length})`}>
              {searchResults.vendors.map((vendor) => (
                <CommandItem
                  key={vendor.id}
                  value={`vendor-${vendor.id}`}
                  onSelect={() => handleSelect('vendor', vendor.id)}
                  className="cursor-pointer py-3 px-4 rounded-lg mx-2 my-1"
                >
                  <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center mr-3">
                    <Store className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{vendor.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {vendor.company_name || vendor.email || 'No details'}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {/* Products */}
          {searchResults && searchResults.products.length > 0 && (
            <CommandGroup heading={`Products (${searchResults.products.length})`}>
              {searchResults.products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`product-${product.id}`}
                  onSelect={() => handleSelect('product', product.id, product.apartment_id)}
                  className="cursor-pointer py-3 px-4 rounded-lg mx-2 my-1"
                >
                  <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center mr-3">
                    <Package className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{product.product}</span>
                    <span className="text-xs text-muted-foreground">
                      {product.vendor} • {product.category || 'Uncategorized'}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    product.status === 'Delivered' ? "bg-green-500/10 text-green-500" :
                    product.status === 'Ordered' ? "bg-blue-500/10 text-blue-500" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {product.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {/* Deliveries */}
          {searchResults && searchResults.deliveries.length > 0 && (
            <CommandGroup heading={`Deliveries (${searchResults.deliveries.length})`}>
              {searchResults.deliveries.map((delivery) => (
                <CommandItem
                  key={delivery.id}
                  value={`delivery-${delivery.id}`}
                  onSelect={() => handleSelect('delivery', delivery.id)}
                  className="cursor-pointer py-3 px-4 rounded-lg mx-2 my-1"
                >
                  <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center mr-3">
                    <Truck className="h-4 w-4 text-cyan-500" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{delivery.order_reference || `Delivery #${delivery.id.slice(0, 8)}`}</span>
                    <span className="text-xs text-muted-foreground">
                      {delivery.vendor} • {delivery.expected_date || 'No date'}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    delivery.status === 'Delivered' ? "bg-green-500/10 text-green-500" :
                    delivery.status === 'In Transit' ? "bg-blue-500/10 text-blue-500" :
                    delivery.status === 'Scheduled' ? "bg-amber-500/10 text-amber-500" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {delivery.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {/* Issues */}
          {searchResults && searchResults.issues.length > 0 && (
            <CommandGroup heading={`Issues (${searchResults.issues.length})`}>
              {searchResults.issues.map((issue) => (
                <CommandItem
                  key={issue.id}
                  value={`issue-${issue.id}`}
                  onSelect={() => handleSelect('issue', issue.id, issue.apartment_id)}
                  className="cursor-pointer py-3 px-4 rounded-lg mx-2 my-1"
                >
                  <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center mr-3">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{issue.product_name}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {issue.type} • {issue.priority}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    issue.status === 'Closed' ? "bg-green-500/10 text-green-500" :
                    issue.status === 'Open' ? "bg-red-500/10 text-red-500" :
                    "bg-amber-500/10 text-amber-500"
                  )}>
                    {issue.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {/* Quick actions when no search */}
          {!searchQuery && (
            <CommandGroup heading="Quick Actions">
              <CommandItem
                value="go-to-apartments"
                onSelect={() => { setShowSearch(false); navigate('/apartments'); }}
                className="cursor-pointer py-3 px-4 rounded-lg mx-2 my-1"
              >
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3">
                  <Building2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">View All Apartments</span>
                  <span className="text-xs text-muted-foreground">Browse apartments</span>
                </div>
              </CommandItem>
              <CommandItem
                value="go-to-clients"
                onSelect={() => { setShowSearch(false); navigate('/clients'); }}
                className="cursor-pointer py-3 px-4 rounded-lg mx-2 my-1"
              >
                <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center mr-3">
                  <Users className="h-4 w-4 text-violet-500" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">View All Clients</span>
                  <span className="text-xs text-muted-foreground">Browse clients</span>
                </div>
              </CommandItem>
              <CommandItem
                value="go-to-vendors"
                onSelect={() => { setShowSearch(false); navigate('/vendors'); }}
                className="cursor-pointer py-3 px-4 rounded-lg mx-2 my-1"
              >
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center mr-3">
                  <Store className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">View All Vendors</span>
                  <span className="text-xs text-muted-foreground">Browse vendors</span>
                </div>
              </CommandItem>
              <CommandItem
                value="go-to-deliveries"
                onSelect={() => { setShowSearch(false); navigate('/deliveries'); }}
                className="cursor-pointer py-3 px-4 rounded-lg mx-2 my-1"
              >
                <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center mr-3">
                  <Truck className="h-4 w-4 text-cyan-500" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">View All Deliveries</span>
                  <span className="text-xs text-muted-foreground">Browse deliveries</span>
                </div>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>

      {/* Notifications Sheet */}
      <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
        <SheetContent className="w-full sm:w-[420px] p-0 border-l-border/50">
          <SheetHeader className="p-6 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-lg">Notifications</SheetTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {unreadCount} unread messages
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-primary hover:text-primary"
                  onClick={handleMarkAllRead}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4 space-y-2">
              {isLoadingNotifications ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                    <Bell className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const IconComponent = getNotificationIconComponent(notification.notification_type);
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                        "hover:shadow-md hover:scale-[1.01]",
                        !notification.is_read 
                          ? "bg-primary/5 border-primary/20 hover:bg-primary/10" 
                          : "bg-card border-border/50 hover:bg-muted/50"
                      )}
                      onClick={() => {
                        if (!notification.is_read) {
                          handleMarkAsRead(notification.id);
                        }
                        if (notification.action_url) {
                          navigate(notification.action_url);
                          setShowNotifications(false);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          !notification.is_read ? "bg-background" : "bg-muted/50"
                        )}>
                          <IconComponent className={cn("h-5 w-5", getNotificationColor(notification.notification_type))} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm">{notification.title}</p>
                            {!notification.is_read && (
                              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/70">
                            <Clock className="h-3 w-3" />
                            <span>{formatNotificationTime(notification.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
