
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
      <Button
        onClick={toggleLanguage}
        variant="outline"
        size="sm"
        className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
      >
        <Globe className="w-4 h-4 mr-2" />
        {language.toUpperCase()}
      </Button>
      
      <Button
        onClick={toggleTheme}
        variant="outline"
        size="sm"
        className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default Header;
