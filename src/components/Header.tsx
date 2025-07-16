
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Sun, Moon, Palette } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('light-blue');
    } else {
      setTheme('dark');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'light-blue':
        return <Palette className="w-4 h-4" />;
      default:
        return <Moon className="w-4 h-4" />;
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
      <Button
        onClick={toggleLanguage}
        variant="outline"
        size="sm"
        className="bg-card/80 border-border text-foreground hover:bg-accent backdrop-blur-md"
      >
        <Globe className="w-4 h-4 mr-2" />
        {language.toUpperCase()}
      </Button>
      
      <Button
        onClick={toggleTheme}
        variant="outline"
        size="sm"
        className="bg-card/80 border-border text-foreground hover:bg-accent backdrop-blur-md"
      >
        {getThemeIcon()}
      </Button>
    </div>
  );
};

export default Header;
