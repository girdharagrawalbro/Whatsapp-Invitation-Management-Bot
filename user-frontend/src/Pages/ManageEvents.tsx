import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx';
import {
  RefreshCw,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Table as TableIcon
} from 'lucide-react'
import toast from 'react-hot-toast';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Event {
  _id: string
  title: string
  date: string
  time: string
  description: string
  organizer?: string
  contactPhone?: string
  address?: string
  mediaUrls?: string
  isAttended?: boolean
}

export default function ManageEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [filters, setFilters] = useState({
    date: '',
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    organizer: '',
    contactPhone: '',
    address: '',
    mediaUrls: '',
    isAttended: false
  })

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await api.get('/events')
      setEvents(res.data)
      setError(null)
    } catch (err) {
      setError('Failed to load events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleRefresh = () => fetchEvents()

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post('/events', formData)
      toast.success("Successfully Added")
      setEvents([...events, res.data])
      setShowAddForm(false)
      resetForm()
    } catch (err) {
      toast.error('Failed to add event')
    }
  }

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentEvent) return
    try {
      const res = await api.put(`/events/${currentEvent._id}`, formData)
      toast.success("Successfully Updated")
      setEvents(events.map(ev => (ev._id === res.data._id ? res.data : ev)))
      setShowEditForm(false)
      resetForm()
    } catch (err) {
      toast.error('Failed to update event')
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`)
        setEvents(events.filter(ev => ev._id !== id))
        toast.success('Event deleted')
      } catch (err) {
        toast.error('Failed to delete event')
      }
    }
  }


  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      organizer: '',
      contactPhone: '',
      address: '',
      mediaUrls: '',
      isAttended: false
    })
  }

  const openEditForm = (event: Event) => {
    setCurrentEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      organizer: event.organizer || '',
      contactPhone: event.contactPhone || '',
      address: event.address || '',
      mediaUrls: event.mediaUrls || '',
      isAttended: event.isAttended ?? false,
    });

    setShowEditForm(true)
  }

  const applyFilters = (newFilters: Partial<typeof filters>) => {
    setFilters({ ...filters, ...newFilters })
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      date: '',
    })
  }

  // Filter and pagination logic
  const filteredEvents = events.filter(
    event => {
      const matchesSearch =
        (event.title && event.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.address && event.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.organizer && event.organizer.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesDate =
        !filters.date ||
        new Date(event.date).toDateString() ===
        new Date(filters.date).toDateString()

      return matchesSearch && matchesDate
    })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)

  const exportPDF = async () => {
    if (!filteredEvents || filteredEvents.length === 0) {
      toast.error("No data to make PDF");
      return;
    }

    toast.promise(
      api.post('/makePdf', {
        events: filteredEvents,
        date: filters.date
      }).then(res => {
        window.open(res.data.link, '_blank');
        return res.data;
      }),
      {
        loading: 'Generating PDF...',
        success: <b>PDF generated successfully!</b>,
        error: (err) => <b>{err.response?.data?.error || 'Could not generate PDF.'}</b>,
      }
    );
  };


  // Excel Export handler
  const exportExcel = () => {
    const worksheetData = [
      ["S.No.", "Name", "Description", "Date & Time", "Organizer", "Address", "Contact", "Link"],
      ...currentEvents.map((event, index) => [
        indexOfFirstItem + index + 1,
        event.title,
        event.description,
        event.date ? `${new Date(event.date).toLocaleDateString()} ${event.time}` : '',
        event.organizer,
        event.address,
        event.contactPhone,
        event.mediaUrls || ''
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Events");

    XLSX.writeFile(workbook, "events.xlsx");
  };

  return (
    <div className='bg-slate-50 min-h-screen overflow-auto pb-10'>
      {/* Main Content */}
      <Card className="m-6 border-none shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6">
          <div>
            <CardTitle className="text-xl">Event Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">View and manage all your invitation events.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Input
              type="date"
              className="w-full sm:w-40 h-10"
              onChange={e => applyFilters({ date: e.target.value })}
              value={filters.date}
            />
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading} className="h-10 w-10">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setShowAddForm(true)} className="h-10">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
            <Button variant="outline" onClick={exportPDF} className="h-10">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={exportExcel} className="h-10">
              <TableIcon className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-destructive p-8 text-center bg-destructive/10 rounded-lg">{error}</div>
          ) : loading ? (
            <div className="p-12 flex justify-center items-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="w-12 text-center">S.No</TableHead>
                    <TableHead>Event Details</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentEvents.length > 0 ? (
                    currentEvents.map((event, index) => (
                      <TableRow key={event._id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-center font-medium">
                          {indexOfFirstItem + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{event.description}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</span>
                            <span className="text-xs text-muted-foreground">{event.time || 'No time'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{event.organizer || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{event.address}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono">{event.contactPhone || 'N/A'}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={event.isAttended ? 'default' : 'secondary'} className="rounded-full">
                            {event.isAttended ? 'Attended' : 'Scheduled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditForm(event)} className="h-8 w-8 text-blue-600">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event._id)} className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No events found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredEvents.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 px-2">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium text-foreground">{Math.min(indexOfLastItem, filteredEvents.length)}</span> of{' '}
                <span className="font-medium text-foreground">{filteredEvents.length}</span> events
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <div className="flex items-center px-4 text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forms (Minimal styling for now, ideally use Dialog) */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <Card className="w-full max-w-lg">
             <CardHeader>
               <CardTitle>{showAddForm ? 'Add New Event' : 'Edit Event'}</CardTitle>
             </CardHeader>
             <form onSubmit={showAddForm ? handleAddEvent : handleEditEvent}>
               <CardContent className="space-y-4 max-h-[70vh] overflow-auto">
                 <div className="grid gap-2">
                   <label className="text-sm font-medium">Title</label>
                   <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                 </div>
                 <div className="grid gap-2">
                   <label className="text-sm font-medium">Description</label>
                   <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Time</label>
                      <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                    </div>
                 </div>
                 <div className="grid gap-2">
                   <label className="text-sm font-medium">Organizer</label>
                   <Input value={formData.organizer} onChange={e => setFormData({...formData, organizer: e.target.value})} />
                 </div>
                 <div className="grid gap-2">
                   <label className="text-sm font-medium">Address</label>
                   <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                 </div>
                 <div className="grid gap-2">
                   <label className="text-sm font-medium">Contact</label>
                   <Input value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                 </div>
               </CardContent>
               <CardFooter className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="ghost" onClick={() => { setShowAddForm(false); setShowEditForm(false); resetForm(); }}>Cancel</Button>
                 <Button type="submit">{showAddForm ? 'Create Event' : 'Update Event'}</Button>
               </CardFooter>
             </form>
           </Card>
        </div>
      )}
    </div>
  )
}