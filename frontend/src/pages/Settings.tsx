import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Lock, 
  Bell, 
  Monitor, 
  Globe, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff,
  Check,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  MessageSquare,
  Calendar,
  DollarSign,
  Settings as SettingsIcon,
  Shield
} from 'lucide-react';

type SettingsSection = 'account' | 'security' | 'notifications' | 'display' | 'regional';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  
  // Account settings state
  const [accountData, setAccountData] = useState({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc.',
    jobTitle: 'Property Manager'
  });

  // Security settings state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    paymentAlerts: true,
    deliveryNotifications: true,
    vendorMessages: true,
    systemAlerts: true,
    weeklyReports: false,
    monthlyReports: true,
    soundEnabled: true,
    desktopNotifications: true
  });

  // Display settings state
  const [displaySettings, setDisplaySettings] = useState({
    compactView: false,
    sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
    showAvatars: true,
    animationsEnabled: true
  });

  // Regional settings state
  const [regionalSettings, setRegionalSettings] = useState({
    language: 'en',
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    numberFormat: 'en-US'
  });

  const handleAccountSave = () => {
    toast({
      title: "Account Updated",
      description: "Your account information has been saved successfully.",
    });
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleNotificationSave = () => {
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleDisplaySave = () => {
    toast({
      title: "Display Settings Saved",
      description: "Your display preferences have been updated.",
    });
  };

  const handleRegionalSave = () => {
    toast({
      title: "Regional Settings Saved",
      description: "Your regional preferences have been updated.",
    });
  };

  const menuItems = [
    { id: 'account' as SettingsSection, icon: User, label: 'Account' },
    { id: 'security' as SettingsSection, icon: Lock, label: 'Security' },
    { id: 'notifications' as SettingsSection, icon: Bell, label: 'Notifications' },
    { id: 'display' as SettingsSection, icon: Monitor, label: 'Display' },
    { id: 'regional' as SettingsSection, icon: Globe, label: 'Regional Settings' },
  ];

  return (
    <PageLayout title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(item.id)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          {/* Account Settings */}
          {activeSection === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={accountData.firstName}
                      onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={accountData.lastName}
                      onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={accountData.email}
                        onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-10"
                        value={accountData.phone}
                        onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={accountData.company}
                      onChange={(e) => setAccountData({ ...accountData, company: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={accountData.jobTitle}
                      onChange={(e) => setAccountData({ ...accountData, jobTitle: e.target.value })}
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setAccountData({
                    firstName: 'John',
                    lastName: 'Smith',
                    email: 'john.smith@example.com',
                    phone: '+1 (555) 123-4567',
                    company: 'Tech Solutions Inc.',
                    jobTitle: 'Property Manager'
                  })}>
                    Cancel
                  </Button>
                  <Button onClick={handleAccountSave}>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  })}>
                    Cancel
                  </Button>
                  <Button onClick={handlePasswordChange}>
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="font-medium">Enable 2FA</p>
                        <p className="text-sm text-muted-foreground">
                          Require a verification code in addition to your password
                        </p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  {/* Notification Channels */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Notification Channels
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications via email
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications.emailNotifications}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, emailNotifications: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Push Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive browser push notifications
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications.pushNotifications}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, pushNotifications: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">SMS Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications via text message
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications.smsNotifications}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, smsNotifications: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Activity Notifications */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Activity Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order Updates</p>
                          <p className="text-sm text-muted-foreground">
                            Get notified about order status changes
                          </p>
                        </div>
                        <Switch
                          checked={notifications.orderUpdates}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, orderUpdates: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Payment Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Notifications for payment activities
                          </p>
                        </div>
                        <Switch
                          checked={notifications.paymentAlerts}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, paymentAlerts: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Delivery Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Updates on delivery status and schedules
                          </p>
                        </div>
                        <Switch
                          checked={notifications.deliveryNotifications}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, deliveryNotifications: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Vendor Messages</p>
                          <p className="text-sm text-muted-foreground">
                            Messages and updates from vendors
                          </p>
                        </div>
                        <Switch
                          checked={notifications.vendorMessages}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, vendorMessages: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">System Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Important system notifications and updates
                          </p>
                        </div>
                        <Switch
                          checked={notifications.systemAlerts}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, systemAlerts: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Report Notifications */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Report Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Weekly Reports</p>
                          <p className="text-sm text-muted-foreground">
                            Receive weekly summary reports
                          </p>
                        </div>
                        <Switch
                          checked={notifications.weeklyReports}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, weeklyReports: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Monthly Reports</p>
                          <p className="text-sm text-muted-foreground">
                            Receive monthly summary reports
                          </p>
                        </div>
                        <Switch
                          checked={notifications.monthlyReports}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, monthlyReports: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Sound & Desktop */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Sound & Desktop
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {notifications.soundEnabled ? (
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <VolumeX className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium">Sound Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Play sounds for notifications
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications.soundEnabled}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, soundEnabled: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Desktop Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Show notifications on desktop
                          </p>
                        </div>
                        <Switch
                          checked={notifications.desktopNotifications}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, desktopNotifications: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Reset to Default</Button>
                  <Button onClick={handleNotificationSave}>
                    <Check className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Display Settings */}
          {activeSection === 'display' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? (
                        <Moon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Sun className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred color scheme
                        </p>
                      </div>
                    </div>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact View</p>
                      <p className="text-sm text-muted-foreground">
                        Display more content with reduced spacing
                      </p>
                    </div>
                    <Switch
                      checked={displaySettings.compactView}
                      onCheckedChange={(checked) => 
                        setDisplaySettings({ ...displaySettings, compactView: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Collapsed Sidebar</p>
                      <p className="text-sm text-muted-foreground">
                        Show sidebar in collapsed state by default
                      </p>
                    </div>
                    <Switch
                      checked={displaySettings.sidebarCollapsed}
                      onCheckedChange={(checked) => {
                        setDisplaySettings({ ...displaySettings, sidebarCollapsed: checked });
                        localStorage.setItem('sidebarCollapsed', String(checked));
                        // Notify other components about the preference change
                        window.dispatchEvent(
                          new CustomEvent('sidebarPreferenceChanged', { 
                            detail: { collapsed: checked } 
                          })
                        );
                        toast({
                          title: "Sidebar Preference Updated",
                          description: `Sidebar will be ${checked ? 'collapsed' : 'expanded'} by default.`,
                        });
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Avatars</p>
                      <p className="text-sm text-muted-foreground">
                        Display user avatars throughout the app
                      </p>
                    </div>
                    <Switch
                      checked={displaySettings.showAvatars}
                      onCheckedChange={(checked) => 
                        setDisplaySettings({ ...displaySettings, showAvatars: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Animations</p>
                      <p className="text-sm text-muted-foreground">
                        Show smooth transitions and animations
                      </p>
                    </div>
                    <Switch
                      checked={displaySettings.animationsEnabled}
                      onCheckedChange={(checked) => 
                        setDisplaySettings({ ...displaySettings, animationsEnabled: checked })
                      }
                    />
                  </div>
                </div>
                
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Reset to Default</Button>
                  <Button onClick={handleDisplaySave}>
                    <Check className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regional Settings */}
          {activeSection === 'regional' && (
            <Card>
              <CardHeader>
                <CardTitle>Regional Preferences</CardTitle>
                <CardDescription>
                  Configure language, timezone, and formatting options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={regionalSettings.language}
                      onValueChange={(value) => 
                        setRegionalSettings({ ...regionalSettings, language: value })
                      }
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Select 
                        value={regionalSettings.timezone}
                        onValueChange={(value) => 
                          setRegionalSettings({ ...regionalSettings, timezone: value })
                        }
                      >
                        <SelectTrigger id="timezone" className="pl-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC-12">UTC-12:00 Baker Island</SelectItem>
                          <SelectItem value="UTC-11">UTC-11:00 American Samoa</SelectItem>
                          <SelectItem value="UTC-10">UTC-10:00 Hawaii</SelectItem>
                          <SelectItem value="UTC-9">UTC-09:00 Alaska</SelectItem>
                          <SelectItem value="UTC-8">UTC-08:00 Pacific Time</SelectItem>
                          <SelectItem value="UTC-7">UTC-07:00 Mountain Time</SelectItem>
                          <SelectItem value="UTC-6">UTC-06:00 Central Time</SelectItem>
                          <SelectItem value="UTC-5">UTC-05:00 Eastern Time</SelectItem>
                          <SelectItem value="UTC-4">UTC-04:00 Atlantic Time</SelectItem>
                          <SelectItem value="UTC-3">UTC-03:00 Buenos Aires</SelectItem>
                          <SelectItem value="UTC-2">UTC-02:00 Mid-Atlantic</SelectItem>
                          <SelectItem value="UTC-1">UTC-01:00 Azores</SelectItem>
                          <SelectItem value="UTC+0">UTC+00:00 London</SelectItem>
                          <SelectItem value="UTC+1">UTC+01:00 Paris</SelectItem>
                          <SelectItem value="UTC+2">UTC+02:00 Cairo</SelectItem>
                          <SelectItem value="UTC+3">UTC+03:00 Moscow</SelectItem>
                          <SelectItem value="UTC+4">UTC+04:00 Dubai</SelectItem>
                          <SelectItem value="UTC+5">UTC+05:00 Pakistan</SelectItem>
                          <SelectItem value="UTC+6">UTC+06:00 Bangladesh</SelectItem>
                          <SelectItem value="UTC+7">UTC+07:00 Bangkok</SelectItem>
                          <SelectItem value="UTC+8">UTC+08:00 Singapore</SelectItem>
                          <SelectItem value="UTC+9">UTC+09:00 Tokyo</SelectItem>
                          <SelectItem value="UTC+10">UTC+10:00 Sydney</SelectItem>
                          <SelectItem value="UTC+11">UTC+11:00 Solomon Islands</SelectItem>
                          <SelectItem value="UTC+12">UTC+12:00 New Zealand</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Select 
                        value={regionalSettings.dateFormat}
                        onValueChange={(value) => 
                          setRegionalSettings({ ...regionalSettings, dateFormat: value })
                        }
                      >
                        <SelectTrigger id="dateFormat" className="pl-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                          <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (31.12.2024)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Select 
                      value={regionalSettings.timeFormat}
                      onValueChange={(value) => 
                        setRegionalSettings({ ...regionalSettings, timeFormat: value })
                      }
                    >
                      <SelectTrigger id="timeFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (3:30 PM)</SelectItem>
                        <SelectItem value="24h">24-hour (15:30)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Select 
                        value={regionalSettings.currency}
                        onValueChange={(value) => 
                          setRegionalSettings({ ...regionalSettings, currency: value })
                        }
                      >
                        <SelectTrigger id="currency" className="pl-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen (¥)</SelectItem>
                          <SelectItem value="CNY">CNY - Chinese Yuan (¥)</SelectItem>
                          <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar ($)</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberFormat">Number Format</Label>
                    <Select 
                      value={regionalSettings.numberFormat}
                      onValueChange={(value) => 
                        setRegionalSettings({ ...regionalSettings, numberFormat: value })
                      }
                    >
                      <SelectTrigger id="numberFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">1,234.56 (US)</SelectItem>
                        <SelectItem value="de-DE">1.234,56 (German)</SelectItem>
                        <SelectItem value="fr-FR">1 234,56 (French)</SelectItem>
                        <SelectItem value="en-IN">1,23,456.78 (Indian)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Reset to Default</Button>
                  <Button onClick={handleRegionalSave}>
                    <Check className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
