import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, User } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ManualMessageDialogProps {
  open: boolean;
  onClose: () => void;
  issueId: string;
  vendorEmail: string;
  vendorName: string;
  onMessageSent: () => void;
}

export const ManualMessageDialog: React.FC<ManualMessageDialogProps> = ({
  open,
  onClose,
  issueId,
  vendorEmail,
  vendorName,
  onMessageSent,
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.warning('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const response = await api.post(`/issues/${issueId}/send_manual_message/`, {
        message,
        to_email: vendorEmail,
      });

      if (response.data.success) {
        toast.success('Message sent successfully');
        setMessage('');
        onMessageSent();
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]" aria-describedby="manual-message-description">
        <DialogHeader>
          <DialogTitle>Send Manual Message to Vendor</DialogTitle>
          <DialogDescription id="manual-message-description">
            Send a manual email message to {vendorName} ({vendorEmail})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[200px]"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Subject will be automatically generated with order reference
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>This message will be sent manually without AI processing</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !message.trim()}>
            {sending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualMessageDialog;
