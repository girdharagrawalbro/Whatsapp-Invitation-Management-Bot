
import {
   MessageSquare,
   Zap,
   CheckCircle2,
   Cpu,
   ArrowRight,
   Sparkles,
   Smartphone,
   ScanLine,
   Users2,
   ArrowLeft,
   CheckCheck,
   Smile,
   Paperclip,
   Mic,
   Video,
   Phone,
   MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Bg from '@/components/Bg';
import Footer from '@/components/Footer';

import { useLanguage } from '@/lib/LanguageContext';

const Features = () => {
   const { t } = useLanguage();

   return (
      <div className="min-h-screen bg-[#fcfdfd] font-sans text-slate-900 overflow-hidden selection:bg-green-100 selection:text-green-900 relative z-0">
         <Bg />
         <Navbar />

         <main className="pt-15 pb-20 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto flex items-center flex-col relative">
            {/* Page Title */}
            <div className="text-center mb-10 animate-in fade-in slide-in-from-top-20 duration-1000">
               <h1 className="text-[3rem] md:text-6xl font-black text-slate-900 tracking-tight">
                  <span className="text-[#3fc07c]">इन्विटेली</span> {t('features.title').replace('इन्विटेली ', '')}
               </h1>
               <div className="h-1.5 w-24 bg-[#3fc07c] rounded-full mx-auto mt-6"></div>
            </div>

            {/* Main Showcase Section */}
            <div className="flex xl:flex-row sm:flex-col md:flex-row items-center justify-center gap-24  lg:gap-24">

               {/* Left: Phone Mockup with Annotations */}
               <div className="relative flex-shrink-0 animate-in fade-in-50 slide-in-from-left-50 duration-1000">
                  {/* Smartphone Frame */}
                  <div className="relative w-[290px] h-[550px] bg-slate-900 rounded-[3rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[8px] border-slate-800">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>

                     {/* Screen Content (WhatsApp Style) */}
                     <div className="w-full h-full bg-[#efeae2] rounded-[2.2rem] overflow-hidden flex flex-col relative ">
                        {/* WhatsApp Header */}
                        <div className="bg-[#075e54] text-white pb-2 px-3 flex items-center gap-1 pt-6">
                           <ArrowLeft className="w-5 h-5" />
                           <div className="h-7 w-7 rounded-full bg-slate-200 overflow-hidden shrink-0">
                              <img src="https://res.cloudinary.com/dcmrsdydh/image/upload/v1777979790/qx93nmwgo0noa3yvwvq0.jpg" alt="Bot" className="scale-110" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-bold truncate flex items-center gap-1">Invitely <CheckCircle2 className="h-3 w-3 fill-green-500 text-white" /></p>
                              <p className="text-[10px] opacity-80 truncate">online</p>
                           </div>
                           <div className="flex gap-2 shrink-0">
                              <Video className="h-3.5 w-3.5 opacity-90" />
                              <Phone className="h-3.5 w-3.5 opacity-90" />
                              <MoreVertical className="h-3.5 w-3.5 opacity-90" />
                           </div>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 p-3 space-y-4 overflow-y-auto">
                           <div className="flex justify-center">
                              <span className="bg-white/80 text-slate-500 text-[8px] px-2 py-0.5 rounded-md shadow-sm border border-slate-100">Today</span>
                           </div>

                           {/* Invitation Card */}
                           <div className="flex justify-end">
                              <div className="bg-[#dcf8c6] p-1 rounded-xl rounded-tr-sm shadow-sm max-w-[88%] border border-[#dcf8c6]">
                                 <div className="aspect-[4/3] bg-white rounded-lg mb-1 overflow-hidden relative border border-black/5">
                                    {/* Wedding Card Placeholder */}
                                    <div className="absolute inset-0 bg-[#fdf8f5] flex flex-col items-center justify-center text-center p-2">
                                       <div className="w-full flex justify-between absolute top-2 px-2 opacity-30">
                                          <div className="w-4 h-6 border-l border-t border-amber-800"></div>
                                          <div className="w-4 h-6 border-r border-t border-amber-800"></div>
                                       </div>
                                       <h4 className="font-serif text-[#7c2d12] text-[10px] mb-1">Wedding Invitation</h4>
                                       <div className="w-full h-[1px] bg-amber-800/20 my-1"></div>
                                       <p className="text-[4px] text-amber-900/60 leading-tight">TOGETHER WITH THEIR FAMILIES</p>
                                       <p className="font-serif text-[#7c2d12] text-[12px] my-1">Rahul & Priya</p>
                                       <div className="w-full h-[1px] bg-amber-800/20 my-1"></div>
                                       <p className="text-[5px] text-amber-900/80 font-bold mt-1">SATURDAY, NOVEMBER 25, 2023, 11:00 PM</p>
                                       <p className="text-[5px] text-amber-900/80 font-bold mt-0">GRAND IMPERIAL PALACE</p>

                                       {/* Cursor Graphic Overlay */}
                                       <div className="absolute -right-2 -bottom-2 translate-x-1/4 translate-y-1/4 z-20 drop-shadow-md">
                                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="1" strokeLinejoin="round">
                                             <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                                          </svg>
                                       </div>
                                    </div>
                                 </div>
                                 <p className="text-[9px] text-slate-800 leading-tight px-1 font-medium">Wait I'm invitation on your converesit!</p>
                                 <p className="text-[7px] text-slate-500 text-right mt-0.5 pr-1">2:55 PM <CheckCheck className="h-2.5 w-2.5 inline text-[#53bdeb] fill-[#53bdeb]" /></p>
                              </div>
                           </div>

                           {/* Bot Response - AI Extraction */}
                           <div className="flex justify-start">
                              <div className="bg-white p-2.5 rounded-xl rounded-tl-sm shadow-sm max-w-[92%] border border-slate-100">
                                 <p className="text-[10px] font-bold text-slate-800 mb-1.5 leading-snug">
                                    {t('showcase.ai.status')}
                                 </p>
                                 <div className="space-y-0.5 text-[8.5px] text-slate-600 font-medium leading-tight">
                                    <p>Generation:</p>
                                    <p className="pl-1">- Invitation Type: Wedding</p>
                                    <p className="pl-1">- Event Time: 11:00 PM</p>
                                    <p className="pl-1">- Event Date: Saturday, November 25, 2023</p>
                                    <p className="pl-1">- Event Venue: GRAND IMPERIAL PALACE</p>
                                 </div>
                                 <p className="text-[7px] text-slate-400 text-right mt-1">2:55 PM</p>
                              </div>
                           </div>
                        </div>

                        {/* Chat Input */}
                        <div className="p-2 bg-[#f0f2f5] flex items-center gap-2">
                           <Smile className="h-4 w-4 text-slate-500 shrink-0" />
                           <div className="flex-1 bg-white h-7 rounded-full px-3 flex items-center text-[10px] text-slate-400 border border-slate-200">Message</div>
                           <Paperclip className="h-4 w-4 text-slate-500 shrink-0 -rotate-45" />
                           <div className="h-7 w-7 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0 shadow-sm">
                              <Sparkles className="h-3.5 w-3.5 text-white" />
                           </div>
                        </div>

                     </div>

                     {/* Annotation Labels - Pointing to phone */}
                     <div className="absolute -left-32 top-1/4">
                        <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 flex flex-col gap-1">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Name:</span>
                           <span className="text-xs font-bold text-slate-800">Rahul & Priya</span>
                        </div>
                        <div className="w-4.5 h-[0.2px] bg-slate-500 absolute top-1/2 left-full -translate-y-1/2 "></div>
                     </div>

                     <div className="absolute -left-44 top-[36%]">
                        <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 flex flex-col gap-1">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Date & Time:</span>
                           <span className="text-xs font-bold text-slate-800">25/11/2023, 11:00 PM</span>
                        </div>
                        <div className="w-4.5 h-[0.2px] bg-slate-500 absolute top-1/2 left-full -translate-y-1/2 "></div>
                     </div>

                     <div className="absolute -right-44 top-[31%]">
                        <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 flex flex-col gap-1">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Venue:</span>
                           <span className="text-xs font-bold text-slate-800">Grand Imperial Palace</span>
                        </div>
                        <div className="w-4.5 h-[0.2px] bg-slate-500 absolute top-1/2 right-full -translate-y-1/2 "></div>
                     </div>

                     <div className="absolute -right-28 top-[19.5%]">
                        <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 flex flex-col gap-1">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Event Type:</span>
                           <span className="text-xs font-bold text-slate-800">Wedding</span>
                        </div>
                        <div className="w-5 h-[0.2px] bg-slate-500 absolute top-1/2 right-full -translate-y-1/2 "></div>
                     </div>
                  </div>
               </div>

               {/* Right: Content Breakdown */}
               <div className="flex-1 space-y-16 animate-in fade-in-50 slide-in-from-right-50 duration-1000">

                  {/* Feature 1 */}
                  <div className="group">
                     <div className="flex items-start gap-6 mb-8">
                        <div className="h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#3fc07c] transition-all duration-500">
                           <ScanLine className="h-8 w-8 text-[#3fc07c] group-hover:text-white transition-colors duration-500" />
                        </div>
                        <div>
                           <h2 className="text-3xl font-black text-slate-900">1. {t('features.ai.title')}</h2>
                        </div>
                     </div>
                     <ul className="space-y-6 ml-20">
                        <li className="flex items-center gap-4 text-xl font-bold text-slate-700">
                           <div className="h-2 w-2 rounded-full bg-[#3fc07c]"></div>
                           {t('features.ai.desc1')}
                        </li>
                        <li className="flex items-center gap-4 text-xl font-bold text-slate-700">
                           <div className="h-2 w-2 rounded-full bg-[#3fc07c]"></div>
                           {t('features.ai.desc2')}
                        </li>
                        <li className="flex items-center gap-4 text-xl font-bold text-slate-700">
                           <div className="h-2 w-2 rounded-full bg-[#3fc07c]"></div>
                           {t('features.ai.desc3')}
                        </li>
                     </ul>
                  </div>

                  {/* Feature 2 */}
                  <div className="group">
                     <div className="flex items-start gap-6 mb-8">
                        <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-all duration-500">
                           <Smartphone className="h-8 w-8 text-blue-500 group-hover:text-white transition-colors duration-500" />
                        </div>
                        <div>
                           <h2 className="text-3xl font-black text-slate-900">2. {t('features.rsvp.title')}</h2>
                        </div>
                     </div>
                     <ul className="space-y-6 ml-20">
                        <li className="flex items-center gap-4 text-xl font-bold text-slate-700">
                           <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                           {t('features.rsvp.desc1')}
                        </li>
                        <li className="flex items-center gap-4 text-xl font-bold text-slate-700">
                           <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                           {t('features.rsvp.desc2')}
                        </li>
                        <li className="flex items-center gap-4 text-xl font-bold text-slate-700">
                           <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                           {t('features.manage.desc3')}
                        </li>
                     </ul>
                  </div>



               </div>
            </div>
         </main>

         <Footer />
      </div>
   );
};

export default Features;
