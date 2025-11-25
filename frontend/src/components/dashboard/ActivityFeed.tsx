import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, AlertCircle, CheckCircle, Clock } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "order",
    icon: Package,
    title: "New order placed",
    description: "PO-2025-005 for Vienna Premium Suite #B8",
    time: "2 hours ago",
    status: "success"
  },
  {
    id: 2,
    type: "delivery",
    icon: Truck,
    title: "Delivery completed",
    description: "8 items delivered to Budapest Apartment #A12",
    time: "5 hours ago",
    status: "success"
  },
  {
    id: 3,
    type: "issue",
    icon: AlertCircle,
    title: "Issue reported",
    description: "LED Floor Lamp - Glass shade cracked",
    time: "1 day ago",
    status: "warning"
  },
  {
    id: 4,
    type: "payment",
    icon: CheckCircle,
    title: "Payment received",
    description: "€2,499.99 from IKEA Hungary",
    time: "2 days ago",
    status: "success"
  },
  {
    id: 5,
    type: "pending",
    icon: Clock,
    title: "Awaiting confirmation",
    description: "PO-2025-002 from Royalty Line Europe",
    time: "3 days ago",
    status: "pending"
  }
];

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                activity.status === 'success' ? 'bg-success/10' :
                activity.status === 'warning' ? 'bg-warning/10' :
                'bg-muted'
              }`}>
                <activity.icon className={`h-4 w-4 ${
                  activity.status === 'success' ? 'text-success' :
                  activity.status === 'warning' ? 'text-warning' :
                  'text-muted-foreground'
                }`} />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
