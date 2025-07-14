
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
            <Textarea
              value={transcription}
              placeholder={t('transcriptionPlaceholder')}
              readOnly
              className="min-h-[200px] bg-white/10 border-white/30 text-white placeholder:text-white/50 resize-none"
            />
            
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
