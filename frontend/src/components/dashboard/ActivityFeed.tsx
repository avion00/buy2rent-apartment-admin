import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, 
  Truck, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  CreditCard,
  Building2,
  Users,
  Store,
  User,
  Activity,
  Bot,
  ShoppingCart,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  Zap
} from "lucide-react";
import { useDashboardRecentActivities } from "@/hooks/useDashboardApi";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'order': ShoppingCart,
  'shopping-cart': ShoppingCart,
  'payment': CreditCard,
  'credit-card': CreditCard,
  'delivery': Truck,
  'truck': Truck,
  'issue': AlertCircle,
  'alert-circle': AlertCircle,
  'product': Package,
  'package': Package,
  'apartment': Building2,
  'building': Building2,
  'client': Users,
  'users': Users,
  'vendor': Store,
  'store': Store,
  'user': User,
  'status': Activity,
  'activity': Activity,
  'ai': Bot,
  'bot': Bot,
};

// Action icon mapping
const actionIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'created': Plus,
  'updated': Pencil,
  'deleted': Trash2,
  'delivered': CheckCircle,
  'payment_received': CheckCircle,
  'completed': CheckCircle,
  'cancelled': Trash2,
  'status_changed': ArrowRight,
};

// Get style config based on action
const getActionStyle = (action: string, activityType: string) => {
  const styles: Record<string, { bg: string; border: string; icon: string; badge: string; glow: string }> = {
    created: {
      bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      glow: 'shadow-emerald-500/5'
    },
    updated: {
      bg: 'bg-blue-500/5 dark:bg-blue-500/10',
      border: 'border-blue-500/20',
      icon: 'text-blue-500',
      badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      glow: 'shadow-blue-500/5'
    },
    deleted: {
      bg: 'bg-red-500/5 dark:bg-red-500/10',
      border: 'border-red-500/20',
      icon: 'text-red-500',
      badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      glow: 'shadow-red-500/5'
    },
    delivered: {
      bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      glow: 'shadow-emerald-500/5'
    },
    payment_received: {
      bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      glow: 'shadow-emerald-500/5'
    },
    completed: {
      bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      glow: 'shadow-emerald-500/5'
    },
    cancelled: {
      bg: 'bg-red-500/5 dark:bg-red-500/10',
      border: 'border-red-500/20',
      icon: 'text-red-500',
      badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      glow: 'shadow-red-500/5'
    },
    status_changed: {
      bg: 'bg-amber-500/5 dark:bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: 'text-amber-500',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      glow: 'shadow-amber-500/5'
    },
  };
  
  return styles[action] || {
    bg: 'bg-slate-500/5 dark:bg-slate-500/10',
    border: 'border-slate-500/20',
    icon: 'text-slate-500',
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    glow: 'shadow-slate-500/5'
  };
};

// Get activity type label
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    order: 'Order',
    payment: 'Payment',
    delivery: 'Delivery',
    issue: 'Issue',
    product: 'Product',
    apartment: 'Apartment',
    client: 'Client',
    vendor: 'Vendor',
    user: 'User',
  };
  return labels[type] || type;
};

export function ActivityFeed() {
  const { data, isLoading, refetch } = useDashboardRecentActivities();
  
  const activities = data?.activities || [];
  
  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };
  
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activities.length} activities tracked
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px]">
          <div className="p-4 space-y-2">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <Activity className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No recent activities</p>
                <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
                  Activities will appear here when you create, update, or delete records
                </p>
              </div>
            ) : (
              activities.slice(0, 15).map((activity: any, index: number) => {
                const IconComponent = iconMap[activity.icon] || iconMap[activity.type] || Activity;
                const ActionIcon = actionIconMap[activity.action] || Plus;
                const style = getActionStyle(activity.action, activity.type);
                
                return (
                  <div 
                    key={activity.id} 
                    className={cn(
                      "group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200",
                      "hover:shadow-md cursor-pointer",
                      style.bg,
                      `border ${style.border}`,
                      `hover:${style.glow}`
                    )}
                  >
                    {/* Timeline connector */}
                    {index < activities.slice(0, 15).length - 1 && (
                      <div className="absolute left-[26px] top-[52px] w-[2px] h-[calc(100%-20px)] bg-gradient-to-b from-border to-transparent" />
                    )}
                    
                    {/* Icon */}
                    <div className={cn(
                      "relative flex-shrink-0 p-2.5 rounded-xl shadow-sm transition-transform group-hover:scale-105",
                      "bg-background border",
                      style.border
                    )}>
                      <IconComponent className={cn("h-4 w-4", style.icon)} />
                      {/* Action indicator */}
                      <div className={cn(
                        "absolute -bottom-1 -right-1 p-0.5 rounded-full bg-background border",
                        style.border
                      )}>
                        <ActionIcon className={cn("h-2.5 w-2.5", style.icon)} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-foreground leading-tight">
                            {activity.title}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] px-1.5 py-0 h-4 font-medium border",
                              style.badge
                            )}
                          >
                            {activity.action}
                          </Badge>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0 h-4 font-normal bg-muted/50 text-muted-foreground flex-shrink-0"
                        >
                          {getTypeLabel(activity.type)}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(activity.created_at)}</span>
                        {activity.apartment && (
                          <>
                            <span className="text-muted-foreground/30">•</span>
                            <Building2 className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{activity.apartment}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
