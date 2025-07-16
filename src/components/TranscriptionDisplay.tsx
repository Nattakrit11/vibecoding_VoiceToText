
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Copy, Volume2, Loader2, Square, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranscriptionDisplayProps {
  transcription: string;
  isLoading: boolean;
  onTextToSpeech: (text: string) => void;
  onStopTextToSpeech: () => void;
  onDownloadText: (text: string) => void;
  isGeneratingAudio: boolean;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  transcription,
  isLoading,
  onTextToSpeech,
  onStopTextToSpeech,
  onDownloadText,
  isGeneratingAudio
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      toast({
        title: t('apiKeySaved'),
        description: t('copyText')
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Cannot copy text",
        variant: "destructive"
      });
    }
  };

  const handleTextToSpeech = () => {
    if (transcription.trim()) {
      onTextToSpeech(transcription);
    }
  };

  const handleDownloadText = () => {
    if (transcription.trim()) {
      onDownloadText(transcription);
    }
  };

  // Function to format transcription text with better styling
  const formatTranscription = (text: string) => {
    if (!text) return text;
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('Transcription Generated:')) {
        return (
          <div key={index} className="text-yellow-300 font-semibold mb-4 text-sm">
            {line}
          </div>
        );
      } else if (line === 'TRANSCRIPTION:') {
        return (
          <div key={index} className="text-blue-300 font-bold text-lg mb-2 mt-4">
            {line}
          </div>
        );
      } else if (line === 'SUMMARY:') {
        return (
          <div key={index} className="text-green-300 font-bold text-lg mb-2 mt-4">
            {line}
          </div>
        );
      } else if (line.startsWith('Pain:')) {
        return (
          <div key={index} className="text-red-300 ml-2 mb-1">
            <span className="font-semibold">Pain:</span> {line.substring(5)}
          </div>
        );
      } else if (line.startsWith('Gain:')) {
        return (
          <div key={index} className="text-green-300 ml-2 mb-1">
            <span className="font-semibold">Gain:</span> {line.substring(5)}
          </div>
        );
      } else if (line.trim()) {
        return (
          <div key={index} className="text-white/90 mb-1 leading-relaxed">
            {line}
          </div>
        );
      }
      return <div key={index} className="mb-1"></div>;
    });
  };

  return (
    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="w-5 h-5" />
          {t('transcriptionTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white/70" />
              <p className="text-white/90">{t('processing')}</p>
              <p className="text-white/60 text-sm mt-2">{t('pleaseWait')}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {transcription ? (
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                {formatTranscription(transcription)}
              </div>
            ) : (
              <Textarea
                value=""
                placeholder={t('transcriptionPlaceholder')}
                readOnly
                className="min-h-[200px] bg-white/10 border-white/30 text-white placeholder:text-white/50 resize-none"
              />
            )}
            
            {transcription && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {t('copyText')}
                </Button>
                
                <Button
                  onClick={handleDownloadText}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('downloadText')}
                </Button>
                
                {!isGeneratingAudio ? (
                  <Button
                    onClick={handleTextToSpeech}
                    className="col-span-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {t('textToSpeech')}
                  </Button>
                ) : (
                  <Button
                    onClick={onStopTextToSpeech}
                    className="col-span-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    {t('stopSpeech')}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptionDisplay;
