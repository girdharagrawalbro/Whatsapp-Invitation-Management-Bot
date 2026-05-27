import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, User, CheckCircle2, ChevronLeft } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function RegisterNumber() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return toast.error('Please fill in all fields');

    setIsLoading(true);
    try {
      // Assuming a generic endpoint for guest registration
      // For now, we'll use the user creation endpoint if available or a mock
      await api.post('/users', { name, phone, type: 'contact' });
      setIsSuccess(true);
      toast.success('Registered successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full border-none shadow-xl text-center p-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl mb-2">Registration Complete!</CardTitle>
          <CardDescription className="text-lg">
            Thank you, {name}. You are now registered to receive WhatsApp invitations and updates.
          </CardDescription>
          <Button className="mt-8 w-full bg-blue-600" onClick={() => navigate('/')}>
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <Button 
        variant="ghost" 
        className="mb-4 self-start max-w-md w-full flex items-center justify-start"
        onClick={() => navigate('/')}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      
      <Card className="max-w-md w-full border-none shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Register for Invitations</CardTitle>
          <CardDescription>
            Enter your details to stay updated on upcoming events via WhatsApp.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  placeholder="Rahul Sharma"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="phone"
                  placeholder="919876543210"
                  className="pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">Include country code (e.g., 91 for India)</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register Now'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
