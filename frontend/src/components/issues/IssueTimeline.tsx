import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Issue, Product } from '@/stores/useDataStore';
import { Clock, Package, AlertCircle, CheckCircle2, MessageSquare, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IssueTimelineProps {
  issue: Issue;
  product: Product;
}

export function IssueTimeline({ issue, product }: IssueTimelineProps) {
  const timelineEvents = [
    {
      id: 1,
      timestamp: issue.reportedOn,
      icon: AlertCircle,
      title: 'Issue Reported',
      description: `${issue.type} issue reported for ${product.product}`,
      color: 'text-destructive',
    },
    ...(product.orderedOn ? [{
      id: 2,
      timestamp: product.orderedOn,
      icon: Package,
      title: 'Product Ordered',
      description: `Order placed with ${issue.vendor}`,
      color: 'text-primary',
    }] : []),
    ...(product.actualDeliveryDate ? [{
      id: 3,
      timestamp: product.actualDeliveryDate,
      icon: Truck,
      title: 'Product Delivered',
      description: 'Product delivered to location',
      color: 'text-primary',
    }] : []),
    ...(issue.aiActivated ? [{
      id: 4,
      timestamp: issue.reportedOn,
      icon: MessageSquare,
      title: 'AI Chatbot Activated',
      description: 'AI started vendor communication',
      color: 'text-primary',
    }] : []),
    ...(issue.aiCommunicationLog && issue.aiCommunicationLog.length > 0 
      ? issue.aiCommunicationLog.map((log, index) => ({
          id: 100 + index,
          timestamp: log.timestamp,
          icon: log.sender === 'AI' ? MessageSquare : log.sender === 'Vendor' ? Package : AlertCircle,
          title: `${log.sender} Message`,
          description: log.message.substring(0, 100) + (log.message.length > 100 ? '...' : ''),
          color: log.sender === 'AI' ? 'text-primary' : 'text-muted-foreground',
        }))
      : []
    ),
    ...(issue.resolutionStatus === 'Closed' ? [{
      id: 999,
      timestamp: new Date().toISOString(),
      icon: CheckCircle2,
      title: 'Issue Resolved',
      description: 'Issue has been successfully resolved',
      color: 'text-success',
    }] : []),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Issue Timeline
        </CardTitle>
        <CardDescription>
          Complete history of this issue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
          
          {timelineEvents.map((event, index) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className={cn(
                  "relative z-10 w-8 h-8 rounded-full flex items-center justify-center bg-background border-2",
                  event.color === 'text-destructive' && 'border-destructive',
                  event.color === 'text-primary' && 'border-primary',
                  event.color === 'text-success' && 'border-success',
                  event.color === 'text-muted-foreground' && 'border-muted-foreground'
                )}>
                  <Icon className={cn("h-4 w-4", event.color)} />
                </div>
                
                {/* Event content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {new Date(event.timestamp).toLocaleString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
