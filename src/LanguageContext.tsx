import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'Campus Lost & Found',
    login: 'Login with Google',
    logout: 'Logout',
    lost: 'Lost',
    found: 'Found',
    reportItem: 'Report Item',
    myItems: 'My Reports',
    allItems: 'All Items',
    messages: 'Messages',
    title: 'Title',
    description: 'Description',
    location: 'Location',
    category: 'Category',
    date: 'Date',
    status: 'Status',
    active: 'Active',
    resolved: 'Resolved',
    submit: 'Submit Report',
    cancel: 'Cancel',
    loading: 'Loading...',
    noItems: 'No items found',
    noItemsDesc: 'Try adjusting your search or filters, or be the first to report an item.',
    searchPlaceholder: 'Search by title, description, or location...',
    filterByType: 'All Types',
    filterByCategory: 'All Categories',
    reportedBy: 'Reported by',
    markResolved: 'Mark Resolved',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this report?',
    campusOnly: 'Report, search, and recover lost items on campus with AI-powered smart matching.',
    contact: 'Contact',
    typeMessage: 'Type a message...',
    send: 'Send',
    noMessages: 'No messages yet',
    noMessagesDesc: 'Start a conversation by contacting a reporter on an item.',
    chatWith: 'Chat with',
    selectChat: 'Select a conversation',
    selectChatDesc: 'Choose a chat from the sidebar to start messaging.',
    dashboard: 'Dashboard',
    stats: 'Campus Statistics',
    totalLost: 'Total Lost',
    totalFound: 'Total Found',
    resolvedItems: 'Resolved',
    recentActivity: 'Recent Activity',
    imageUpload: 'Upload Image',
    optional: '(Optional)',
    possibleMatches: 'AI Smart Matches',
    viewDetails: 'View Details',
    findMatches: 'Find Matches',
    findingMatches: 'Finding matches...',
    noMatches: 'No matches found',
    noMatchesDesc: 'The AI could not find any matching found items. Check back later as more items are reported.',
    matchScore: 'Match Score',
    itemDetail: 'Item Details',
    back: 'Back',
    contactReporter: 'Contact Reporter',
    type: 'Type',
    next: 'Next',
    previous: 'Previous',
    step: 'Step',
    of: 'of',
    basicInfo: 'Basic Information',
    detailsLocation: 'Details & Location',
    uploadReview: 'Upload & Review',
    dragDrop: 'Drag & drop your image here, or click to browse',
    maxFileSize: 'Max file size: 5MB. Supported: JPG, PNG, WebP',
    uploading: 'Uploading...',
    reportSuccess: 'Item reported successfully!',
    reportError: 'Failed to report item. Please try again.',
    deleteSuccess: 'Item deleted successfully.',
    statusUpdated: 'Status updated successfully.',
    smartMatchInfo: 'AI analyzes your lost item against all found items to find potential matches.',
    welcomeBack: 'Welcome back',
    quickActions: 'Quick Actions',
    reportLost: 'Report Lost',
    reportFound: 'Report Found',
  },
  hi: {
    appName: 'कैंपस खोया और पाया',
    login: 'गूगल के साथ लॉगिन करें',
    logout: 'लॉगआउट',
    lost: 'खोया',
    found: 'पाया',
    reportItem: 'आइटम की रिपोर्ट करें',
    myItems: 'मेरी रिपोर्ट',
    allItems: 'सभी आइटम',
    messages: 'संदेश',
    title: 'शीर्षक',
    description: 'विवरण',
    location: 'स्थान',
    category: 'श्रेणी',
    date: 'तारीख',
    status: 'स्थिति',
    active: 'सक्रिय',
    resolved: 'सुलझा हुआ',
    submit: 'रिपोर्ट जमा करें',
    cancel: 'रद्द करें',
    loading: 'लोड हो रहा है...',
    noItems: 'कोई आइटम नहीं मिला',
    noItemsDesc: 'अपनी खोज या फ़िल्टर समायोजित करें, या पहले रिपोर्ट करें।',
    searchPlaceholder: 'शीर्षक, विवरण, या स्थान से खोजें...',
    filterByType: 'सभी प्रकार',
    filterByCategory: 'सभी श्रेणियाँ',
    reportedBy: 'द्वारा रिपोर्ट किया गया',
    markResolved: 'सुलझा हुआ चिह्नित करें',
    delete: 'हटाएं',
    confirmDelete: 'क्या आप वाकई इस रिपोर्ट को हटाना चाहते हैं?',
    campusOnly: 'AI-संचालित स्मार्ट मैचिंग के साथ कैंपस पर खोई वस्तुओं की रिपोर्ट करें, खोजें और पुनर्प्राप्त करें।',
    contact: 'संपर्क करें',
    typeMessage: 'एक संदेश टाइप करें...',
    send: 'भेजें',
    noMessages: 'अभी तक कोई संदेश नहीं',
    noMessagesDesc: 'किसी आइटम पर रिपोर्टर से संपर्क करके बातचीत शुरू करें।',
    chatWith: 'चैट करें',
    selectChat: 'बातचीत चुनें',
    selectChatDesc: 'मैसेजिंग शुरू करने के लिए साइडबार से चैट चुनें।',
    dashboard: 'डैशबोर्ड',
    stats: 'कैंपस आँकड़े',
    totalLost: 'कुल खोया',
    totalFound: 'कुल पाया',
    resolvedItems: 'सुलझाए गए',
    recentActivity: 'हाल की गतिविधि',
    imageUpload: 'छवि अपलोड करें',
    optional: '(वैकल्पिक)',
    possibleMatches: 'AI स्मार्ट मैच',
    viewDetails: 'विवरण देखें',
    findMatches: 'मैच खोजें',
    findingMatches: 'मैच खोजे जा रहे हैं...',
    noMatches: 'कोई मैच नहीं मिला',
    noMatchesDesc: 'AI को कोई मेल खाते आइटम नहीं मिले। बाद में पुनः जांचें।',
    matchScore: 'मैच स्कोर',
    itemDetail: 'आइटम विवरण',
    back: 'वापस',
    contactReporter: 'रिपोर्टर से संपर्क करें',
    type: 'प्रकार',
    next: 'अगला',
    previous: 'पिछला',
    step: 'चरण',
    of: 'का',
    basicInfo: 'बुनियादी जानकारी',
    detailsLocation: 'विवरण और स्थान',
    uploadReview: 'अपलोड और समीक्षा',
    dragDrop: 'यहां छवि खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
    maxFileSize: 'अधिकतम फ़ाइल: 5MB। समर्थित: JPG, PNG, WebP',
    uploading: 'अपलोड हो रहा है...',
    reportSuccess: 'आइटम सफलतापूर्वक रिपोर्ट किया गया!',
    reportError: 'रिपोर्ट करने में विफल। कृपया पुनः प्रयास करें।',
    deleteSuccess: 'आइटम सफलतापूर्वक हटा दिया गया।',
    statusUpdated: 'स्थिति सफलतापूर्वक अपडेट की गई।',
    smartMatchInfo: 'AI आपकी खोई वस्तु का सभी पाई गई वस्तुओं से मिलान करता है।',
    welcomeBack: 'वापसी पर स्वागत है',
    quickActions: 'त्वरित कार्य',
    reportLost: 'खोया रिपोर्ट करें',
    reportFound: 'पाया रिपोर्ट करें',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'hi') ? saved : 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
