
import React, { useState, useEffect } from 'react';
import { Search, Bell, User, UserCircle, Settings, Users, LogOut, Menu, Building2, Package, UserCheck, Command as CommandIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { useDataStore } from '@/stores/useDataStore';

interface NavbarProps {
  className?: string;
  onMenuToggle?: () => void;
}

export function Navbar({ className, onMenuToggle }: NavbarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { apartments, clients, products } = useDataStore();

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

  const notifications = [
    { id: 1, title: 'New Order Received', message: 'Order #1234 from IKEA', time: '5 min ago', unread: true },
    { id: 2, title: 'Payment Confirmed', message: 'Payment for Order #1233 confirmed', time: '1 hour ago', unread: true },
    { id: 3, title: 'Delivery Scheduled', message: 'Delivery for Order #1232 scheduled', time: '2 hours ago', unread: false },
    { id: 4, title: 'Low Stock Alert', message: 'Queen Size Bed Frame stock is low', time: '1 day ago', unread: false },
  ];

  const handleSelect = (type: 'apartment' | 'client' | 'product', id: string) => {
    setShowSearch(false);
    if (type === 'apartment') {
      navigate(`/apartments/${id}`);
    } else if (type === 'client') {
      navigate('/clients');
    } else if (type === 'product') {
      const product = products.find(p => p.id === id);
      if (product) {
        navigate(`/apartments/${product.apartmentId}/products/${id}`);
      }
    }
  };

  return (
    <>
      <header className={cn("bg-background/95 backdrop-blur-sm sticky top-0 z-30 border-b shadow-sm", className)}>
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2 lg:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-semibold tracking-tight sm:text-lg lg:text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Buy2Rent Procurement
            </h1>
            
            <Button
              variant="outline"
              className="relative hidden md:flex items-center gap-2 h-9 rounded-lg px-4 text-sm text-muted-foreground border-border/60 hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 min-w-[280px] lg:min-w-[320px] justify-start"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search apartments, clients, products...</span>
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden h-9 w-9 hover:bg-muted/50 transition-colors"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-9 w-9 hover:bg-muted/50 transition-colors"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted/50 transition-all duration-200">
                  <Avatar className="h-9 w-9 ring-2 ring-primary/20 transition-all duration-200 hover:ring-primary/40">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-sm">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  Team
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <CommandDialog open={showSearch} onOpenChange={setShowSearch}>
        <CommandInput placeholder="Search apartments, clients, products..." className="h-12" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Apartments">
            {apartments.map((apartment) => (
              <CommandItem
                key={apartment.id}
                value={`${apartment.name} ${apartment.address} ${apartment.owner}`}
                onSelect={() => handleSelect('apartment', apartment.id)}
                className="cursor-pointer"
              >
                <Building2 className="mr-2 h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="font-medium">{apartment.name}</span>
                  <span className="text-xs text-muted-foreground">{apartment.address}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandGroup heading="Clients">
            {clients.map((client) => (
              <CommandItem
                key={client.id}
                value={`${client.name} ${client.email}`}
                onSelect={() => handleSelect('client', client.id)}
                className="cursor-pointer"
              >
                <UserCheck className="mr-2 h-4 w-4 text-accent" />
                <div className="flex flex-col">
                  <span className="font-medium">{client.name}</span>
                  <span className="text-xs text-muted-foreground">{client.email}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandGroup heading="Products">
            {products.slice(0, 20).map((product) => {
              const apartment = apartments.find(a => a.id === product.apartmentId);
              return (
                <CommandItem
                  key={product.id}
                  value={`${product.product} ${product.vendor} ${apartment?.name}`}
                  onSelect={() => handleSelect('product', product.id)}
                  className="cursor-pointer"
                >
                  <Package className="mr-2 h-4 w-4 text-success" />
                  <div className="flex flex-col">
                    <span className="font-medium">{product.product}</span>
                    <span className="text-xs text-muted-foreground">
                      {product.vendor} • {apartment?.name}
                    </span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
        <SheetContent className="w-full sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary" className="ml-2">{notifications.filter(n => n.unread).length}</Badge>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-100px)] mt-4">
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors hover:bg-muted cursor-pointer",
                    notification.unread ? "bg-primary/5 border-primary/20" : "bg-card"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                    </div>
                    {notification.unread && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
