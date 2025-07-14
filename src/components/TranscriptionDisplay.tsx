
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Copy, Volume2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranscriptionDisplayProps {
  transcription: string;
  isLoading: boolean;
  onTextToSpeech: (text: string) => void;
  isGeneratingAudio: boolean;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  transcription,
  isLoading,
  onTextToSpeech,
  isGeneratingAudio
}) => {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      toast({
        title: "คัดลอกแล้ว",
        description: "ข้อความถูกคัดลอกไปยังคลิปบอร์ดแล้ว"
      });
    } catch (err) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกข้อความได้",
        variant: "destructive"
      });
    }
  };

  const handleTextToSpeech = () => {
    if (transcription.trim()) {
      onTextToSpeech(transcription);
    }
  };

  return (
    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="w-5 h-5" />
          ผลการถอดเสียงเป็นข้อความ
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white/70" />
              <p className="text-white/90">กำลังถอดเสียงเป็นข้อความ...</p>
              <p className="text-white/60 text-sm mt-2">กรุณารอสักครู่</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={transcription}
              placeholder="ผลการถอดเสียงจะแสดงที่นี่..."
              readOnly
              className="min-h-[200px] bg-white/10 border-white/30 text-white placeholder:text-white/50 resize-none"
            />
            
            {transcription && (
              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  คัดลอกข้อความ
                </Button>
                <Button
                  onClick={handleTextToSpeech}
                  disabled={isGeneratingAudio}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  {isGeneratingAudio ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังสร้างเสียง...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      แปลงข้อความเป็นเสียง
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptionDisplay;
