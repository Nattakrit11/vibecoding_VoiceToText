
import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileAudio, X, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  uploadedFile?: File | null;
}

const AudioUpload: React.FC<AudioUploadProps> = ({ onFileUpload, isProcessing, uploadedFile }) => {
  const [dragActive, setDragActive] = useState(false);
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

    // Auto-process the file immediately
    onFileUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="bg-card/80 border-border backdrop-blur-md shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileAudio className="w-5 h-5" />
          อัพโหลดไฟล์เสียง
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isProcessing ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-foreground">กำลังประมวลผล...</p>
              <p className="text-muted-foreground text-sm mt-2">กรุณารอสักครู่</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-foreground mb-2">ลากไฟล์เสียงมาวางที่นี่</p>
              <p className="text-muted-foreground text-sm mb-4">หรือคลิกเพื่อเลือกไฟล์ (จะดำเนินการถอดเสียงทันที)</p>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileInput}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer transition-colors"
              >
                เลือกไฟล์เสียง
              </label>
              <p className="text-muted-foreground text-xs mt-2">
                รองรับไฟล์เสียงทุกประเภท (ขนาดไม่เกิน 10MB)
              </p>
            </div>

            {uploadedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-green-600">
                    {formatFileSize(uploadedFile.size)} • อัพโหลดสำเร็จ
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioUpload;
