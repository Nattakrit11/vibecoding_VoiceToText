
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  th: {
    title: 'AI Speech Studio',
    subtitle: 'ระบบถอดเสียงและสร้างเสียงด้วย Gemini AI รองรับภาษาไทยอย่างสมบูรณ์',
    apiKeyTitle: 'การตั้งค่า API',
    apiKeyPlaceholder: 'ใส่ Gemini API Key ของคุณ',
    apiKeySaved: 'บันทึกสำเร็จ',
    apiKeySavedDesc: 'API Key ถูกบันทึกแล้ว',
    uploadTitle: 'อัพโหลดไฟล์เสียง',
    uploadDesc: 'เลือกไฟล์เสียงเพื่อถอดเป็นข้อความ',
    transcriptionTitle: 'ผลการถอดเสียงเป็นข้อความ',
    transcriptionPlaceholder: 'ผลการถอดเสียงจะแสดงที่นี่...',
    processing: 'กำลังถอดเสียงเป็นข้อความ...',
    pleaseWait: 'กรุณารอสักครู่',
    copyText: 'คัดลอกข้อความ',
    downloadText: 'ดาวน์โหลดข้อความ',
    textToSpeech: 'แปลงข้อความเป็นเสียง',
    stopSpeech: 'หยุดการเล่นเสียง',
    historyTitle: 'ประวัติการใช้งาน',
    noHistory: 'ยังไม่มีประวัติการใช้งาน',
    startByUpload: 'เริ่มต้นโดยการอัพโหลดไฟล์เสียง',
    transcriptionSuccess: 'ถอดเสียงสำเร็จ',
    transcriptionSuccessDesc: 'ไฟล์เสียงถูกแปลงเป็นข้อความด้วย Gemini AI แล้ว',
    footer: 'พัฒนาด้วย ❤️ โดยใช้ Gemini AI และ Web Speech API',
    supportAllAudio: 'รองรับไฟล์เสียงทุกประเภท',
    maxSize: 'ขนาดไม่เกิน 10MB',
    secureData: 'ข้อมูลปลอดภัย 100%'
  },
  en: {
    title: 'AI Speech Studio',
    subtitle: 'Speech-to-text and text-to-speech system powered by Gemini AI with full Thai language support',
    apiKeyTitle: 'API Settings',
    apiKeyPlaceholder: 'Enter your Gemini API Key',
    apiKeySaved: 'Saved Successfully',
    apiKeySavedDesc: 'API Key has been saved',
    uploadTitle: 'Upload Audio File',
    uploadDesc: 'Select an audio file to transcribe to text',
    transcriptionTitle: 'Transcription Results',
    transcriptionPlaceholder: 'Transcription results will appear here...',
    processing: 'Transcribing audio to text...',
    pleaseWait: 'Please wait a moment',
    copyText: 'Copy Text',
    downloadText: 'Download Text',
    textToSpeech: 'Convert Text to Speech',
    stopSpeech: 'Stop Speech',
    historyTitle: 'Usage History',
    noHistory: 'No usage history yet',
    startByUpload: 'Start by uploading an audio file',
    transcriptionSuccess: 'Transcription Successful',
    transcriptionSuccessDesc: 'Audio file has been converted to text using Gemini AI',
    footer: 'Built with ❤️ using Gemini AI and Web Speech API',
    supportAllAudio: 'Supports all audio formats',
    maxSize: 'Maximum 10MB',
    secureData: '100% Secure Data'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('th');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'th' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['th']] || key;
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
