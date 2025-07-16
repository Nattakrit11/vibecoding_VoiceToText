import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import ApiSettings from '@/components/ApiSettings';
import AudioUpload from '@/components/AudioUpload';
import TranscriptionDisplay from '@/components/TranscriptionDisplay';
import HistoryPanel, { HistoryItem } from '@/components/HistoryPanel';
import Header from '@/components/Header';
import { Mic, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [transcription, setTranscription] = useState('');
  const [transcriptionContent, setTranscriptionContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { theme } = useTheme();

  // โหลดข้อมูลจาก localStorage เมื่อเริ่มต้น
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini-api-key');
    const savedHistory = localStorage.getItem('transcription-history');
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(parsedHistory);
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }
  }, []);

  // บันทึก API Key ลง localStorage (auto-save, no toast)
  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('gemini-api-key', newApiKey);
  };

  // แปลงไฟล์เสียงเป็น base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // ลบ prefix "data:audio/...;base64," ออก
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // เรียกใช้ Gemini API สำหรับถอดเสียง
  const handleFileUpload = async (file: File) => {
    if (!apiKey) {
      toast({
        title: "ไม่พบ API Key",
        description: "กรุณาใส่ Gemini API Key ก่อนใช้งาน",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // แปลงไฟล์เป็น base64
      const base64Audio = await fileToBase64(file);
      
      // สร้าง timestamp จริง
      const now = new Date();
      const timestamp = now.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' ' + now.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      // เรียกใช้ Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `กรุณาถอดเสียงจากไฟล์เสียงนี้เป็นข้อความภาษาไทย และจัดรูปแบบดังนี้:

1. ใส่วันที่และเวลาที่ถอดข้อความ: Transcription Generated: ${timestamp}
2. แสดงข้อความที่ถอดได้
3. สรุป Pain Points และ Gain Points จากเนื้อหา

รูปแบบที่ต้องการ:
Transcription Generated: ${timestamp}

TRANSCRIPTION:
[ข้อความที่ถอดได้จากเสียง]

SUMMARY:
Pain: [จุดเจ็บปวด/ปัญหาที่พบในเนื้อหา]
Gain: [ประโยชน์/สิ่งดีที่พบในเนื้อหา]

หากไม่มี Pain หรือ Gain ใดๆ ให้ใส่ "(None mentioned)"
`
              },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64Audio
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates[0] && result.candidates[0].content) {
        const transcribedText = result.candidates[0].content.parts[0].text;
        setTranscription(transcribedText);
        
        // แยกเฉพาะส่วน TRANSCRIPTION content
        const transcriptionMatch = transcribedText.match(/TRANSCRIPTION:\s*\n([\s\S]*?)(?=\n\s*SUMMARY:|$)/);
        const contentOnly = transcriptionMatch ? transcriptionMatch[1].trim() : transcribedText;
        setTranscriptionContent(contentOnly);
        
        // เพิ่มลงประวัติ
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          fileType: file.type,
          transcription: transcribedText,
          timestamp: new Date()
        };
        
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        
        // บันทึกประวัติลง localStorage
        localStorage.setItem('transcription-history', JSON.stringify(updatedHistory));
        
        toast({
          title: t('transcriptionSuccess'),
          description: t('transcriptionSuccessDesc')
        });
      } else {
        throw new Error('ไม่สามารถถอดเสียงได้');
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถถอดเสียงได้ กรุณาตรวจสอบ API Key หรือไฟล์เสียง",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ใช้ Web Speech API ของเบราว์เซอร์สำหรับแปลงข้อความเป็นเสียง
  const handleStopTextToSpeech = () => {
    speechSynthesis.cancel();
    setIsGeneratingAudio(false);
    setCurrentUtterance(null);
    toast({
      title: "หยุดการเล่นเสียงแล้ว",
      description: "การแปลงข้อความเป็นเสียงถูกหยุดแล้ว"
    });
  };

  // ดาวน์โหลดข้อความเป็นไฟล์
  const handleDownloadText = (text: string) => {
    if (!transcriptionContent.trim()) {
      toast({
        title: "ไม่มีข้อความ",
        description: "ไม่มีข้อความให้ดาวน์โหลด",
        variant: "destructive"
      });
      return;
    }

    try {
      const blob = new Blob([transcriptionContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "ดาวน์โหลดสำเร็จ",
        description: "ไฟล์ข้อความถูกดาวน์โหลดแล้ว"
      });
    } catch (error) {
      console.error('Error downloading text:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดาวน์โหลดไฟล์ได้",
        variant: "destructive"
      });
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('transcription-history');
    toast({
      title: "ล้างประวัติแล้ว",
      description: "ประวัติการใช้งานถูกลบออกแล้ว"
    });
  };

  // ลบรายการประวัติแต่ละอัน
  const handleDeleteHistoryItem = (itemId: string) => {
    const updatedHistory = history.filter(item => item.id !== itemId);
    setHistory(updatedHistory);
    localStorage.setItem('transcription-history', JSON.stringify(updatedHistory));
    toast({
      title: "ลบรายการแล้ว",
      description: "รายการประวัติถูกลบออกแล้ว"
    });
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setTranscription(item.transcription);
    toast({
      title: "เลือกรายการแล้ว",
      description: `แสดงผลการถอดเสียงของ ${item.fileName}`
    });
  };

  // Improved text-to-speech function with immediate playback
  const handleTextToSpeech = async (text: string) => {
    if (!transcriptionContent.trim()) {
      toast({
        title: "No Text",
        description: "Please enter text to convert to speech",
        variant: "destructive"
      });
      return;
    }

    if (!('speechSynthesis' in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingAudio(true);
    
    try {
      // Stop any current speech
      speechSynthesis.cancel();
      
      // Wait a bit for the cancel to take effect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const utterance = new SpeechSynthesisUtterance(transcriptionContent);
      setCurrentUtterance(utterance);
      
      utterance.lang = 'th-TH';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find Thai voice
      const voices = speechSynthesis.getVoices();
      const thaiVoice = voices.find(voice => voice.lang.includes('th') || voice.lang.includes('TH'));
      if (thaiVoice) {
        utterance.voice = thaiVoice;
      }

      utterance.onstart = () => {
        console.log('Speech started');
      };

      utterance.onend = () => {
        setIsGeneratingAudio(false);
        setCurrentUtterance(null);
        toast({
          title: t('apiKeySaved'),
          description: "Speech playback completed"
        });
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsGeneratingAudio(false);
        setCurrentUtterance(null);
        toast({
          title: "Error",
          description: "Cannot convert text to speech",
          variant: "destructive"
        });
      };

      // Start speaking immediately
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsGeneratingAudio(false);
      setCurrentUtterance(null);
      toast({
        title: "Error",
        description: "Cannot convert text to speech",
        variant: "destructive"
      });
    }
  };

  const themeClasses = theme === 'light' 
    ? "min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100"
    : theme === 'light-blue'
    ? "min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100"
    : "min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900";

  const textClasses = theme === 'light' || theme === 'light-blue' ? "text-gray-800" : "text-white";
  const subtitleClasses = theme === 'light' || theme === 'light-blue' ? "text-gray-600" : "text-white/80";

  return (
    <div className={themeClasses}>
      <Header />
      
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold ${textClasses}`}>
              {t('title')}
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <p className={`text-xl ${subtitleClasses} max-w-2xl mx-auto`}>
            {t('subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ApiSettings 
              apiKey={apiKey}
              onApiKeyChange={handleApiKeyChange}
            />
            
            <AudioUpload 
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
            />
            
            <TranscriptionDisplay
              transcription={transcription}
              transcriptionContent={transcriptionContent}
              isLoading={isProcessing}
              onTextToSpeech={handleTextToSpeech}
              onStopTextToSpeech={handleStopTextToSpeech}
              onDownloadText={handleDownloadText}
              isGeneratingAudio={isGeneratingAudio}
            />
          </div>

          <div>
            <HistoryPanel
              history={history}
              onClearHistory={handleClearHistory}
              onDeleteItem={handleDeleteHistoryItem}
              onSelectItem={handleSelectHistoryItem}
            />
          </div>
        </div>

        <div className="text-center mt-16 pt-8 border-t border-white/10">
          <p className={`${subtitleClasses} text-sm`}>
            {t('footer')}
          </p>
          <div className={`flex items-center justify-center gap-4 mt-4 text-xs ${subtitleClasses}`}>
            <span>{t('supportAllAudio')}</span>
            <span>•</span>
            <span>{t('maxSize')}</span>
            <span>•</span>
            <span>{t('secureData')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
