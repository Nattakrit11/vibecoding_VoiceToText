
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Copy, Volume2, Loader2, Square, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranscriptionDisplayProps {
  transcription: string;
  transcriptionContent: string;
  isLoading: boolean;
  onTextToSpeech: (text: string) => void;
  onStopTextToSpeech: () => void;
  onDownloadText: (text: string) => void;
  isGeneratingAudio: boolean;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  transcription,
  transcriptionContent,
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
      await navigator.clipboard.writeText(transcriptionContent);
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
    if (transcriptionContent.trim()) {
      onTextToSpeech(transcriptionContent);
    }
  };

  const handleDownloadText = () => {
    if (transcriptionContent.trim()) {
      onDownloadText(transcriptionContent);
    }
  };

  // Function to parse and display transcription sections
  const parseTranscription = (text: string) => {
    if (!text) return null;
    
    const sections = [];
    
    // Extract Transcription Generated
    const generatedMatch = text.match(/Transcription Generated:\s*(.+)/);
    if (generatedMatch) {
      sections.push({
        type: 'generated',
        content: generatedMatch[1].trim()
      });
    }
    
    // Extract TRANSCRIPTION content
    const transcriptionMatch = text.match(/TRANSCRIPTION:\s*\n([\s\S]*?)(?=\n\s*SUMMARY:|$)/);
    if (transcriptionMatch) {
      sections.push({
        type: 'transcription',
        content: transcriptionMatch[1].trim()
      });
    }
    
    // Extract SUMMARY content
    const summaryMatch = text.match(/SUMMARY:\s*\n([\s\S]*)/);
    if (summaryMatch) {
      const summaryContent = summaryMatch[1].trim();
      const painMatch = summaryContent.match(/Pain:\s*(.+)/);
      const gainMatch = summaryContent.match(/Gain:\s*(.+)/);
      
      sections.push({
        type: 'summary',
        pain: painMatch ? painMatch[1].trim() : '',
        gain: gainMatch ? gainMatch[1].trim() : ''
      });
    }
    
    return sections;
  };

  const sections = parseTranscription(transcription);

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
            {sections && sections.length > 0 ? (
              <div className="space-y-4">
                {sections.map((section, index) => {
                  if (section.type === 'generated') {
                    return (
                      <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                        <p className="text-sm font-medium text-yellow-800">
                          Transcription Generated: {section.content}
                        </p>
                      </div>
                    );
                  } else if (section.type === 'transcription') {
                    return (
                      <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                        <h3 className="font-bold text-blue-800 mb-2">TRANSCRIPTION</h3>
                        <div className="text-blue-900 leading-relaxed whitespace-pre-wrap">
                          {section.content}
                        </div>
                      </div>
                    );
                  } else if (section.type === 'summary') {
                    return (
                      <div key={index} className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                        <h3 className="font-bold text-green-800 mb-3">SUMMARY</h3>
                        <div className="space-y-2">
                          <div className="bg-red-50 p-2 rounded border-l-2 border-red-300">
                            <span className="font-semibold text-red-800">Pain: </span>
                            <span className="text-red-700">{section.pain}</span>
                          </div>
                          <div className="bg-green-100 p-2 rounded border-l-2 border-green-300">
                            <span className="font-semibold text-green-800">Gain: </span>
                            <span className="text-green-700">{section.gain}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ) : (
              <Textarea
                value=""
                placeholder={t('transcriptionPlaceholder')}
                readOnly
                className="min-h-[200px] bg-white/10 border-white/30 text-white placeholder:text-white/50 resize-none"
              />
            )}
            
            {transcriptionContent && (
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
