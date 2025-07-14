
import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileAudio, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

const AudioUpload: React.FC<AudioUploadProps> = ({ onFileUpload, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาเลือกไฟล์เสียงเท่านั้น",
        variant: "destructive"
      });
      return;
    }

    // ตรวจสอบขนาดไฟล์ (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "ไฟล์ใหญ่เกินไป",
        description: "ขนาดไฟล์ต้องไม่เกิน 10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleProcess = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileAudio className="w-5 h-5" />
          อัพโหลดไฟล์เสียง
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-blue-400 bg-blue-400/10'
                : 'border-white/30 hover:border-white/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-white/70" />
            <p className="text-white/90 mb-2">ลากไฟล์เสียงมาวางที่นี่</p>
            <p className="text-white/60 text-sm mb-4">หรือคลิกเพื่อเลือกไฟล์</p>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileInput}
              className="hidden"
              id="audio-upload"
            />
            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
            >
              <label htmlFor="audio-upload" className="cursor-pointer">
                เลือกไฟล์เสียง
              </label>
            </Button>
            <p className="text-white/50 text-xs mt-2">
              รองรับไฟล์เสียงทุกประเภท (ขนาดไม่เกิน 10MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-3">
                <FileAudio className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-white/60 text-sm">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังประมวลผล...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  เริ่มถอดเสียงเป็นข้อความ
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioUpload;
