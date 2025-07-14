
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, FileAudio, FileText, Trash2, Clock, X } from 'lucide-react';

export interface HistoryItem {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  transcription: string;
  timestamp: Date;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onDeleteItem: (itemId: string) => void;
  onSelectItem: (item: HistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onClearHistory,
  onDeleteItem,
  onSelectItem
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleItemClick = (item: HistoryItem, event: React.MouseEvent) => {
    // ถ้าคลิกที่ปุ่มลบ ไม่ให้เลือกรายการ
    if ((event.target as HTMLElement).closest('.delete-button')) {
      return;
    }
    onSelectItem(item);
  };

  const handleDeleteClick = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteItem(itemId);
  };

  return (
    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <History className="w-5 h-5" />
            ประวัติการใช้งาน
          </CardTitle>
          {history.length > 0 && (
            <Button
              onClick={onClearHistory}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 mx-auto mb-4 text-white/50" />
            <p className="text-white/70">ยังไม่มีประวัติการใช้งาน</p>
            <p className="text-white/50 text-sm mt-1">
              เริ่มต้นโดยการอัพโหลดไฟล์เสียง
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-all duration-200 cursor-pointer relative"
                  onClick={(e) => handleItemClick(item, e)}
                >
                  <Button
                    onClick={(e) => handleDeleteClick(item.id, e)}
                    variant="ghost"
                    size="sm"
                    className="delete-button absolute top-2 right-2 text-white/50 hover:text-red-400 hover:bg-red-500/20 w-8 h-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-start gap-3 pr-8">
                    <FileAudio className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium truncate">
                          {item.fileName}
                        </p>
                        <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
                          {item.fileType}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/60 mb-2">
                        <span>{item.fileSize}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.timestamp)}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-white/80 text-sm line-clamp-2">
                          {item.transcription || 'ไม่มีข้อความ'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryPanel;
