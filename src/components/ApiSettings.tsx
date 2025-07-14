
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Key, Save, AlertCircle } from 'lucide-react';

interface ApiSettingsProps {
  onApiKeyChange: (apiKey: string) => void;
  apiKey: string;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({ onApiKeyChange, apiKey }) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onApiKeyChange(tempApiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Key className="w-5 h-5" />
          การตั้งค่า API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gemini-api" className="text-white/90">
            Gemini API Key
          </Label>
          <Input
            id="gemini-api"
            type="password"
            placeholder="ใส่ Gemini API Key ของคุณ"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <AlertCircle className="w-4 h-4" />
          API Key จะถูกเก็บไว้ในเครื่องของคุณเท่านั้น
        </div>
        <Button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
        >
          <Save className="w-4 h-4 mr-2" />
          {saved ? 'บันทึกแล้ว!' : 'บันทึก API Key'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApiSettings;
