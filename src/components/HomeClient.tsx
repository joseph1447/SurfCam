"use client";
import { useAuth } from "@/context/AuthContext";
import SurfCam from "@/components/SurfCam";
import Login from "@/components/Login";

export default function HomeClient() {
  const { user } = useAuth();
  return (
    <main className="min-h-screen bg-background text-foreground transition-all duration-500 animate-in fade-in">
      {user ? <SurfCam /> : <Login />}
    </main>
  );
}
