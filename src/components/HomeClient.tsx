"use client";
import SurfCamTwitch from "@/components/SurfCamTwitch";

export default function HomeClient() {
  return (
    <main className="flex-1 relative text-foreground transition-all duration-500 animate-in fade-in min-h-screen">
      <SurfCamTwitch />
    </main>
  );
}
