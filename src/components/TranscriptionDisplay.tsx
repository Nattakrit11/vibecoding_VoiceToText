
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
    <Card className="bg-card/80 border-border backdrop-blur-md shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="w-5 h-5" />
          {t('transcriptionTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-foreground">{t('processing')}</p>
              <p className="text-muted-foreground text-sm mt-2">{t('pleaseWait')}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sections && sections.length > 0 ? (
              <div className="space-y-4">
                {sections.map((section, index) => {
                  if (section.type === 'generated') {
                    return (
                      <div key={index} className="bg-primary/10 border-l-4 border-primary p-3 rounded-md">
                        <p className="text-sm font-medium text-foreground">
                          Transcription Generated: {section.content}
                        </p>
                      </div>
                    );
                  } else if (section.type === 'transcription') {
                    return (
                      <div key={index} className="bg-accent/50 border-l-4 border-primary p-4 rounded-md">
                        <h3 className="font-bold text-foreground mb-2">TRANSCRIPTION</h3>
                        <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {section.content}
                        </div>
                      </div>
                    );
                  } else if (section.type === 'summary') {
                    return (
                      <div key={index} className="bg-secondary/50 border-l-4 border-ring p-4 rounded-md">
                        <h3 className="font-bold text-foreground mb-3">SUMMARY</h3>
                        <div className="space-y-2">
                          <div className="bg-destructive/10 p-2 rounded border-l-2 border-destructive">
                            <span className="font-semibold text-foreground">Pain: </span>
                            <span className="text-foreground">{section.pain}</span>
                          </div>
                          <div className="bg-primary/10 p-2 rounded border-l-2 border-primary">
                            <span className="font-semibold text-foreground">Gain: </span>
                            <span className="text-foreground">{section.gain}</span>
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
                className="min-h-[200px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            )}
            
            {transcriptionContent && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="bg-card/50 border-border text-foreground hover:bg-accent"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {t('copyText')}
                </Button>
                
                <Button
                  onClick={handleDownloadText}
                  variant="outline"
                  className="bg-card/50 border-border text-foreground hover:bg-accent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('downloadText')}
                </Button>
                
                {!isGeneratingAudio ? (
                  <Button
                    onClick={handleTextToSpeech}
                    className="col-span-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {t('textToSpeech')}
                  </Button>
                ) : (
                  <Button
                    onClick={onStopTextToSpeech}
                    className="col-span-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
