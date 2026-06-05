import { useEffect, useState } from 'react'
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  EyeOff,
  CheckSquare,
  Square,
  Filter,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface ScheduledMessage {
  _id: string
  message: string
  users: string[]
  scheduledTime: string
  status: 'scheduled' | 'sent' | 'failed'
  hidden: boolean
  campaign?: string
  results?: {
    phone: string
    status: string
    error?: string
  }[]
}

export default function ScheduledMessages() {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    showHidden: false
  })
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const itemsPerPage = 10

  const fetchScheduledMessages = async () => {
    try {
      setLoading(true)
      const res = await api.get('/scheduled-messages')
      setScheduledMessages(res.data)
      setSelectedMessages([])
    } catch (err) {
      toast.error('Failed to load scheduled messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScheduledMessages()
  }, [])

  const handleRefresh = () => fetchScheduledMessages()

  const toggleSelectAll = () => {
    if (selectedMessages.length === currentMessages.length) {
      setSelectedMessages([])
    } else {
      setSelectedMessages(currentMessages.map(msg => msg._id))
    }
  }

  const toggleMessageSelection = (id: string) => {
    setSelectedMessages(prev =>
      prev.includes(id) ? prev.filter(msgId => msgId !== id) : [...prev, id]
    )
  }

  const toggleMessageVisibility = async (ids: string[], hide: boolean) => {
    try {
      setLoading(true)
      await api.post('/scheduled-messages/visibility', { ids, hidden: hide })
      setScheduledMessages(
        scheduledMessages.map(msg =>
          ids.includes(msg._id) ? { ...msg, hidden: hide } : msg
        )
      )
      setSelectedMessages([])
      toast.success(hide ? 'Messages hidden' : 'Messages restored')
    } catch (err) {
      toast.error('Error updating visibility')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (newFilters: Partial<typeof filters>) => {
    setFilters({ ...filters, ...newFilters })
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      status: 'all',
      date: '',
      showHidden: false
    })
  }

  const filteredMessages = scheduledMessages.filter(msg => {
    const matchesSearch =
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.users?.some((user: string) => user.includes(searchTerm))

    const matchesStatus = filters.status === 'all' || msg.status === filters.status

    const matchesDate = !filters.date || new Date(msg.scheduledTime).toDateString() === new Date(filters.date).toDateString()

    return matchesSearch && matchesStatus && matchesDate
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentMessages = filteredMessages.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage)

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Scheduled Messages History
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Track and manage your message delivery history.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input 
                placeholder="Search messages..." 
                className="pl-9 h-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
               />
             </div>
             <select 
               className="flex h-10 w-full md:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
               value={filters.status} 
               onChange={e => applyFilters({ status: e.target.value })}
             >
               <option value="all">All Status</option>
               <option value="scheduled">Scheduled</option>
               <option value="sent">Sent</option>
               <option value="failed">Failed</option>
             </select>
             <Input 
              type="date" 
              className="w-full md:w-40 h-10" 
              value={filters.date} 
              onChange={e => applyFilters({ date: e.target.value })} 
             />
             <Button variant="outline" size="icon" className="h-10 w-10" onClick={handleRefresh} disabled={loading}>
               <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
             </Button>
             <Button variant="outline" onClick={clearFilters}>Clear</Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedMessages.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-center justify-between border border-blue-100">
               <span className="text-sm font-medium text-blue-700">{selectedMessages.length} messages selected</span>
               <div className="flex gap-2">
                 <Button size="sm" variant="outline" onClick={() => toggleMessageVisibility(selectedMessages, true)}>
                   <EyeOff className="h-4 w-4 mr-2" />
                   Hide Selected
                 </Button>
               </div>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-12 text-center">
                    <Checkbox 
                      checked={selectedMessages.length === currentMessages.length && currentMessages.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead className="max-w-md">Message</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && scheduledMessages.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                ) : currentMessages.length > 0 ? (
                  currentMessages.map((msg, index) => (
                    <TableRow key={msg._id} className={msg.hidden ? 'opacity-50 grayscale' : ''}>
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={selectedMessages.includes(msg._id)}
                          onCheckedChange={() => toggleMessageSelection(msg._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {msg.users.length === 1 ? `+${msg.users[0]}` : `${msg.users.length} recipients`}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        <span className="text-sm" title={msg.message}>{msg.message}</span>
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
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => toggleMessageVisibility([msg._id], !msg.hidden)}>
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No messages found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {!loading && filteredMessages.length > itemsPerPage && (
             <div className="flex items-center justify-between mt-6 px-2">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium text-foreground">{Math.min(indexOfLastItem, filteredMessages.length)}</span> of{' '}
                  <span className="font-medium text-foreground">{filteredMessages.length}</span> results
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="flex items-center px-4 text-sm font-medium">Page {currentPage} of {totalPages}</div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
