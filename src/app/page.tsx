"use client";

import Login from '@/components/Login';
import SurfCam from '@/components/SurfCam';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomePage() {
  const { user, login } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  useEffect(() => {
    if (!user && email) {
      login(email, '');
    }
  }, [user, email, login]);

  return (
    <>
      <main className="min-h-screen bg-background text-foreground transition-all duration-500 animate-in fade-in">
        {user ? <SurfCam /> : <Login />}
      </main>
    </>
  );
}
