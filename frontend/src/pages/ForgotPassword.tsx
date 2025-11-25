import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Mail, CheckCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255, 'Email is too long'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await resetPassword(data.email);
      setEmailSent(true);
      toast({
        title: 'Email sent!',
        description: 'Check your inbox for password reset instructions.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send email',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 relative">
      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-4 right-4 z-10"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-2xl border border-border p-8 lg:p-10 animate-fade-in">
          {!emailSent ? (
            <>
              {/* Back button */}
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to login
              </Link>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">Forgot password?</h1>
                <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register('email')}
                    className={`h-12 text-base ${errors.email ? 'border-destructive' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive font-medium">{errors.email.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold hover:scale-[1.02] transition-all shadow-md" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send reset instructions'}
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-success/10 mb-6">
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">Check your email</h1>
                <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                  We've sent password reset instructions to
                </p>
                <p className="font-semibold text-foreground text-lg mb-6">
                  {getValues('email')}
                </p>
                
                <div className="bg-muted/50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      type="button"
                      onClick={() => setEmailSent(false)}
                      className="text-primary hover:underline font-medium"
                    >
                      try another email address
                    </button>
                  </p>
                </div>

                <Link to="/login">
                  <Button className="w-full h-12 text-base font-semibold hover:scale-[1.02] transition-all">
                    Back to login
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
