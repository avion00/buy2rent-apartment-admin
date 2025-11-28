import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar } from 'lucide-react';

const Reports = () => {
  const reports = [
    {
      name: "Monthly Procurement Summary",
      description: "Overview of all items ordered, delivered, and pending",
      lastGenerated: "January 15, 2024",
      type: "PDF"
    },
    {
      name: "Vendor Performance Report",
      description: "Analysis of delivery times, quality issues, and payment history",
      lastGenerated: "January 10, 2024",
      type: "Excel"
    },
    {
      name: "Budget vs Actual Spend",
      description: "Comparison of planned budget against actual expenditure",
      lastGenerated: "January 12, 2024",
      type: "PDF"
    },
    {
      name: "Issues & RMA Report",
      description: "Summary of all quality issues and return merchandise authorizations",
      lastGenerated: "January 14, 2024",
      type: "PDF"
    }
  ];

  return (
    <PageLayout title="Reports">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Generate and download procurement reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{report.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                          <Calendar className="h-3 w-3" />
                          <span>Last generated: {report.lastGenerated}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            Generate New
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Reports;
