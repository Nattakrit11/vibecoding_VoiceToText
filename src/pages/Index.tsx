
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import ApiSettings from '@/components/ApiSettings';
import AudioUpload from '@/components/AudioUpload';
import TranscriptionDisplay from '@/components/TranscriptionDisplay';
import HistoryPanel, { HistoryItem } from '@/components/HistoryPanel';
import { Mic, Sparkles } from 'lucide-react';

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

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

  // บันทึก API Key ลง localStorage
  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('gemini-api-key', newApiKey);
    toast({
      title: "บันทึกสำเร็จ",
      description: "API Key ถูกบันทึกแล้ว"
    });
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
                text: "กرุณาถอดเสียงจากไฟล์เสียงนี้เป็นข้อความภาษาไทย"
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
          title: "ถอดเสียงสำเร็จ",
          description: "ไฟล์เสียงถูกแปลงเป็นข้อความด้วย Gemini AI แล้ว"
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
  const handleTextToSpeech = async (text: string) => {
    if (!text.trim()) {
      toast({
        title: "ไม่มีข้อความ",
        description: "กรุณาใส่ข้อความที่ต้องการแปลงเป็นเสียง",
        variant: "destructive"
      });
      return;
    }

    // ตรวจสอบว่าเบราว์เซอร์รองรับ Speech Synthesis หรือไม่
    if (!('speechSynthesis' in window)) {
      toast({
        title: "ไม่รองรับ",
        description: "เบราว์เซอร์ของคุณไม่รองรับการแปลงข้อความเป็นเสียง",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingAudio(true);
    
    try {
      // หยุดการพูดที่กำลังทำงานอยู่
      speechSynthesis.cancel();
      
      // สร้าง utterance object
      const utterance = new SpeechSynthesisUtterance(text);
      
      // ตั้งค่าเสียง
      utterance.lang = 'th-TH'; // ภาษาไทย
      utterance.rate = 0.9; // ความเร็วในการพูด
      utterance.pitch = 1; // ระดับเสียง
      utterance.volume = 1; // ระดับความดัง

      // ลองหาเสียงภาษาไทยจากที่มีอยู่
      const voices = speechSynthesis.getVoices();
      const thaiVoice = voices.find(voice => voice.lang.includes('th') || voice.lang.includes('TH'));
      if (thaiVoice) {
        utterance.voice = thaiVoice;
      }

      // Event listeners
      utterance.onstart = () => {
        console.log('เริ่มการพูด');
      };

      utterance.onend = () => {
        setIsGeneratingAudio(false);
        toast({
          title: "เล่นเสียงเสร็จสิ้น",
          description: "การแปลงข้อความเป็นเสียงเสร็จสมบูรณ์แล้ว"
        });
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsGeneratingAudio(false);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถแปลงข้อความเป็นเสียงได้",
          variant: "destructive"
        });
      };

      // เริ่มการพูด
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsGeneratingAudio(false);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแปลงข้อความเป็นเสียงได้",
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

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setTranscription(item.transcription);
    toast({
      title: "เลือกรายการแล้ว",
      description: `แสดงผลการถอดเสียงของ ${item.fileName}`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
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
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              AI Speech Studio
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            ระบบถอดเสียงและสร้างเสียงด้วย Gemini AI รองรับภาษาไทยอย่างสมบูรณ์
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
              isLoading={isProcessing}
              onTextToSpeech={handleTextToSpeech}
              isGeneratingAudio={isGeneratingAudio}
            />
          </div>

          <div>
            <HistoryPanel
              history={history}
              onClearHistory={handleClearHistory}
              onSelectItem={handleSelectHistoryItem}
            />
          </div>
        </div>

        <div className="text-center mt-16 pt-8 border-t border-white/10">
          <p className="text-white/60 text-sm">
            พัฒนาด้วย ❤️ โดยใช้ Gemini AI และ Web Speech API
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/50">
            <span>รองรับไฟล์เสียงทุกประเภท</span>
            <span>•</span>
            <span>ขนาดไม่เกิน 10MB</span>
            <span>•</span>
            <span>ข้อมูลปลอดภัย 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
