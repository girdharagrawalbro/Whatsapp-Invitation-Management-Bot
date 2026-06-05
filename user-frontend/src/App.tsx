import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Dashboard from './Pages/Dashboard'
import MessageSchedular from './Pages/MessageSchedular'
import ScheduledMessages from './Pages/ScheduledMessages'
import ManageEvents from './Pages/ManageEvents'
import ManageUsers from './Pages/ManageUsers'
import Settings from './Pages/Settings'
import Sidebar from './components/Sidebar'
import NotFound from './NotFound';
import TemplateManagement from './Pages/TemplateManagement'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Features from './Pages/Features'
import Pricing from './Pages/Pricing'
import Contact from './Pages/Contact'
import LandingPage from './Pages/LandingPage'
import RegisterNumber from './Pages/RegisterNumber'
import WhatsAppSession from './Pages/WhatsAppSession'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { LanguageProvider } from './lib/LanguageContext'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // List of public-facing paths where Sidebar should NOT appear
  const publicPaths = ['/', '/login', '/signup', '/features', '/pricing', '/contact', '/register'];
  const isPublicPath = publicPaths.includes(location.pathname);

  if (!isAuthenticated || isPublicPath) {
    return <>{children}</>;
  }

  return (
    <div className='flex h-screen bg-slate-50 overflow-hidden'>
      <Sidebar />
      <main className='flex-1 overflow-auto relative'>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainLayout>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/features' element={<Features />} />
          <Route path='/pricing' element={<Pricing />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/register' element={<RegisterNumber />} />
          {/* <Route path='/about' element={<About />} /> */}
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='/messageschedular' element={<ProtectedRoute><MessageSchedular /></ProtectedRoute>} />
          <Route path='/scheduledmessage' element={<ProtectedRoute><ScheduledMessages /></ProtectedRoute>} />
          <Route path='/manageevents' element={<ProtectedRoute><ManageEvents /></ProtectedRoute>} />
          <Route path='/manageusers' element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
          <Route path='/templates' element={<ProtectedRoute><TemplateManagement /></ProtectedRoute>} />
          <Route path='/whatsapp-session' element={<ProtectedRoute><WhatsAppSession /></ProtectedRoute>} />
          <Route path='/settings' element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout> 
      </LanguageProvider>
      <Toaster position='top-right' toastOptions={{ duration: 3000 }} />
    </AuthProvider>
  )
}

export default App
