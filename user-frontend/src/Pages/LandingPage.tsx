
import {
   MessageSquare,
   BarChart3,
   Zap,
   CheckCircle2,
   Globe,
   Layout,
   Calendar,
   Settings,
   Users,
   LogOut,
   Bot,
   Twitter,
   Youtube,
   Linkedin,
   Phone,
   Video,
   MoreVertical,
   Paperclip,
   Smile,
   Mic,
   ArrowRight,
   MonitorSmartphone,
   Cpu,
   BackpackIcon,
   ArrowLeft,
   CheckCheck,
   Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Bg from '@/components/Bg';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';

const LandingPage = () => {
   const navigate = useNavigate();
   const { t } = useLanguage();
   const { isAuthenticated } = useAuth();

   return (
      <div className="min-h-screen bg-[#fcfdfd] font-sans text-slate-900 overflow-hidden selection:bg-green-100 selection:text-green-900 relative z-0">

         <Bg />
         <Navbar />

         {/* Hero Section */}
         <main className="pt-24 pb-20 px-6 sm:px-8 lg:px-12 max-w-[1600px] mx-auto relative z-10">
            <div className="flex items-center">

               {/* Left Column: Text Content */}
               <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 max-w-3xl">
                  <h1 className="text-[3.5rem]  font-black text-slate-900 leading-[1.1] tracking-tight leading-tight ">
                     {t('hero.title.pt1')} <span className="text-[#3fc07c] font-bold">{t('common.whatsapp')}</span> {t('hero.title.pt2')} <br />
                     {t('hero.title.pt3')}
                  </h1>
                  <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl">
                     {t('hero.subtitle')}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-4">
                     {isAuthenticated ? (
                        <Button onClick={() => navigate('/dashboard')} size="lg" className="cursor-pointer bg-[#3fc07c] hover:bg-[#2da05f] text-white px-10 h-14 rounded-2xl text-xl font-black shadow-xl shadow-green-200 transition-all hover:scale-105 active:scale-95 group">
                           {t('nav.dashboard')}
                           <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                        </Button>
                     ) : (
                        <>
                           <Button onClick={() => navigate('/login')} size="lg" className="cursor-pointer bg-[#3fc07c] hover:bg-[#2da05f] text-white px-10 h-14 rounded-2xl text-xl font-black shadow-xl shadow-green-200 transition-all hover:scale-105 active:scale-95 group">
                              {t('hero.getStarted')}
                              <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                           </Button>
                           <Button onClick={() => navigate('/signup')} size="lg" variant="outline" className="cursor-pointer bg-white border-2 border-slate-100 text-[#3fc07c] border-[#3fc07c] px-10 h-14 rounded-2xl text-xl font-black hover:bg-green-50 transition-all active:scale-95">
                              {t('hero.start')}
                           </Button>
                        </>
                     )}
                  </div>

                  {/* As Seen In
                  <div className="pt-6 flex flex-wrap items-center gap-x-6 gap-y-4 grayscale opacity-60">
                     <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">As Seen In:</span>
                     <span className="font-bold text-lg flex items-center gap-1 tracking-tight text-slate-800"><Globe className="h-4 w-4" /> TechToday</span>
                     <span className="font-black text-lg tracking-tighter text-slate-800 uppercase font-sans">YOURSTORY</span>
                     <span className="font-serif font-bold text-sm text-slate-800 flex items-center gap-1.5">
                        <div className="bg-red-600 text-white text-[8px] p-0.5 leading-none font-sans">ET</div>
                        ECONOMIC TIMES
                     </span>
                  </div> */}

                  {/* Testimonial */}
                  <div className="flex items-center gap-4 pt-10 mt-auto">
                     <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-green-100 shadow-sm shrink-0">
                        <img src="https://res.cloudinary.com/dcmrsdydh/image/upload/v1777979790/qx93nmwgo0noa3yvwvq0.jpg" alt="Rahul and Priya" className="h-full w-full object-cover" />
                     </div>
                     <div className="space-y-0.5">
                        <p className="text-[20px] font-black font-extrabold text-slate-900">{t('pricing.testimonial.name')}</p>
                        <p className="text-[18px] text-slate-600 font-medium">{t('pricing.hero.testimonial')}</p>
                     </div>
                  </div>


               </div>
            </div>
         </main>
         <div className="absolute right-0 top-50 bottom-50 my-auto animate-in fade-in slide-in-from-right-25 duration-1000">
            {/* Main Mockup Container */}
            <div className="flex flex-col gap-4">
               <div className="z-10 bg-[#eefaf4] rounded-3xl p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-green-100 flex gap-3 aspect-[1.5/1] w-[850px] max-w-[90vw] h-[55vh]">
                  {/* Left Side: WhatsApp Chat Mockup (Adjusted from 40% to 32% to give more space on the right) */}
                  <div className="w-[32%] bg-[#efeae2] rounded-[1.2rem] shadow-sm overflow-hidden flex flex-col border border-slate-200/60">
                     {/* Chat Header */}
                     <div className="bg-[#075e54] text-white py-2 px-3 flex items-center gap-1">
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

                     {/* Chat Messages */}
                     <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-hide text-[9px]">
                        <div className="flex justify-center">
                           <span className="bg-white/80 text-slate-500 text-[8px] px-2 py-0.5 rounded-md shadow-sm border border-slate-100">Today</span>
                        </div>

                        {/* Incoming Invitation Image */}
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
                                 AI Card Extraction: Event Details Extracted Successfully
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


                        <div className="flex justify-end">
                           <div className="bg-[#dcf8c6] px-2 py-1.5 rounded-xl rounded-tr-sm shadow-sm max-w-[80%] border border-[#dcf8c6]">
                              <p className="text-[9px] text-slate-800 leading-tight">
                                 Can you track RSVP for this event?
                              </p>
                              <p className="text-[7px] text-slate-500 text-right mt-0.5">
                                 2:56 PM <CheckCheck className="h-2.5 w-2.5 inline text-[#53bdeb]" />
                              </p>
                           </div>
                        </div>
                        <div className="flex justify-start">
                           <div className="bg-white px-3 py-1.5 rounded-xl rounded-tl-sm shadow-sm border border-slate-100">
                              <div className="flex gap-1">
                                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                              </div>
                           </div>
                        </div>

                        <div className="flex justify-start">
                           <div className="bg-white p-2 rounded-xl rounded-tl-sm shadow-sm max-w-[85%] border border-slate-100">
                              <p className="text-[9px] text-slate-800 leading-tight">
                                 Yes! I've enabled RSVP tracking for this event.
                              </p>
                              <p className="text-[8px] text-green-600 font-medium mt-1">
                                 ✔ Guests can now respond directly via chat
                              </p>
                              <p className="text-[7px] text-slate-400 text-right mt-1">
                                 2:56 PM
                              </p>
                           </div>
                        </div>

                        <div className="flex justify-start">
                           <div className="bg-white p-2 rounded-xl rounded-tl-sm shadow-sm max-w-[85%] border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-800 mb-1">
                                 Live RSVP Status
                              </p>
                              <div className="text-[8px] text-slate-700 space-y-0.5">
                                 <p>✅ Accepted: 12</p>
                                 <p>❌ Declined: 3</p>
                                 <p>⏳ Pending: 8</p>
                              </div>
                              <p className="text-[7px] text-slate-400 text-right mt-1">
                                 2:57 PM
                              </p>
                           </div>
                        </div>

                        <div className="flex justify-end">
                           <div className="bg-[#dcf8c6] px-2 py-1.5 rounded-xl rounded-tr-sm shadow-sm max-w-[80%] border border-[#dcf8c6]">
                              <p className="text-[9px] text-slate-800 leading-tight">
                                 Send reminder to pending guests
                              </p>
                              <p className="text-[7px] text-slate-500 text-right mt-0.5">
                                 2:58 PM <CheckCheck className="h-2.5 w-2.5 inline text-[#53bdeb]" />
                              </p>
                           </div>
                        </div>

                        <div className="flex justify-start">
                           <div className="bg-white p-2 rounded-xl rounded-tl-sm shadow-sm max-w-[85%] border border-slate-100">
                              <p className="text-[9px] text-slate-800 leading-tight">
                                 Reminder sent successfully to all pending guests 🚀
                              </p>
                              <p className="text-[7px] text-slate-400 text-right mt-1">
                                 2:58 PM
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Chat Input */}
                     <div className="p-2 bg-[#f0f2f5] flex items-center gap-2">
                        <Smile className="h-4 w-4 text-slate-500 shrink-0" />
                        <div className="flex-1 bg-white h-7 rounded-full px-3 flex items-center text-[10px] text-slate-400 border border-slate-200">Message</div>
                        <Paperclip className="h-4 w-4 text-slate-500 shrink-0 -rotate-45" />
                        <div className="h-7 w-7 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0 shadow-sm">
                           {/* <Mic className="h-3.5 w-3.5" /> */}
                           <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                     </div>
                  </div>

                  {/* Right Side: Dashboard Mockup (Takes up the remaining ~68% width using flex-1) */}
                  <div className="flex-1 bg-white rounded-[1.2rem] shadow-sm overflow-hidden flex flex-col border border-slate-200/60 relative">
                     {/* Dashboard Header */}
                     <div className="h-10 px-4 flex items-center border-b border-slate-100 shrink-0 gap-2">
                        <MessageSquare className="h-4 w-4 text-[#25D366] fill-white border border-[#25D366] rounded-full" />
                        <span className="text-[11px] font-black text-slate-800">Dashboard</span>
                     </div>

                     {/* Dashboard Content Area */}
                     <div className="flex-1 flex overflow-hidden">
                        {/* Mini Sidebar */}
                        <div className="w-10 border-r border-slate-50 flex flex-col items-center py-3 gap-4 shrink-0 bg-white">
                           <div className="h-5 w-5 rounded bg-green-100 flex items-center justify-center">
                              <Layout className="h-3 w-3 text-green-600" />
                           </div>
                           <Users className="h-3.5 w-3.5 text-slate-300" />
                           <Calendar className="h-3.5 w-3.5 text-slate-300" />
                           <Settings className="h-3.5 w-3.5 text-slate-300" />
                           <LogOut className="h-3.5 w-3.5 text-slate-300 mt-auto" />
                        </div>

                        {/* Main Dashboard Content */}
                        <div className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-hide bg-[#fbfcfc]">

                           {/* Recent AI Activations */}
                           <div className="space-y-1.5">
                              <h3 className="text-[9px] font-bold text-slate-800">Recent Invitations</h3>
                              <div className="grid grid-cols-4 gap-2">
                                 {/* Card 1 */}
                                 <div className="aspect-[4/3] bg-[#700b33] rounded-md overflow-hidden border border-slate-200 shadow-sm relative">
                                    <div className="absolute inset-2 border border-white/20 rounded-sm"></div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 p-1">
                                       <div className="w-3 h-3 border border-white/30 rounded-full mb-1"></div>
                                       <div className="h-[2px] w-8 bg-white/30 mb-0.5"></div>
                                       <div className="h-[1px] w-6 bg-white/20"></div>
                                    </div>
                                 </div>
                                 {/* Card 2 */}
                                 <div className="aspect-[4/3] bg-[#fef5e7] rounded-md overflow-hidden border border-slate-200 shadow-sm relative">
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-800/40 p-1">
                                       <div className="h-[2px] w-8 bg-amber-800/30 mb-1"></div>
                                       <div className="h-[1px] w-10 bg-amber-800/20 mb-0.5"></div>
                                       <div className="h-[1px] w-6 bg-amber-800/20"></div>
                                    </div>
                                    <div className="absolute right-0 bottom-0 w-6 h-8 bg-red-600/80 rounded-tl-full opacity-80"></div>
                                 </div>
                                 {/* Card 3 */}
                                 <div className="aspect-[4/3] bg-[#fcefee] rounded-md overflow-hidden border border-slate-200 shadow-sm relative">
                                    <div className="absolute top-0 w-full h-2 bg-pink-100/50"></div>
                                    <div className="absolute bottom-0 w-full h-2 bg-pink-100/50"></div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-pink-800/40 p-1">
                                       <div className="h-[2px] w-6 bg-pink-800/30 mb-1"></div>
                                       <div className="h-[1px] w-10 bg-pink-800/20"></div>
                                    </div>
                                 </div>
                                 {/* Card 4 */}
                                 <div className="aspect-[4/3] bg-[#1a4a38] rounded-md overflow-hidden border border-slate-200 shadow-sm relative">
                                    <div className="absolute inset-1 border border-white/20 rounded-sm"></div>
                                 </div>
                              </div>
                           </div>

                           {/* Live Chat Status */}
                           <div className="space-y-1.5">
                              <h3 className="text-[9px] font-bold text-slate-800">Live Chat Status</h3>
                              <div className="flex gap-2">
                                 <div className="flex-1 bg-[#eefaf4] border border-green-100 rounded-xl p-2.5 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                       <div>
                                          <p className="text-xl font-black text-slate-900 leading-none mb-1">45</p>
                                          <p className="text-[8px] text-slate-600 font-medium">Active chats</p>
                                       </div>
                                       <div className="h-3 w-3 bg-green-500 rounded-full flex items-center justify-center">
                                          <CheckCircle2 className="h-2 w-2 text-white" />
                                       </div>
                                    </div>
                                    <Button className="w-full bg-[#34b46c] hover:bg-[#2da05f] h-6 text-[8px] font-bold gap-1.5 rounded-md mt-2 shadow-none">
                                       <MessageSquare className="h-2.5 w-2.5" /> Chat with Invitely Bot
                                    </Button>
                                 </div>

                                 <div className="flex-1 flex flex-col gap-2">
                                    <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-2 flex justify-between items-start relative">
                                       <div>
                                          <p className="text-lg font-black text-slate-900 leading-none mb-1">0</p>
                                          <p className="text-[8px] text-slate-600 font-medium">Active charges</p>
                                       </div>
                                       <BarChart3 className="h-3 w-3 text-green-500" />
                                    </div>
                                    <div className="bg-[#f5f3ff] border border-indigo-50 rounded-xl p-2">
                                       <p className="text-lg font-black text-slate-900 leading-none mb-1">115</p>
                                       <p className="text-[8px] text-slate-600 font-medium">Total chats</p>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* System Settings */}
                           <div className="space-y-1.5 pb-2">
                              <h3 className="text-[9px] font-bold text-slate-800">System Settings</h3>
                              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                                 <Settings className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                 <div className="flex-1">
                                    <p className="text-[9px] font-bold text-slate-800 leading-none">System Settings</p>
                                    <p className="text-[7px] text-slate-400 mt-0.5">Manage configuration</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               {/* Workflow Diagram (Floating below mockup) */}
               <div className=" flex justify-center z-20">
                  <div className="flex items-center gap-2 max-w-md w-full ml-20">

                     {/* Step 1 */}
                     <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-white rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center justify-center text-green-600 relative overflow-hidden">
                           <div className="absolute inset-0 bg-green-50/50"></div>
                           <Cpu className="h-5 w-5 relative z-10" />
                        </div>
                        <p className="text-[14px] font-bold text-slate-800 mt-2">AI Extraction</p>
                     </div>

                     {/* Arrow */}
                     <div className="flex-1 flex items-center px-1">
                        <div className="h-[1px] bg-green-200 w-full relative">
                           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-green-200 rotate-45"></div>
                        </div>
                     </div>

                     {/* Step 2 */}
                     <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-white rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center justify-center text-green-600 relative overflow-hidden">
                           <div className="absolute inset-0 bg-green-50/50"></div>
                           <MessageSquare className="h-5 w-5 relative z-10" />
                        </div>
                        <p className="text-[14px] font-bold text-slate-800 mt-2">Chat RSVP</p>
                     </div>

                     {/* Arrow */}
                     <div className="flex-1 flex items-center px-1">
                        <div className="h-[1px] bg-green-200 w-full relative">
                           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-green-200 rotate-45"></div>
                        </div>
                     </div>

                     {/* Step 3 */}
                     <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-white rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center justify-center text-green-600 relative overflow-hidden">
                           <div className="absolute inset-0 bg-green-50/50"></div>
                           <MonitorSmartphone className="h-5 w-5 relative z-10" />
                        </div>
                        <p className="text-[14px] font-bold text-slate-800 mt-2 text-center leading-tight">Real-time Update</p>
                     </div>

                  </div>
               </div>
            </div>

         </div>

         <Footer />

      </div>
   );
};

export default LandingPage;
