import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { cn } from '@/lib/utils'
import { fetchUsers, fetchEvents, fetchTemplates, fetchWaStatus } from '../services/apiService'

interface User {
  _id: string
  phone: string
  name?: string
  role?: string
  createdAt?: string
  lastActiveAt?: string
  type?: string
}

interface Event {
  _id: string
  title: string
  eventDate: string
  eventTime: string
  venue?: {
    name: string
    address: string
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  const { data: events = [], isLoading: isLoadingEvents, refetch: refetchEvents } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: fetchEvents
  });

  const { data: templates = [], isLoading: isLoadingTemplates, refetch: refetchTemplates } = useQuery<any[]>({
    queryKey: ['templates'],
    queryFn: fetchTemplates
  });

  const { data: waSession = { authenticated: false }, isLoading: isLoadingWa, refetch: refetchWa } = useQuery({
    queryKey: ['wa-session'],
    queryFn: fetchWaStatus
  });

  const loading = isLoadingUsers || isLoadingEvents || isLoadingTemplates;
  const waChecking = isLoadingWa;
  const waConnected = waSession?.authenticated || false;
  const templatesCount = Array.isArray(templates) ? templates.length : 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchUsers(),
        refetchEvents(),
        refetchTemplates(),
        refetchWa()
      ]);
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#3fc07c]" />
        <p className="text-slate-500 font-medium">Loading management dashboard...</p>
      </div>
    )
  }

  // Analytics derivations
  const totalUsers = users.length;
  const adminUsersCount = users.filter(u => u.role === 'admin').length;
  const normalUsersCount = users.filter(u => u.role !== 'admin').length;
  const totalEvents = events.length;

  // Sorting recent entities
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  const recentEvents = [...events]
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-[#fdfdfd] min-h-screen">
      {/* Header Profile Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#3fc07c]/10 flex items-center justify-center text-[#3fc07c] font-black text-xl">
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{user?.name || 'Invitely Admin'}</h1>
              <Badge className="bg-[#3fc07c]/10 text-[#3fc07c] border-none font-bold uppercase text-[10px]">Management</Badge>
            </div>
            <div className="flex items-center gap-3 text-slate-500 text-sm mt-1">
              <span>{user?.email}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              {waChecking ? (
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <Loader2 className="h-4 w-4 animate-spin" /> Gateway status...
                </span>
              ) : waConnected ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> WhatsApp Gateway Linked
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <AlertCircle className="h-4 w-4" /> WhatsApp Gateway Disconnected
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing} className="h-10 w-10">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => navigate('/manageusers')} className="bg-[#3fc07c] hover:bg-[#2da05f] text-white font-bold h-10 px-4 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95">
            Manage Users
          </Button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users className="h-6 w-6" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900">{totalUsers}</p>
              <p className="text-sm font-bold text-slate-500">Total Registered Users</p>
              <div className="flex gap-2 mt-2 text-xs font-semibold text-slate-400">
                <span>{normalUsersCount} normal</span>
                <span>•</span>
                <span>{adminUsersCount} admins</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Events */}
        <Card className="border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Calendar className="h-6 w-6" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 font-bold border-none text-[10px]">RSVP Active</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900">{totalEvents}</p>
              <p className="text-sm font-bold text-slate-500">Total Invitations</p>
              <p className="text-xs text-slate-400 mt-2 font-semibold">Scheduled invitation lists</p>
            </div>
          </CardContent>
        </Card>

        {/* Templates Count */}
        <Card className="border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-amber-50 p-3 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900">{templatesCount}</p>
              <p className="text-sm font-bold text-slate-500">WhatsApp Templates</p>
              <p className="text-xs text-slate-400 mt-2 font-semibold">Pre-approved message layouts</p>
            </div>
          </CardContent>
        </Card>

        {/* Gateway Status */}
        <Card className="border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className={cn("p-3 rounded-2xl transition-colors", waConnected ? "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white" : "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white")}>
                <MessageSquare className="h-6 w-6" />
              </div>
              <Badge variant="outline" className={cn("font-bold text-[10px] uppercase", waConnected ? "text-green-600 border-green-200" : "text-rose-600 border-rose-200")}>
                {waConnected ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-xl font-black text-slate-900 truncate">
                {waConnected ? "Gateway Active" : "Disconnected"}
              </p>
              <p className="text-sm font-bold text-slate-500">WhatsApp Session</p>
              <Button size="sm" variant="link" onClick={() => navigate('/whatsapp-session')} className="p-0 h-auto text-xs text-[#3fc07c] hover:text-[#2da05f] font-bold mt-2">
                Configure gateway <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Users & Recent Invitations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Users Table */}
        <Card className="border-slate-100 shadow-sm">

          <CardHeader className="pb-3 border-b border-slate-50 flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold">New & Recent Users</CardTitle>
              {/* <p className="text-xs text-slate-500 mt-0.5">Lately registered accounts on Invitely SaaS.</p> */}
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/manageusers')} className="h-8 font-bold border-slate-200 text-xs">
              View All
            </Button>
          </CardHeader>

          <CardContent className="">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>User</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.length > 0 ? (
                    recentUsers.map((item) => (
                      <TableRow key={item._id} className="hover:bg-slate-50/40 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.role === 'admin' ? (
                              <ShieldCheck className="h-4 w-4 text-[#3fc07c] shrink-0" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-slate-400 shrink-0" />
                            )}
                            <div className="font-semibold text-sm text-slate-900 truncate max-w-[150px]">
                              {item.name || 'Anonymous'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-600">
                          {item.phone ? `+${item.phone}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-[10px] font-bold capitalize py-0 px-2 border-none", item.role === 'admin' ? "bg-[#3fc07c] text-white" : "bg-slate-100 text-slate-700")}>
                            {item.role || 'user'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-slate-400 text-sm">
                        No registered users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Invitations / Events Table */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-50 flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold">Recent Invitations</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Lately extracted or created invitation events.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/manageevents')} className="h-8 font-bold border-slate-200 text-xs">
              View All
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Event Title</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Venue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEvents.length > 0 ? (
                    recentEvents.map((event) => (
                      <TableRow key={event._id} className="hover:bg-slate-50/40 transition-colors">
                        <TableCell className="font-semibold text-sm text-slate-900 truncate max-w-[150px]">
                          {event.title}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {new Date(event.eventDate).toLocaleDateString()}
                          {event.eventTime && ` · ${event.eventTime}`}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 truncate max-w-[120px]">
                          {event.venue?.name || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-slate-400 text-sm">
                        No invitation campaigns found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}