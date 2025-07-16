
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, AlertCircle } from 'lucide-react';

interface ApiSettingsProps {
  onApiKeyChange: (apiKey: string) => void;
  apiKey: string;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({ onApiKeyChange, apiKey }) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  // Auto-save API key when it changes
  useEffect(() => {
    if (tempApiKey !== apiKey && tempApiKey.trim().length > 0) {
      const timeout = setTimeout(() => {
        onApiKeyChange(tempApiKey);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeout);
    }
  }, [tempApiKey, apiKey, onApiKeyChange]);

  return (
    <Card className="bg-card/80 border-border backdrop-blur-md shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Key className="w-5 h-5" />
          การตั้งค่า API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gemini-api" className="text-foreground">
            Gemini API Key
          </Label>
          <Input
            id="gemini-api"
            type="password"
            placeholder="ใส่ Gemini API Key ของคุณ"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          API Key จะถูกเก็บไว้ในเครื่องของคุณเท่านั้น และบันทึกอัตโนมัติ
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiSettings;
