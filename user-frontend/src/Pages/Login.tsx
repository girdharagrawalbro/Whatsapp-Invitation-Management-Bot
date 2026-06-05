import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EyeOff, Eye } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Bg from '@/components/Bg';
import Whatsapp from '@/components/ui/Whatsapp';
import { useLanguage } from '@/lib/LanguageContext';

const Login = () => {
  const [adminPhone, setAdminPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(adminPhone, password, lang);
    } catch (err) {
      // Error handled in AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfd] font-sans text-slate-900 overflow-hidden selection:bg-green-100 selection:text-green-900 relative z-0">
      <Navbar />
      <Bg />
      <div className="mt-15 fade-in animate-in flex items-center justify-center p-4 relative overflow-hidden">
        <div className="bg-white rounded-3xl shadow-[0_15px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-[420px] p-8 sm:p-10 border border-slate-100 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[1.75rem] font-black text-[#111928] tracking-tight">{t('auth.login.title')}</h1>
            <Whatsapp h={10} w={10} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[15px] font-medium text-slate-700">{t('auth.label.phone')}</Label>
              <div className="flex bg-white rounded-lg border border-slate-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors overflow-hidden h-12">
                <div className="flex items-center px-3 border-r border-slate-300 bg-[#f8f9fa] gap-1.5 text-sm font-medium text-slate-700 shrink-0 cursor-pointer">
                  <img src="https://flagcdn.com/w20/in.png" alt="India" className="w-[18px] rounded-[2px]" />
                  <span>+91</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 opacity-60">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  id="phone"
                  placeholder={t('auth.label.phone')}
                  required
                  type='number'
                  inputMode='numeric'
                  autoComplete='tel'
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="flex-1 px-3 outline-none w-full text-[15px] text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <p className="text-[13px] text-slate-700 mt-1.5 font-medium">{t('auth.whatsappNote')}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[15px] font-medium text-slate-700">{t('auth.label.password')}</Label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.label.password')}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-3 border border-slate-300 rounded-lg text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors">
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-[#3fc07c] hover:bg-[#3fc07c] text-white text-[16px] font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(59,45,176,0.4)] transition-all active:scale-[0.98]">
              {t('auth.button.login')}
            </Button>

            <div className="flex justify-end -mt-2">
              <a href="#" className="text-[14px] font-medium text-slate-700 hover:text-[#3fc07c] transition-colors">{t('auth.forgot')}</a>
            </div>

            <div className="flex items-center space-x-3 mt-4">
              <Checkbox id="keep-logged-in" className="border-slate-300 rounded-[4px] h-4 w-4 data-[state=checked]:bg-[#3fc07c] data-[state=checked]:border-[#3fc07c]" />
              <label htmlFor="keep-logged-in" className="text-[14px] font-medium leading-none text-slate-700 cursor-pointer">
                {t('auth.keepLoggedIn')}
              </label>
            </div>

            <div className="h-[1px] w-full bg-slate-200 my-6"></div>

            <div className="text-center space-y-4">
              <p className="text-[15px] font-medium text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors">{t('auth.signupLink')}</p>
              <p className="text-[15px] font-medium text-slate-800">
                {t('auth.noAccount')} <Link to="/signup" className="text-[#111928] font-bold hover:underline">{t('auth.startFree')}</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
