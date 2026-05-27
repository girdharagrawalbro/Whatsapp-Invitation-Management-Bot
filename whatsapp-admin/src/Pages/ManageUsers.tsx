import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  RefreshCw,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  CheckSquare
} from 'lucide-react'
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import * as XLSX from 'xlsx';

interface User {
  _id: string
  phone: string
  name?: string
  type: string
  lastInteraction?: string
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    type: 'contact',
    password: ''
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users')
      setUsers(res.data)
      setError(null)
      setSelectedUsers([])
    } catch (err) {
      setError('Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRefresh = () => fetchUsers()

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post('/users', formData)
      toast.success("New User Added");
      setUsers([...users, res.data])
      setShowAddForm(false)
      resetForm()
    } catch (err) {
      toast.error('Failed to add user')
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    try {
      const res = await api.put(`/users/${currentUser._id}`, formData)
      toast.success("User Details Updated");
      setUsers(users.map(u => (u._id === res.data._id ? res.data : u)))
      setShowEditForm(false)
      resetForm()
    } catch (err) {
      toast.error('Failed to update user')
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`)
        setUsers(users.filter(u => u._id !== id))
        toast.success('User deleted')
      } catch (err) {
        toast.error('Failed to delete user')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      try {
        await api.post('/users/bulk-delete', { ids: selectedUsers });
        setUsers(users.filter(u => !selectedUsers.includes(u._id)));
        setSelectedUsers([]);
        toast.success('Users deleted successfully');
      } catch (err) {
        toast.error('Failed to delete users');
      }
    }
  }

  const handleExportExcel = () => {
    const dataToExport = filteredUsers.map((user, index) => ({
      "S.No": index + 1,
      "Name": user.name || 'Anonymous',
      "Phone": user.phone,
      "Type": user.type,
      "Last Interaction": user.lastInteraction ? new Date(user.lastInteraction).toLocaleString() : 'Never'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_export.xlsx");
    toast.success('Excel exported');
  }

  const resetForm = () => {
    setFormData({
      phone: '',
      name: '',
      type: 'contact',
      password: ''
    })
  }

  const openEditForm = (user: User) => {
    setCurrentUser(user)
    setFormData({
      phone: user.phone,
      name: user.name || '',
      type: user.type || 'contact'
    })
    setShowEditForm(true)
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(currentUsers.map(u => u._id))
    }
  }

  const toggleUserSelection = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id])
  }

  const filteredUsers = users.filter(
    user =>
      user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  return (
    <div className='bg-slate-50 min-h-screen overflow-auto pb-10'>
      <Card className="m-6 border-none shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6">
          <div>
            <CardTitle className="text-xl">User Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Manage your contacts and invitation guests.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading} className="h-10 w-10">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" onClick={handleExportExcel} className="h-10">
               <Download className="h-4 w-4 mr-2" />
               Export
            </Button>
            <Button onClick={() => setShowAddForm(true)} className="h-10">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-center justify-between border border-blue-100 animate-in fade-in slide-in-from-top-1">
               <span className="text-sm font-medium text-blue-700">{selectedUsers.length} users selected</span>
               <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                 <Trash2 className="h-4 w-4 mr-2" />
                 Delete Selected
               </Button>
            </div>
          )}

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
                    <TableHead className="w-12 text-center">
                      <Checkbox 
                        checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Interaction</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <TableRow key={user._id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={selectedUsers.includes(user._id)}
                            onCheckedChange={() => toggleUserSelection(user._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{user.name || 'Anonymous'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono">
                            {user.phone ? `+${user.phone}` : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {user.lastInteraction ? new Date(user.lastInteraction).toLocaleString() : 'Never'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditForm(user)} className="h-8 w-8 text-blue-600">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user._id)} className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredUsers.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 px-2">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium text-foreground">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of{' '}
                <span className="font-medium text-foreground">{filteredUsers.length}</span> users
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

      {/* Forms */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <Card className="w-full max-w-md">
             <CardHeader>
               <CardTitle>{showAddForm ? 'Add New User' : 'Edit User'}</CardTitle>
             </CardHeader>
             <form onSubmit={showAddForm ? handleAddUser : handleEditUser}>
               <CardContent className="space-y-4">
                 <div className="grid gap-2">
                   <label className="text-sm font-medium">Phone Number</label>
                   <Input required placeholder="919999999999" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                 </div>
                 <div className="grid gap-2">
                   <label className="text-sm font-medium">Name</label>
                   <Input placeholder="User Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div className="grid gap-2">
                   <label className="text-sm font-medium">Type</label>
                   <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                   >
                     <option value="contact">Contacted User</option>
                     <option value="invitation">Invitation User</option>
                   </select>
                 </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-blue-600 font-bold">Dashboard Password (Optional)</label>
                    <Input 
                      type="password" 
                      placeholder="Set password for dashboard access" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                  </div>
               </CardContent>
               <CardFooter className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="ghost" onClick={() => { setShowAddForm(false); setShowEditForm(false); resetForm(); }}>Cancel</Button>
                 <Button type="submit">{showAddForm ? 'Create User' : 'Update User'}</Button>
               </CardFooter>
             </form>
           </Card>
        </div>
      )}
    </div>
  )
}
