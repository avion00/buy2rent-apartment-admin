import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Zap, Mail, Clock, Save } from 'lucide-react';
import { automations } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const Automations = () => {
  const [automationStates, setAutomationStates] = useState(
    automations.reduce((acc, auto) => ({ ...acc, [auto.id]: auto.enabled }), {} as Record<number, boolean>)
  );
  const { toast } = useToast();

  const handleToggle = (id: number) => {
    setAutomationStates(prev => ({ ...prev, [id]: !prev[id] }));
    toast({
      title: 'Automation Updated',
      description: `Automation ${!automationStates[id] ? 'enabled' : 'disabled'} successfully.`,
    });
  };

  const handleSaveTemplate = (id: number) => {
    toast({
      title: 'Template Saved',
      description: 'Email template has been updated successfully.',
    });
  };

  return (
    <PageLayout title="Automations">
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">AI Workflow Automation</h2>
                <p className="text-muted-foreground">
                  Configure automated email templates and workflows to streamline vendor communication,
                  payment reminders, and issue resolution.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automation Templates */}
        {automations.map((automation) => (
          <Card key={automation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle>{automation.name}</CardTitle>
                    <Badge variant={automationStates[automation.id] ? 'default' : 'secondary'}>
                      {automationStates[automation.id] ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>
                    Automatically send emails when triggered by system events
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`toggle-${automation.id}`} className="text-sm text-muted-foreground">
                    {automationStates[automation.id] ? 'Enabled' : 'Disabled'}
                  </Label>
                  <Switch
                    id={`toggle-${automation.id}`}
                    checked={automationStates[automation.id]}
                    onCheckedChange={() => handleToggle(automation.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`subject-${automation.id}`} className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Subject
                </Label>
                <Input
                  id={`subject-${automation.id}`}
                  defaultValue={automation.template.subject}
                  placeholder="Email subject line..."
                  disabled={!automationStates[automation.id]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`body-${automation.id}`}>Email Body</Label>
                <EnhancedTextarea
                  id={`body-${automation.id}`}
                  defaultValue={automation.template.body}
                  placeholder="Email template body..."
                  rows={8}
                  disabled={!automationStates[automation.id]}
                  className="font-mono text-sm"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">{'{{vendor}}'}</Badge>
                  <Badge variant="outline" className="text-xs">{'{{product}}'}</Badge>
                  <Badge variant="outline" className="text-xs">{'{{apartment}}'}</Badge>
                  <Badge variant="outline" className="text-xs">{'{{order_no}}'}</Badge>
                  <Badge variant="outline" className="text-xs">{'{{due_date}}'}</Badge>
                  <Badge variant="outline" className="text-xs">{'{{amount}}'}</Badge>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSaveTemplate(automation.id)}
                  disabled={!automationStates[automation.id]}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Automation Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { event: 'Issue email sent to IKEA Hungary', time: '2 hours ago', type: 'issue' },
                { event: 'Payment reminder sent to Royalty Line', time: '5 hours ago', type: 'payment' },
                { event: 'Stock check email sent to Philips', time: '1 day ago', type: 'stock' },
                { event: 'RMA request email sent to Home Depot', time: '2 days ago', type: 'issue' },
              ].map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{log.event}</p>
                      <p className="text-xs text-muted-foreground">{log.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{log.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Automations;
