import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4">
      <div className="bg-white p-12 rounded-2xl shadow-xl shadow-slate-200/50 max-w-md w-full border border-slate-100">
        <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
        <p className="text-xl font-semibold text-slate-700 mb-2">Page Not Found</p>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you are looking for might have been moved, deleted, or never existed.
        </p>
        <Button 
          size="lg" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          onClick={() => navigate('/')}
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
