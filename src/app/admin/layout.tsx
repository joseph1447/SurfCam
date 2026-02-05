import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from "@/components/ui/toaster";
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Administración | Santa Teresa Surf Cam',
  description: 'Panel de administración para Santa Teresa Surf Cam',
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans antialiased">
        {children}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
