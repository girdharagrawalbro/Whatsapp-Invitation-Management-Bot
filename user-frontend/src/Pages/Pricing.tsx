
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
   Check,
   CheckCircle2,
   Zap,
   MessageSquare,
   ShieldCheck,
   BarChart3,
   Users,
   Building2,
   Globe,
   ArrowRight,
   Layout,
   Star,
   Plus,
   Minus,
   FileText,
   MessagesSquare,
   Medal,
   Briefcase,
   ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Bg from '@/components/Bg';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/LanguageContext';

const Pricing = () => {
   const { t, lang } = useLanguage();
   const navigate = useNavigate();
   const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

   const plans = [
      {
         name: t('pricing.starter.name'),
         subtitle: t('pricing.free'),
         price: "0",
         color: "bg-slate-50 border-slate-200",
         headerColor: "bg-slate-100 text-slate-600",
         buttonColor: "bg-indigo-600 hover:bg-indigo-700",
         buttonText: t('pricing.register'),
         icons: [<FileText className="h-5 w-5" />, <Layout className="h-5 w-5" />],
         features: [
            t('features.ai.desc3'),
            t('features.manage.desc1'),
            t('pricing.feature.limited'),
            t('pricing.feature.reports')
         ]
      },
      {
         name: t('pricing.essential.name'),
         subtitle: t('pricing.popular'),
         price: "149",
         isPopular: true,
         badge: t('common.whatsapp'),
         color: "bg-white border-[#3fc07c]",
         headerColor: "bg-[#3fc07c] text-white",
         buttonColor: "bg-[#3fc07c] hover:bg-[#2da05f]",
         buttonText: t('pricing.getStarted'),
         icons: [<MessageSquare className="h-5 w-5" />, <MessagesSquare className="h-5 w-5" />],
         features: [
            t('features.ai.desc1'),
            t('features.rsvp.desc1'),
            t('features.manage.desc3'),
            t('pricing.feature.support')
         ]
      }
   ];

   const faqs = [
      { q: "What is we vers choost oyne?", a: "Yes, we offer various plans to suit your needs." },
      { q: "What care paapers in extracoot?", a: "Our AI extracts all relevant details from your invitation cards." },
      { q: "What does essential mean?", a: "The Essential plan is perfect for growing organizers." },
      { q: "What hov the ayuceert?", a: "You can upgrade or downgrade your plan at any time." },
      { q: "What can care opused arews?", a: "We support a wide range of card designs and languages." }
   ];

   return (
      <div className="min-h-screen bg-[#fcfdfd] font-sans text-slate-900 overflow-hidden selection:bg-green-100 selection:text-green-900 relative z-0">
         <Bg />
         <Navbar />

         <main className="pt-15 pb-20 px-6 sm:px-8 lg:px-12 max-w-[1600px] mx-auto relative z-10">
            {/* Hero Section */}
            <div className="text-center mb-16 animate-in fade-in   slide-in-from-top-20 duration-1000">
               <h1 className="text-[3.5rem] md:text-5xl font-black text-slate-900 leading-tight mb-4">
                  {t('pricing.title')}
               </h1>
               {/* <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8">
                  Invitely: The Perfect Plan for Your Needs
               </h2> */}

               <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center gap-4">
                     <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-green-100 shadow-sm">
                        <img src="https://res.cloudinary.com/dcmrsdydh/image/upload/v1777979790/qx93nmwgo0noa3yvwvq0.jpg" alt="Rahul and Priya" className="h-full w-full object-cover" />
                     </div>
                     <div className="text-left">
                        <p className="font-black text-slate-900">{lang === 'HI' ? 'राहुल और प्रिया' : 'Rahul & Priya'}</p>
                        <p className="text-sm text-slate-600 font-medium italic">{t('pricing.hero.testimonial')}</p>
                     </div>
                  </div>
                  <Button size="lg" className="cursor-pointer bg-indigo-500 hover:bg-indigo-700 text-white px-10 h-12 rounded-xl text-lg font-bold shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105">
                     {t('pricing.hero.cta')}
                  </Button>
               </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="flex gap-6 mb-24 justify-center">
               {plans.map((plan, index) => (
                  <div
                     key={index}
                     className={`relative rounded-[2rem] border-2 w-[380px] ${plan.color} overflow-hidden shadow-xl flex flex-col transition-all duration-300 hover:translate-y-[-8px] animate-in fade-in slide-in-from-bottom-8`}
                     style={{ animationDelay: `${index * 100}ms` }}
                  >
                     {/* Badge Header */}
                     <div className={`h-12 flex items-center justify-center font-bold text-sm ${plan.headerColor}`}>
                        {plan.badge || plan.name}
                     </div>

                     <div className="p-8 flex-1 flex flex-col items-center text-center">
                        <div className="flex gap-2 mb-4">
                           {plan.icons.map((icon, i) => (
                              <div key={i} className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                 {icon}
                              </div>
                           ))}
                        </div>

                        <h3 className="text-3xl font-black text-slate-900 mb-1">{plan.name}</h3>
                        <p className="text-lg font-bold text-slate-500 mb-6">{plan.subtitle}</p>

                        <div className="w-full h-[1px] bg-slate-100 mb-6"></div>



                        <ul className="space-y-3 mb-8 text-left w-full">
                           {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-600">
                                 <Check className="h-4 w-4 text-[#3fc07c] shrink-0 mt-0.5" />
                                 {feature}
                              </li>
                           ))}
                        </ul>

                        <div className="mt-auto w-full">
                           {/* Monthly/Yearly Toggle UI */}
                           <div className="flex bg-slate-100 p-1 rounded-lg mb-6 max-w-[140px] mx-auto">
                              <button
                                 className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm' : 'text-slate-400'}`}
                                 onClick={() => setBillingCycle('monthly')}
                              >
                                 Monthly
                              </button>
                              <button
                                 className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${billingCycle === 'yearly' ? 'bg-white shadow-sm' : 'text-slate-400'}`}
                                 onClick={() => setBillingCycle('yearly')}
                              >
                                 Yearly
                              </button>
                           </div>

                           <div className="mb-6 flex items-baseline justify-center gap-1">
                              <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">per month</span>
                           </div>

                           <Button onClick={() => { navigate("/login") }} className={`w-full ${plan.buttonColor} text-white h-12 rounded-xl text-md font-black shadow-lg`}>
                              {plan.buttonText}
                           </Button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Comparison Table
            <div className="mb-24 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl animate-in fade-in slide-in-from-bottom-8">
               <div className="p-8 border-b border-slate-50">
                  <h3 className="text-2xl font-black text-slate-900">Compare All Features</h3>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50">
                           <th className="p-6 text-sm font-black text-slate-800">Feature Feature</th>
                           <th className="p-6 text-sm font-black text-slate-800 text-center">Starter</th>
                           <th className="p-6 text-sm font-black text-slate-800 text-center">Essential</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {[
                           "50 free card extractions",
                           "1 active chat",
                           "Daily reports",
                           "Active chats",
                           "Priority support",
                           "API access"
                        ].map((feature, i) => (
                           <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-6 text-sm font-bold text-slate-600">{feature}</td>
                              <td className="p-6 text-center">
                                 <CheckCircle2 className="h-5 w-5 text-[#3fc07c] mx-auto" />
                              </td>
                              <td className="p-6 text-center">
                                 <CheckCircle2 className="h-5 w-5 text-[#3fc07c] mx-auto fill-[#3fc07c] text-white" />
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div> */}

            {/* FAQ and As Seen In */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-8">FAQ</h3>
                  <div className="space-y-4">
                     {faqs.map((faq, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center group">
                           <p className="font-bold text-slate-700">{faq.q}</p>
                           <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 grayscale opacity-50 mb-12">
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest w-full text-center mb-4">As Seen In:</span>
                     <span className="font-bold text-2xl flex items-center gap-2 tracking-tight text-slate-800"><Globe className="h-6 w-6" /> TechToday</span>
                     <span className="font-black text-2xl tracking-tighter text-slate-800 uppercase">YOURSTORY</span>
                     <span className="font-serif font-bold text-xl text-slate-800 flex items-center gap-2">
                        <div className="bg-red-600 text-white text-[10px] px-1 py-0.5 leading-none font-sans">ET</div>
                        ECONOMIC TIMES
                     </span>
                  </div>
               </div>
            </div> */}

            {/* Rahul & Priya Experience */}
            <div className="bg-[#111928] rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
               <div className="relative z-10 w-full md:w-1/3">
                  <div className="aspect-square rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
                     <img src="https://res.cloudinary.com/dcmrsdydh/image/upload/v1777979790/qx93nmwgo0noa3yvwvq0.jpg" alt="Experience" className="h-full w-full object-cover" />
                  </div>
               </div>
               <div className="relative z-10 flex-1 space-y-6">
                  <h2 className="text-4xl font-black leading-tight">
                     {t('pricing.testimonial.title')}
                  </h2>
                  <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-2xl">
                     {t('pricing.testimonial.desc')}
                  </p>
                  <div className="pt-4">
                     <p className="text-2xl font-bold italic mb-6">"{t('pricing.testimonial.quote')}"</p>
                     <Button size="lg" onClick={() => { navigate("/login") }} className="bg-[#3fc07c] hover:bg-[#2da05f] text-white px-10 h-14 rounded-2xl text-xl font-black transition-all hover:scale-105 active:scale-95">
                        {t('pricing.testimonial.cta')}
                     </Button>
                  </div>
               </div>
            </div>
         </main>

         <Footer />
      </div>
   );
};

export default Pricing;
