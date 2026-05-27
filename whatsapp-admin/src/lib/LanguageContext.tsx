
import React, { createContext, useState, useContext, useEffect } from 'react';

type Language = 'EN' | 'HI';

interface TranslationDict {
  [key: string]: {
    EN: string;
    HI: string;
  };
}

const translations: TranslationDict = {
  // Navbar
  'nav.features': { EN: 'Features', HI: 'विशेषताएं' },
  'nav.pricing': { EN: 'Pricing', HI: 'कीमत' },
  'nav.contact': { EN: 'Contact', HI: 'संपर्क' },
  'nav.login': { EN: 'Log In', HI: 'लॉग इन' },

  // Landing Hero
  'hero.title.pt1': { EN: 'Manage', HI: 'WhatsApp निमंत्रणों को' },
  'hero.title.pt2': { EN: 'WhatsApp Invitations', HI: 'स्मार्ट तरीके से' },
  'hero.title.pt3': { EN: 'Smartly', HI: 'मैनेज करें' },
  'hero.subtitle': { EN: "Your all-in-one AI-powered platform for seamless guest management and native WhatsApp RSVPs.", HI: "निर्बाध अतिथि प्रबंधन और नेटिव व्हाट्सएप RSVP के लिए आपका ऑल-इन-वन AI-पावर्ड प्लेटफॉर्म।" },
  'hero.getStarted': { EN: 'Register Now', HI: 'अभी पंजीकरण करें' },
  'hero.start': { EN: 'Start', HI: 'शुरू करें' },
  'nav.dashboard': { EN: 'Dashboard', HI: 'डैशबोर्ड' },

  // Landing Showcase
  'showcase.ai.title': { EN: 'AI Card Extraction', HI: 'AI कार्ड एक्सट्रैक्शन' },
  'showcase.ai.status': { EN: 'Event Details Extracted Successfully', HI: 'ईवेंट विवरण सफलतापूर्वक निकाला गया' },

  // Features Page
  'features.title': { EN: 'How Invitely Works', HI: 'इन्विटेली कैसे काम करता है' },
  'features.ai.title': { EN: 'AI-Powered Card Extraction', HI: 'AI-पावर्ड कार्ड एक्सट्रैक्शन' },
  'features.ai.desc1': { EN: 'Extract event details from image automatically', HI: 'इमेज से ईवेंट विवरण स्वचालित रूप से निकालें' },
  'features.ai.desc2': { EN: 'Zero manual data entry required', HI: 'शून्य मैनुअल डेटा प्रविष्टि की आवश्यकता' },
  'features.ai.desc3': { EN: '99% extraction accuracy for all card types', HI: 'सभी कार्ड प्रकारों के लिए 99% निष्कर्षण सटीकता' },
  'features.rsvp.title': { EN: 'WhatsApp Native RSVP', HI: 'व्हाट्सएप नेटिव RSVP' },
  'features.rsvp.desc1': { EN: 'Guests RSVP directly within WhatsApp', HI: 'मेहमान सीधे व्हाट्सएप के भीतर RSVP करते हैं' },
  'features.rsvp.desc2': { EN: 'Automatic guest list updates', HI: 'स्वचालित अतिथि सूची अपडेट' },
  'features.manage.title': { EN: 'Advanced Event Management', HI: 'उन्नत ईवेंट प्रबंधन' },
  'features.manage.desc1': { EN: 'Real-time attendance dashboard', HI: 'रीयल-टाइम उपस्थिति डैशबोर्ड' },
  'features.manage.desc2': { EN: 'Guest profile management', HI: 'अतिथि प्रोफाइल प्रबंधन' },
  'features.manage.desc3': { EN: 'Timely invitation reminders', HI: 'समय पर निमंत्रण अनुस्मारक' },

  // Pricing Page
  'pricing.title': { EN: 'The Perfect Plan for Your Needs', HI: 'आपकी आवश्यकताओं के लिए सही योजना' },
  'pricing.hero.testimonial': { EN: '"Best event manager for me, everything is automatic!"', HI: '"मेरे लिए सबसे बेस्ट इवेंट मैनेजर है, सब कुछ ऑटोमैटिक है!"' },
  'pricing.hero.cta': { EN: 'Get Started Like Rahul & Priya', HI: 'राहुल और प्रिया की तरह शुरू करें' },
  'pricing.monthly': { EN: 'Monthly', HI: 'मासिक' },
  'pricing.yearly': { EN: 'Yearly', HI: 'वार्षिक' },
  'pricing.perMonth': { EN: 'per month', HI: 'प्रति माह' },
  'pricing.starter.name': { EN: 'Starter', HI: 'स्टार्टर' },
  'pricing.essential.name': { EN: 'Essential', HI: 'अनिवार्य' },
  'pricing.free': { EN: 'Free', HI: 'मुफ्त' },
  'pricing.popular': { EN: 'Popular', HI: 'लोकप्रिय' },
  'pricing.register': { EN: 'Register Now', HI: 'अभी पंजीकरण करें' },
  'pricing.getStarted': { EN: 'Get Started', HI: 'शुरू करें' },
  'pricing.testimonial.name': { EN: 'Rahul & Priya', HI: 'राहुल और प्रिया' },
  'pricing.testimonial.title': { EN: 'The Rahul & Priya Experience', HI: 'राहुल और प्रिया का अनुभव' },
  'pricing.testimonial.desc': { EN: 'The Rahul & Priya experience has transformed the way they manage their wedding events. Every guest felt special, and every detail was handled automatically.', HI: 'राहुल और प्रिया के अनुभव ने उनके शादी के कार्यक्रमों को प्रबंधित करने के तरीके को बदल दिया है। हर मेहमान ने विशेष महसूस किया, और हर विवरण स्वचालित रूप से संभाला गया।' },
  'pricing.testimonial.quote': { EN: 'All our guests appreciated it', HI: 'हमारे सभी मेहमानों ने सराहना की' },
  'pricing.testimonial.cta': { EN: 'Start Your Stress-Free Event', HI: 'अपना तनाव मुक्त ईवेंट शुरू करें' },

  // Contact Page
  'contact.title': { EN: 'Get in Touch', HI: 'हमसे संपर्क करें' },
  'contact.subtitle': { EN: "Have questions? We're here to help you manage your invitations perfectly.", HI: 'प्रश्न हैं? हम आपके निमंत्रणों को पूरी तरह से प्रबंधित करने में आपकी सहायता के लिए यहां हैं।' },
  'contact.label.name': { EN: 'Full Name', HI: 'पूरा नाम' },
  'contact.label.email': { EN: 'Email Address', HI: 'ईमेल पता' },
  'contact.label.subject': { EN: 'Subject', HI: 'विषय' },
  'contact.label.message': { EN: 'Message', HI: 'संदेश' },
  'contact.button.send': { EN: 'Send Message', HI: 'संदेश भेजें' },
  'contact.info.title': { EN: 'Contact Information', HI: 'संपर्क जानकारी' },
  'contact.info.email': { EN: 'Email Us', HI: 'हमें ईमेल करें' },
  'contact.info.phone': { EN: 'Call Us', HI: 'हमें कॉल करें' },
  'contact.info.visit': { EN: 'Visit Us', HI: 'हमसे मिलें' },
  'contact.social.title': { EN: 'Follow Our Journey', HI: 'हमारी यात्रा का अनुसरण करें' },
  'contact.whatsapp.fast': { EN: 'Fast Support', HI: 'तेजी से सहायता' },
  'contact.whatsapp.title': { EN: 'Chat with us on WhatsApp', HI: 'व्हाट्सएप पर हमारे साथ चैट करें' },
  'contact.whatsapp.desc': { EN: 'Get instant answers to your questions from our support bot and team.', HI: 'हमारे सपोर्ट बॉट और टीम से अपने सवालों के तुरंत जवाब पाएं।' },
  'contact.whatsapp.cta': { EN: 'Open WhatsApp Chat', HI: 'व्हाट्सएप चैट खोलें' },

  // Auth Pages
  'auth.login.title': { EN: 'Log In to Invitely', HI: 'इन्विटेली में लॉग इन करें' },
  'auth.signup.title': { EN: 'Sign Up to Invitely', HI: 'इन्विटेली में साइन अप करें' },
  'auth.label.phone': { EN: 'WhatsApp Number', HI: 'व्हाट्सएप नंबर' },
  'auth.label.password': { EN: 'System Password', HI: 'सिस्टम पासवर्ड' },
  'auth.label.org': { EN: 'Full Name / Org Name', HI: 'पूरा नाम / संस्था का नाम' },
  'auth.placeholder.org': { EN: 'e.g. Rahul Sharma or Wedding Org', HI: 'जैसे: राहुल शर्मा या वेडिंग संस्था' },
  'auth.button.login': { EN: 'Log In', HI: 'लॉग इन' },
  'auth.button.register': { EN: 'Register', HI: 'रजिस्टर करें' },
  'auth.forgot': { EN: 'Forgot Password?', HI: 'पासवर्ड भूल गए?' },
  'auth.keepLoggedIn': { EN: 'Keep me logged in for rapid extraction', HI: 'तेजी से एक्सट्रैक्शन के लिए मुझे लॉग इन रखें' },
  'auth.noAccount': { EN: "Don't have an account?", HI: 'खाता नहीं है?' },
  'auth.haveAccount': { EN: 'Already have an account?', HI: 'पहले से ही एक खाता है?' },
  'auth.startFree': { EN: 'Start for free', HI: 'मुफ्त में शुरू करें' },
  'auth.whatsappNote': { EN: "Wait, I'm already in WhatsApp!", HI: 'रुको, मैं पहले से ही व्हाट्सएप पर हूं!' },
  'auth.signupLink': { EN: 'Sign up with WhatsApp RSVP', HI: 'व्हाट्सएप RSVP के साथ साइन अप करें' },

  // Common
  'common.whatsapp': { EN: 'WhatsApp', HI: 'व्हाट्सएप' },
  'common.rights': { EN: 'All rights reserved.', HI: 'सर्वाधिकार सुरक्षित।' },

  // Pricing Features (Additional)
  'pricing.feature.limited': { EN: 'Limited Features', HI: 'सीमित विशेषताएं' },
  'pricing.feature.reports': { EN: 'System reports', HI: 'सिस्टम रिपोर्ट' },
  'pricing.feature.support': { EN: 'System support', HI: 'सिस्टम सहायता' },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('preferredLanguage') as Language) || 'HI';
  });

  useEffect(() => {
    localStorage.setItem('preferredLanguage', lang);
  }, [lang]);

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
