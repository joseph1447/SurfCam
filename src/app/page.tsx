"use client";

import Login from '@/components/Login';
import SurfCam from '@/components/SurfCam';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-background text-foreground transition-all duration-500 animate-in fade-in">
      {user ? <SurfCam /> : <Login />}
    </main>
  );
}
