"use client";

import { useEffect } from 'react';

export default function ThemeScript() {
  useEffect(() => {
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    
    if (savedTheme) {
      if (savedTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.classList.add(systemTheme);
      } else {
        document.documentElement.classList.add(savedTheme);
      }
    } else {
      // Default to system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(systemTheme);
    }
  }, []);

  return null;
}
