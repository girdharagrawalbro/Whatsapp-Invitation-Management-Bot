import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import {
  User as UserIcon,
  Mail,
  Phone,
  Info,
  LogOut,
  ChevronLeft,
  Settings as SettingsIcon,
  ShieldCheck,
  Bell,
  Ticket
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin' || !user?.role; // Default to admin for safety

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <Card className="border-none shadow-sm h-fit">
          <CardHeader className="flex flex-col items-center pt-8 pb-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.username || 'User')}`} />
              <AvatarFallback className="bg-blue-600 text-white text-3xl font-bold">
                {user?.name?.[0] || user?.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center mt-4">
              <CardTitle className="text-xl">{user?.name || user?.username || 'User'}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 capitalize">{user?.role || 'Organization Admin'}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Email</p>
                <p className="font-medium truncate">{user?.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Phone</p>
                <p className="font-medium">+{user?.phone || user?.adminPhone || 'Not linked'}</p>
              </div>
            </div>
          </CardContent>
          <div className="h-px bg-slate-200 my-4" />
          <CardFooter className="pt-6">
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>

        {/* Right Column: Sections */}
        <div className="md:col-span-2 space-y-6">
          {isAdmin ? (
            <>
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Organization Name</p>
                      <p className="font-medium">{user?.name || 'Invitely Bot Admin'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Joined Date</p>
                      <p className="font-medium">
                        {user?.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-slate-200 my-4" />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      About
                    </p>
                    <p className="text-sm text-slate-600 italic">
                      Professional WhatsApp invitation management for high-scale events and organization outreach.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    System Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
                    <div>
                      <p className="font-medium">WhatsApp Webhook</p>
                      <p className="text-xs text-muted-foreground">Receive real-time delivery status</p>
                    </div>
                    <Badge className={`${
                      user?.openwa?.status === 'CONNECTED' || user?.openwa?.status === 'authenticated'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                    } border-none capitalize`}>
                      {user?.openwa?.status || 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-blue-600" />
                    My Invitation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
                    <div>
                      <p className="font-medium">Invitation Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive alerts for new events</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">On</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
                    <div>
                      <p className="font-medium">Auto-RSVP Reminders</p>
                      <p className="text-xs text-muted-foreground">Receive reminders for pending RSVPs</p>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;