import { useEffect, useState } from 'react'
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Calendar,
  User,
  Users,
  Clock,
  Send
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserItem {
  _id: string
  phone: string
  name?: string
  isSupporter?: boolean
  type: string
}

interface ScheduledMessage {
  _id: string
  message: string
  users: string[]
  scheduledTime: string
  status: 'scheduled' | 'sent' | 'failed'
  hidden: boolean
  campaign: string
}

interface MessageTemplate {
  _id: string
  name: string
  content: string
  isActive: boolean
}

export default function MessageScheduler() {
  const [message, setMessage] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([])
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [recipientSearch, setRecipientSearch] = useState('')
  const [loading, setLoading] = useState({
    users: false,
    messages: false,
    sending: false
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [audience, setAudience] = useState<'all' | 'invitation' | 'contact'>('all')
  const [campaign, setCampaign] = useState('')
  const itemsPerPage = 10

  const fetchUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }))
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }

  const fetchScheduledMessages = async () => {
    try {
      setLoading(prev => ({ ...prev, messages: true }))
      const res = await api.get('/scheduled-messages')
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todaysMessages = res.data.filter((msg: ScheduledMessage) => {
        const msgDate = new Date(msg.scheduledTime)
        return msgDate >= today && msgDate < tomorrow
      })

      setScheduledMessages(todaysMessages)
    } catch (err) {
      toast.error('Failed to load scheduled messages')
    } finally {
      setLoading(prev => ({ ...prev, messages: false }))
    }
  }

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates')
      setTemplates(res.data || [])
    } catch (err) {
      toast.error('Failed to load templates')
    }
  }

  useEffect(() => {
    fetchScheduledMessages()
    fetchTemplates()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t._id === selectedTemplateId)
      if (template) setMessage(template.content)
    }
  }, [selectedTemplateId, templates])

  const setNow = () => {
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
    setScheduledTime(formatted)
  }

  const handleUserToggle = (phone: string) => {
    setSelectedUsers(prev =>
      prev.includes(phone) ? prev.filter(u => u !== phone) : [...prev, phone]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredRecipients.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredRecipients.map(user => user.phone))
    }
  }

  const formatPhone = (phone: string) => phone ? `+${phone}` : ''

  const handleSend = async () => {
    if (!message || selectedUsers.length === 0) {
      toast.error('Please enter a message and select recipients')
      return
    }

    try {
      setLoading(prev => ({ ...prev, sending: true }))
      await api.post('/send', {
        message,
        users: selectedUsers,
        scheduledTime: scheduledTime || undefined,
        audience,
        campaign: campaign || undefined
      })

      toast.success('Message scheduled successfully!')
      setMessage('')
      setScheduledTime('')
      setSelectedUsers([])
      setCampaign('')
      fetchScheduledMessages()
    } catch (err) {
      toast.error('Error scheduling message')
    } finally {
      setLoading(prev => ({ ...prev, sending: false }))
    }
  }

  const filteredRecipients = users.filter(user => {
    if (audience !== 'all' && user.type !== audience) return false;
    if (recipientSearch) {
      const s = recipientSearch.toLowerCase();
      return user.phone.includes(s) || (user.name && user.name.toLowerCase().includes(s));
    }
    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentMessages = scheduledMessages.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(scheduledMessages.length / itemsPerPage)

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Composer */}
        <Card className="xl:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Compose Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Template</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedTemplateId} 
                  onChange={e => setSelectedTemplateId(e.target.value)}
                >
                  <option value="">Choose a template</option>
                  {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign Name</label>
                <Input placeholder="E.g. Festival Greetings" value={campaign} onChange={e => setCampaign(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message Content</label>
              <Textarea 
                placeholder="Type your WhatsApp message here..." 
                className="min-h-[150px]"
                value={message}
                onChange={e => { setMessage(e.target.value); setSelectedTemplateId(''); }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule Time (Optional)</label>
              <div className="flex gap-2">
                <Input 
                  type="datetime-local" 
                  className="flex-1"
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <Button variant="outline" onClick={setNow}>
                  <Clock className="h-4 w-4 mr-2" />
                  Now
                </Button>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-lg" 
              onClick={handleSend}
              disabled={loading.sending || !message || selectedUsers.length === 0}
            >
              {loading.sending ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
              {scheduledTime ? 'Schedule Message' : 'Send Now'}
            </Button>
          </CardContent>
        </Card>

        {/* Recipient Selection */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Recipients
              </div>
              <Badge variant="secondary">{selectedUsers.length} selected</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <select 
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={audience} 
                onChange={e => setAudience(e.target.value as any)}
              >
                <option value="all">All Audiences</option>
                <option value="contact">Regular Contacts</option>
                <option value="invitation">Invitation Guests</option>
              </select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search names or phone..." 
                  className="pl-9 h-9"
                  value={recipientSearch}
                  onChange={e => setRecipientSearch(e.target.value)}
                />
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={handleSelectAll}>
              <CheckSquare className="h-4 w-4 mr-2" />
              {selectedUsers.length === filteredRecipients.length ? 'Deselect All' : 'Select All'}
            </Button>

            <div className="border rounded-md h-[380px] overflow-auto p-1 space-y-1">
              {loading.users ? (
                <div className="h-full flex items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : filteredRecipients.length > 0 ? (
                filteredRecipients.map(user => (
                  <div 
                    key={user._id}
                    onClick={() => handleUserToggle(user.phone)}
                    className={`p-2.5 rounded-md border cursor-pointer transition-all flex items-center gap-3 ${
                      selectedUsers.includes(user.phone) ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-full ${selectedUsers.includes(user.phone) ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{user.name || 'Anonymous'}</div>
                      <div className="text-xs text-muted-foreground font-mono">+{user.phone}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Users className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Queue */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Today's Scheduled Messages
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchScheduledMessages} disabled={loading.messages}>
            <RefreshCw className={`h-4 w-4 ${loading.messages ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-12 text-center">S.No</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead className="max-w-md">Message</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Campaign</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading.messages ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                ) : currentMessages.length > 0 ? (
                  currentMessages.map((msg, index) => (
                    <TableRow key={msg._id}>
                      <TableCell className="text-center">{indexOfFirstItem + index + 1}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {msg.users.length === 1 ? `+${msg.users[0]}` : `${msg.users.length} recipients`}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        <span className="text-sm">{msg.message}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {msg.scheduledTime ? new Date(msg.scheduledTime).toLocaleString() : 'Immediate'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          msg.status === 'sent' ? 'default' : 
                          msg.status === 'scheduled' ? 'secondary' : 'destructive'
                        } className="capitalize">
                          {msg.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {msg.campaign || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No scheduled messages for today</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {scheduledMessages.length > itemsPerPage && (
             <div className="flex items-center justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
