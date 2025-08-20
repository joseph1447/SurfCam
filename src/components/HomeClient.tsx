"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import SurfCam from "@/components/SurfCam";
import Login from "@/components/Login";

function getEmailFromUrl() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("email");
}

export default function HomeClient() {
  const { user, login } = useAuth();

  useEffect(() => {
    if (!user) {
      const email = getEmailFromUrl();
      if (email) {
        login(email, "");
      }
    }
  }, [user, login]);

  return (
    <main className="min-h-screen bg-background text-foreground transition-all duration-500 animate-in fade-in">
      {user ? <SurfCam /> : <Login />}
    </main>
  );
}
