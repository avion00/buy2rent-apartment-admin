import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, MailOpen, Send } from 'lucide-react';

const Inbox = () => {
  const [selectedThread, setSelectedThread] = useState(1);

  const threads = [
    {
      id: 1,
      vendor: "IKEA",
      subject: "RMA Request #2024-001",
      preview: "We've received your RMA request and will process it within 2-3 business days...",
      unread: true,
      lastMessage: "2h ago",
      messages: [
        { sender: "You", time: "2h ago", content: "Hello, I'd like to request an RMA for order #12345. The sofa arrived damaged." },
        { sender: "IKEA Support", time: "1h ago", content: "We've received your RMA request and will process it within 2-3 business days. Please provide photos of the damage." }
      ]
    },
    {
      id: 2,
      vendor: "Wayfair",
      subject: "Order #67890 Delivery Update",
      preview: "Your order is scheduled for delivery on January 20th...",
      unread: false,
      lastMessage: "1d ago",
      messages: [
        { sender: "Wayfair", time: "1d ago", content: "Your order is scheduled for delivery on January 20th between 9 AM - 5 PM." },
        { sender: "You", time: "1d ago", content: "Thank you for the update!" }
      ]
    },
    {
      id: 3,
      vendor: "West Elm",
      subject: "Payment Reminder - Invoice #INV-2024-003",
      preview: "This is a reminder that invoice #INV-2024-003 is due on January 20th...",
      unread: true,
      lastMessage: "3h ago",
      messages: [
        { sender: "West Elm", time: "3h ago", content: "This is a reminder that invoice #INV-2024-003 is due on January 20th. Amount: $1,599.99" }
      ]
    },
    {
      id: 4,
      vendor: "CB2",
      subject: "Out of Stock Notification",
      preview: "We regret to inform you that the Floor Lamp Modern is currently out of stock...",
      unread: false,
      lastMessage: "2d ago",
      messages: [
        { sender: "CB2", time: "2d ago", content: "We regret to inform you that the Floor Lamp Modern is currently out of stock. Expected restock: February 1st." },
        { sender: "You", time: "2d ago", content: "Can you suggest an alternative?" },
        { sender: "CB2", time: "2d ago", content: "Certainly! We have the Arc Floor Lamp which is similar in style and currently in stock." }
      ]
    }
  ];

  const selectedThreadData = threads.find(t => t.id === selectedThread);

  return (
    <PageLayout title="Inbox & Notifications">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Thread List */}
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <ScrollArea className="h-full">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Vendor Messages</h3>
                <p className="text-sm text-muted-foreground">
                  {threads.filter(t => t.unread).length} unread
                </p>
              </div>
              <div className="divide-y">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThread(thread.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedThread === thread.id
                        ? 'bg-muted'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {thread.unread ? (
                          <Mail className="h-4 w-4 text-primary" />
                        ) : (
                          <MailOpen className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={`font-medium text-sm ${thread.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {thread.vendor}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{thread.lastMessage}</span>
                    </div>
                    <p className={`text-sm mb-1 ${thread.unread ? 'font-medium' : 'text-muted-foreground'}`}>
                      {thread.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {thread.preview}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0 flex flex-col h-full">
            {selectedThreadData ? (
              <>
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedThreadData.vendor}</h3>
                      <p className="text-sm text-muted-foreground">{selectedThreadData.subject}</p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedThreadData.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.sender === 'You'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold">{message.sender}</span>
                            <span className="text-xs opacity-70">{message.time}</span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Reply Box */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <EnhancedTextarea
                      placeholder="Type your message..."
                      className="min-h-[80px]"
                    />
                    <Button size="icon" className="shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a conversation to view messages
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Inbox;
