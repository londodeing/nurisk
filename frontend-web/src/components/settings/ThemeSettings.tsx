'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeSettings() {
  const [theme, setTheme] = useState<Theme>('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) setTheme(saved);
    setIsLoading(false);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const themes = [
    { id: 'light', label: 'Terang', icon: Sun, description: 'Tampilan terang' },
    { id: 'dark', label: 'Gelap', icon: Moon, description: 'Tampilan gelap' },
    { id: 'system', label: 'Sistem', icon: Monitor, description: 'Ikuti pengaturan perangkat' },
  ] as const;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-nu-green" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tampilan</CardTitle>
        <CardDescription>Pilih tema tampilan aplikasi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                theme === t.id 
                  ? 'border-nu-green bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <t.icon className={`h-6 w-6 mb-2 ${theme === t.id ? 'text-nu-green' : 'text-gray-500'}`} />
              <span className="font-medium">{t.label}</span>
              <span className="text-xs text-gray-500">{t.description}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}