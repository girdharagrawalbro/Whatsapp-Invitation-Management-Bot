import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EyeOff, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Bg from '@/components/Bg';
import Whatsapp from '@/components/ui/Whatsapp';
import { useLanguage } from '@/lib/LanguageContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return toast.error('Phone number is required');

    setIsSendingOtp(true);
    try {
      await api.post('/auth/otp/send', { phone });
      setStep('otp');
      toast.success('Verification code sent to your WhatsApp');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/otp/verify', { phone, otp });
      await signup(name, phone, password, lang, email);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    }
  };

  return (
    <>
      <Navbar />
      <Bg />
      <div className="mt-15 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: "url('https://res.cloudinary.com/dcmrsdydh/image/upload/v1778072538/Gemini_Generated_Image_l6zsk9l6zsk9l6zs_fvtqef.png')",
          backgroundSize: "600px",
          backgroundRepeat: "repeat"
        }}></div>

        <div className="bg-white rounded-3xl shadow-[0_15px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-[420px] p-8 sm:p-10 border border-slate-100 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[1.75rem] font-black text-[#111928] tracking-tight">
              {step === 'signup' ? t('auth.signup.title') : 'Verify Phone'}
            </h1>
            <Whatsapp h={10} w={10} />
          </div>

          {step === 'signup' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[15px] font-medium text-slate-700">Account Name</Label>
                <input
                  id="name"
                  placeholder="e.g. Priya Sharma"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-3 border border-slate-300 rounded-lg text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[15px] font-medium text-slate-700">Email Address</Label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-3 border border-slate-300 rounded-lg text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[15px] font-medium text-slate-700">{t('auth.label.phone')}</Label>
                <div className="flex bg-white rounded-lg border border-slate-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors overflow-hidden h-12">
                  <div className="flex items-center px-3 border-r border-slate-300 bg-[#f8f9fa] gap-1.5 text-sm font-medium text-slate-700 shrink-0 cursor-pointer">
                    <img src="https://flagcdn.com/w20/in.png" alt="India" className="w-[18px] rounded-[2px]" />
                    <span>+91</span>
                  </div>
                  <input
                    id="phone"
                    placeholder={t('auth.label.phone')}
                    required
                    value={phone}
                    type='number'
                    inputMode='numeric'
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 px-3 outline-none w-full text-[15px] text-slate-900 placeholder:text-slate-400"
                  />
                </div>
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

              <Button type="submit" disabled={isSendingOtp} className="w-full h-12 mt-2 bg-[#3fc07c] hover:bg-[#3fc07c] text-white text-[16px] font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(59,45,176,0.4)] transition-all active:scale-[0.98]">
                {isSendingOtp ? 'Sending OTP...' : t('auth.button.register')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndSignup} className="space-y-5">
              <div className="space-y-1.5 text-center">
                <p className="text-sm text-slate-600 mb-4">We've sent a 6-digit code to <strong>+91 {phone}</strong> on WhatsApp.</p>
                <Label htmlFor="otp" className="text-[15px] font-medium text-slate-700">Verification Code</Label>
                <input
                  id="otp"
                  placeholder="000000"
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full h-14 px-3 border-2 border-slate-300 rounded-xl text-[24px] font-bold text-center tracking-[0.5em] focus:outline-none focus:border-[#3fc07c] transition-colors"
                />
              </div>

              <Button type="submit" className="w-full h-12 mt-2 bg-[#3fc07c] hover:bg-[#3fc07c] text-white text-[16px] font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(59,45,176,0.4)] transition-all active:scale-[0.98]">
                Verify & Create Account
              </Button>

              <button type="button" onClick={() => setStep('signup')} className="w-full text-sm text-slate-500 hover:text-slate-800 transition-colors">
                Change phone number
              </button>
            </form>
          )}

          <div className="h-[1px] w-full bg-slate-200 my-6"></div>

          <div className="text-center space-y-4">
            <p className="text-[15px] font-medium text-slate-800">
              {t('auth.haveAccount')} <Link to="/login" className="text-[#111928] font-bold hover:underline">{t('auth.button.login')}</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;
