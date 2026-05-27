
import {
   Mail,
   Phone,
   MapPin,
   MessageSquare,
   Send,
   Twitter,
   Youtube,
   Linkedin,
   Globe,
   CheckCircle2,
   ArrowRight,
   Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Bg from '@/components/Bg';
import Footer from '@/components/Footer';

import { useLanguage } from '@/lib/LanguageContext';

const Contact = () => {
   const { t } = useLanguage();

   return (
      <div className="min-h-screen bg-[#fcfdfd] font-sans text-slate-900 overflow-hidden selection:bg-green-100 selection:text-green-900 relative z-0">
         <Bg />
         <Navbar />

         <main className="pt-15 pb-20 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto relative z-10">
            {/* Hero Section */}
            <div className="max-w-3xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

               <h1 className="text-[3.5rem] font-black text-slate-900 leading-tight tracking-tight mb-2">
                  {t('contact.title')}
               </h1>
               <p className="text-xl text-slate-600 font-medium leading-relaxed">
                  {t('contact.subtitle')}
               </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
               {/* Contact Form */}
               <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-left-8 duration-700">
                  <form className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.label.name')}</label>
                           <input
                              type="text"
                              placeholder="John Doe"
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 h-14 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3fc07c]/20 focus:border-[#3fc07c] transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.label.email')}</label>
                           <input
                              type="email"
                              placeholder="john@example.com"
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 h-14 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3fc07c]/20 focus:border-[#3fc07c] transition-all"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.label.subject')}</label>
                        <input
                           type="text"
                           placeholder="How can we help?"
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 h-14 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3fc07c]/20 focus:border-[#3fc07c] transition-all"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.label.message')}</label>
                        <textarea
                           placeholder="Your message here..."
                           rows={4}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3fc07c]/20 focus:border-[#3fc07c] transition-all resize-none"
                        ></textarea>
                     </div>
                     <Button className="w-full bg-[#3fc07c] hover:bg-[#2da05f] text-white h-14 rounded-2xl text-lg font-black shadow-lg shadow-green-100 transition-all hover:scale-[1.02] active:scale-95 group">
                        {t('contact.button.send')}
                        <Send className="ml-3 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                     </Button>
                  </form>
               </div>

               {/* Contact Info */}
               <div className="space-y-7 animate-in fade-in slide-in-from-right-8 duration-700">
                  <div className="space-y-5">
                     <h3 className="text-2xl font-black text-slate-900">{t('contact.info.title')}</h3>

                     <div className="flex items-start gap-6 group">
                        <div className="h-14 w-14 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#3fc07c] transition-all duration-300">
                           <Mail className="h-6 w-6 text-[#3fc07c] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{t('contact.info.email')}</p>
                           <p className="text-xl font-bold text-slate-800">support@invitely.com</p>
                        </div>
                     </div>

                     <div className="flex items-start gap-6 group">
                        <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-all duration-300">
                           <Phone className="h-6 w-6 text-blue-500 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{t('contact.info.phone')}</p>
                           <p className="text-xl font-bold text-slate-800">+91 98765 43210</p>
                        </div>
                     </div>

                     {/* <div className="flex items-start gap-6 group">
                        <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500 transition-all duration-300">
                           <MapPin className="h-6 w-6 text-purple-500 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{t('contact.info.visit')}</p>
                           <p className="text-xl font-bold text-slate-800">123 Event Hub, Tech Park, <br />Mumbai, MH 400001</p>
                        </div>
                     </div> */}
                  </div>

                  <div className="space-y-6 pt-4 border-t border-slate-100">
                     {/* <h3 className="text-xl font-black text-slate-900">{t('contact.social.title')}</h3> */}
                     <div className="flex gap-4">
                        {[
                           { icon: <Twitter className="h-5 w-5" />, color: "hover:bg-sky-500" },
                           { icon: <Youtube className="h-5 w-5" />, color: "hover:bg-red-600" },
                           { icon: <Linkedin className="h-5 w-5" />, color: "hover:bg-blue-700" },
                           { icon: <Globe className="h-5 w-5" />, color: "hover:bg-slate-800" }
                        ].map((social, i) => (
                           <div key={i} className={`h-12 w-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-white ${social.color} transition-all duration-300 cursor-pointer shadow-sm`}>
                              {social.icon}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* WhatsApp Support CTA */}
                  <div className="bg-[#eefaf4] border border-green-100 p-8 rounded-[2rem] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <MessageSquare className="h-24 w-24 text-[#3fc07c]" />
                     </div>
                     <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2 text-[#3fc07c] font-black uppercase tracking-tighter">
                           <Zap className="h-4 w-4 fill-[#3fc07c]" />
                           {t('contact.whatsapp.fast')}
                        </div>
                        <h4 className="text-2xl font-black text-slate-900">{t('contact.whatsapp.title')}</h4>
                        <p className="text-slate-600 font-medium">{t('contact.whatsapp.desc')}</p>
                        <Button className="bg-[#3fc07c] hover:bg-[#2da05f] text-white px-6 h-10 rounded-xl font-bold shadow-md shadow-green-200 transition-all">
                           {t('contact.whatsapp.cta')}
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         </main>

         <Footer />
      </div>
   );
};

export default Contact;
