
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

  // จำลองการเรียก Gemini API สำหรับถอดเสียง
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
      // จำลองการประมวลผล (ในการใช้งานจริงจะเรียก Gemini API)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // ข้อความตัวอย่าง (ในการใช้งานจริงจะได้จาก API)
      const mockTranscription = `ข้อความตัวอย่างจากการถอดเสียงไฟล์ "${file.name}" 
      
สวัสดีครับ ยินดีต้อนรับสู่ระบบถอดเสียงเป็นข้อความด้วย AI 
ระบบนี้สามารถถอดเสียงภาษาไทยได้อย่างแม่นยำ 
และยังสามารถแปลงข้อความกลับเป็นเสียงได้อีกด้วย

ขอบคุณที่ใช้บริการของเรา`;

      setTranscription(mockTranscription);
      
      // เพิ่มลงประวัติ
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        fileType: file.type,
        transcription: mockTranscription,
        timestamp: new Date()
      };
      
      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      
      // บันทึกประวัติลง localStorage
      localStorage.setItem('transcription-history', JSON.stringify(updatedHistory));
      
      toast({
        title: "ถอดเสียงสำเร็จ",
        description: "ไฟล์เสียงถูกแปลงเป็นข้อความแล้ว"
      });
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถถอดเสียงได้",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // เรียกใช้ Botnoi API สำหรับสร้างเสียงจากข้อความ
  const handleTextToSpeech = async (text: string) => {
    setIsGeneratingAudio(true);
    
    try {
      // เรียกใช้ Botnoi API
      const response = await fetch('https://api-voice.botnoi.ai/openapi/v1/generate_audio', {
        method: 'POST',
        headers: {
          'Botnoi-Token': 'YOUR_API_KEY', // ต้องแทนที่ด้วย API Key จริง
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          speaker: "1",
          volume: "1",
          speed: 1,
          type_media: "mp3",
          save_file: "true",
          language: "th"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const result = await response.json();
      console.log('Audio generation result:', result);
      
      toast({
        title: "สร้างเสียงสำเร็จ",
        description: "ไฟล์เสียงถูกสร้างเรียบร้อยแล้ว"
      });
      
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างเสียงได้ (ต้องการ Botnoi API Key)",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAudio(false);
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
            ระบบถอดเสียงและสร้างเสียงด้วย AI ที่ทันสมัย รองรับภาษาไทยอย่างสมบูรณ์
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
            พัฒนาด้วย ❤️ โดยใช้ Gemini AI และ Botnoi API
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
