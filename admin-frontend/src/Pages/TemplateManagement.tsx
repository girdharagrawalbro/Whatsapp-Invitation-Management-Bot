import { useState } from 'react'
import {
  Plus,
  FileText,
  RefreshCw,
  Edit2,
  Trash2,
  Layout
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTemplates, addTemplate, editTemplate, deleteTemplate } from '../services/apiService';

interface Template {
  _id: string
  name: string
  message?: string
  content?: string
  [key: string]: any
}

export default function TemplateManagement() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', message: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: templates = [], isLoading: loading, error, refetch } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: fetchTemplates
  });

  const queryError = error ? 'Failed to load templates' : null;

  const handleRefresh = () => refetch()

  const addTemplateMutation = useMutation({
    mutationFn: addTemplate,
    onSuccess: () => {
      toast.success('Template created')
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setShowForm(false)
      setFormData({ name: '', message: '' })
      setEditingId(null)
    },
    onError: () => {
      toast.error('Failed to create template')
    }
  });

  const editTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return editTemplate(id, data);
    },
    onSuccess: () => {
      toast.success('Template updated')
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setShowForm(false)
      setFormData({ name: '', message: '' })
      setEditingId(null)
    },
    onError: () => {
      toast.error('Failed to update template')
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      toast.success('Template deleted')
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: () => {
      toast.error('Failed to delete template')
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: formData.name,
      content: formData.message
    }

    if (editingId) {
      editTemplateMutation.mutate({ id: editingId, data: payload })
    } else {
      addTemplateMutation.mutate(payload)
    }
  }

  const handleEdit = (template: Template) => {
    setFormData({ name: template.name, message: template.content || template.message || '' })
    setEditingId(template._id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(id)
    }
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layout className="h-6 w-6 text-blue-600" />
            Template Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage reusable message templates.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({name: '', message: ''}); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {queryError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center font-medium">
          {queryError}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse h-48 border-none shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length > 0 ? (
            templates.map(template => (
              <Card key={template._id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-blue-700 truncate mr-2">
                    {template.name}
                  </CardTitle>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(template)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(template._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-600 line-clamp-5 whitespace-pre-line leading-relaxed">
                    {template.content || template.message}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-10" />
              <p>No templates found. Click "New Template" to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <Card className="w-full max-w-lg">
             <CardHeader>
               <CardTitle>{editingId ? 'Edit Template' : 'Create New Template'}</CardTitle>
             </CardHeader>
             <form onSubmit={handleSubmit}>
               <CardContent className="space-y-4">
                 <div className="grid gap-2">
                   <label className="text-sm font-medium">Template Name</label>
                   <Input required placeholder="E.g. Welcome Message" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div className="grid gap-2">
                   <label className="text-sm font-medium">Content</label>
                   <Textarea 
                    required 
                    placeholder="Type your message content here..." 
                    className="min-h-[200px]"
                    value={formData.message} 
                    onChange={e => setFormData({...formData, message: e.target.value})} 
                   />
                 </div>
               </CardContent>
               <CardFooter className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                 <Button type="submit">{editingId ? 'Update Template' : 'Create Template'}</Button>
               </CardFooter>
             </form>
           </Card>
        </div>
      )}
    </div>
  )
}