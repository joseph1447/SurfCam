"use client";
import SurfCamTwitch from "@/components/SurfCamTwitch";

export default function HomeClient() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-all duration-500 animate-in fade-in">
      <SurfCamTwitch />
    </main>
  );
}
