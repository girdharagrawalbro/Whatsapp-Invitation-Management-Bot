import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  Settings, 
  Pause, 
  Trash2, 
  Upload, 
  FileText, 
  Plus, 
  ExternalLink,
  Clock,
  Globe,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Event {
  _id: string
  title: string
  eventDate: string
  eventTime: string
  venue: {
    name: string
    address: string
  }
  rsvp: string
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, total: 0 });
  const [events, setEvents] = useState<Event[]>([]);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [isPaused, setIsPaused] = useState(user?.isServicePaused || false);
  const [waConnected, setWaConnected] = useState<boolean>(false);
  const [waChecking, setWaChecking] = useState<boolean>(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, eventsRes, waStatusRes] = await Promise.all([
          api.get('/events/stats'),
          api.get('/events'),
          api.get('/openwa-session/status').catch(() => ({ data: { authenticated: false } }))
        ]);
        setStats(statsRes.data);
        setEvents(eventsRes.data);
        setWaConnected(waStatusRes.data?.authenticated || false);
      } catch (error) {
        console.error('Dashboard load failed', error);
      } finally {
        setLoading(false);
        setWaChecking(false);
      }
    };
    fetchDashboard();
  }, [user]);

  const handlePauseToggle = async () => {
    try {
      const newStatus = !isPaused;
      await api.put('/organizations/me', { isServicePaused: newStatus });
      setIsPaused(newStatus);
      toast.success(newStatus ? 'Service paused' : 'Service resumed');
    } catch (err) {
      toast.error('Failed to update service status');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('CRITICAL: This will permanently delete ALL your invitations, reminders, and data. This cannot be undone. Proceed?')) {
      try {
        await api.delete('/organizations/me');
        logout();
        toast.success('Account deleted');
      } catch (err) {
        toast.error('Failed to delete account');
      }
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const [manualEvent, setManualEvent] = useState({
    title: '',
    eventDate: '',
    eventTime: '',
    venue: { name: '', address: '' },
    notes: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', type);

    try {
      const response = await api.post('/events/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Event details extracted!');
      setEvents(prev => [response.data.extractedData, ...prev]);
    } catch (err) {
      toast.error('Failed to extract event details');
    } finally {
      setIsUploading(false);
    }
  };



  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/events', manualEvent);
      toast.success('Event added successfully');
      setEvents(prev => [response.data, ...prev]);
      setShowManualAdd(false);
      setManualEvent({ title: '', eventDate: '', eventTime: '', venue: { name: '', address: '' }, notes: '' });
    } catch (err) {
      toast.error('Failed to add event');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-[#fdfdfd] min-h-screen">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user?.name || 'User Profile'}</h1>
            <div className="flex items-center gap-3 text-slate-500 text-sm mt-1">
              <span>+91 {user?.phone}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              {waChecking ? (
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking WhatsApp status...
                </span>
              ) : waConnected ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> WhatsApp Linked
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 font-medium animate-pulse">
                  <AlertCircle className="h-4 w-4" /> WhatsApp Disconnected
                </span>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" className="gap-2 border-slate-200">
          Edit profile <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* WhatsApp Disconnected Action Banner */}
      {!waChecking && !waConnected && (
        <Card className="bg-amber-50 border-amber-100 shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-600 p-2 rounded-lg text-white">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start flex-col sm:flex-row gap-3">
                <div>
                  <p className="font-bold text-amber-950">WhatsApp Device Disconnected</p>
                  <p className="text-sm text-amber-700">Link your WhatsApp device using the zero-cost OpenWA gateway to start automating invitation campaigns and receiving RSVPs.</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/whatsapp-session')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-9 px-4 rounded-lg shadow-md shadow-amber-600/10 cursor-pointer self-start sm:self-center shrink-0"
                >
                  Link WhatsApp Device
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Calendar className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900">{stats.today}</p>
              <p className="text-slate-500 font-medium">events scheduled today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <MessageSquare className="h-6 w-6" />
              </div>
              <span className="text-emerald-600 text-sm font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900">{stats.total}</p>
              <p className="text-slate-500 font-medium">saved this month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invitations List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-slate-900">My invitations</h2>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">{events.length} total</Badge>
          </div>

          <Card className="border-slate-100 shadow-sm divide-y divide-slate-100">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event._id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900">{event.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {new Date(event.eventDate).toLocaleDateString()} · {event.eventTime} · {event.venue?.name || 'No Venue'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">
                <Calendar className="h-12 w-12 mx-auto opacity-20 mb-4" />
                <p>No invitations found. Start by forwarding a card!</p>
              </div>
            )}
            
            <div className="p-6 grid grid-cols-3 gap-3">
              <div className="relative">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'image')} disabled={isUploading} />
                <Button variant="outline" className="w-full flex flex-col h-auto py-3 gap-1.5 bg-slate-50 border-slate-200">
                  <Upload className="h-5 w-5 text-indigo-600" />
                  <span className="text-xs font-bold">Add via image</span>
                </Button>
              </div>
              <div className="relative">
                <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'pdf')} disabled={isUploading} />
                <Button variant="outline" className="w-full flex flex-col h-auto py-3 gap-1.5 bg-slate-50 border-slate-200">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs font-bold">Add via PDF</span>
                </Button>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowManualAdd(true)}
                className="flex flex-col h-auto py-3 gap-1.5 bg-slate-50 border-slate-200"
              >
                <Plus className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-bold">Add manually</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Settings & Sidebar */}
        <div className="space-y-6">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[17px] font-bold flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-400" /> Account settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center group">
                <div>
                  <p className="font-bold text-slate-800">Daily PDF briefing</p>
                  <p className="text-xs text-slate-500">Every morning at your time</p>
                </div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-2 py-1 rounded-lg cursor-pointer">
                  <Clock className="h-4 w-4" /> 6:00 AM IST
                </div>
              </div>

              <div className="flex justify-between items-center group">
                <div>
                  <p className="font-bold text-slate-800">Event reminders</p>
                  <p className="text-xs text-slate-500">Smart WhatsApp pings</p>
                </div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-2 py-1 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" /> 1 hr before
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="font-bold text-slate-800">Language</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" className="bg-indigo-600 text-white hover:bg-indigo-700">English</Button>
                  <Button variant="outline" className="border-slate-200 text-slate-600">हिंदी</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-rose-100 bg-rose-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Danger zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <Pause className={cn("h-4 w-4", isPaused ? "text-amber-600" : "text-slate-400")} />
                  <span className="text-sm font-bold text-slate-700">{isPaused ? 'Service paused' : 'Service active'}</span>
                </div>
                <Switch 
                  checked={isPaused} 
                  onCheckedChange={handlePauseToggle} 
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleDeleteAccount}
                className="w-full font-bold bg-white text-rose-600 border-rose-100 hover:bg-rose-100"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete all data
              </Button>
              <p className="text-[11px] text-slate-500 leading-tight">
                Pausing stops reminders and PDF briefings without losing your data. Deleting account removes everything permanently.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manual Add Modal */}
      {showManualAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader>
              <CardTitle>Add Invitation Manually</CardTitle>
            </CardHeader>
            <form onSubmit={handleManualSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input required value={manualEvent.title} onChange={e => setManualEvent({...manualEvent, title: e.target.value})} placeholder="e.g. Rahul & Priya's Wedding" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" required value={manualEvent.eventDate} onChange={e => setManualEvent({...manualEvent, eventDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" value={manualEvent.eventTime} onChange={e => setManualEvent({...manualEvent, eventTime: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Venue Name</Label>
                  <Input value={manualEvent.venue.name} onChange={e => setManualEvent({...manualEvent, venue: {...manualEvent.venue, name: e.target.value}})} placeholder="e.g. Grand Hyatt" />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={manualEvent.venue.address} onChange={e => setManualEvent({...manualEvent, venue: {...manualEvent.venue, address: e.target.value}})} placeholder="e.g. MG Road, Bengaluru" />
                </div>
              </CardContent>
              <CardFooter className="gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowManualAdd(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Save Invitation</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {isUploading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="font-bold text-slate-800">AI is extracting details...</p>
          </div>
        </div>
      )}
    </div>
  )
}