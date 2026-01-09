"use client";
import SurfCamTwitch from "@/components/SurfCamTwitch";
import SpaceBackground from "@/components/SpaceBackground";

export default function HomeClient() {
  return (
    <main className="flex-1 relative text-foreground transition-all duration-500 animate-in fade-in min-h-screen">
      <SpaceBackground />
      <div className="relative z-[1]">
        <SurfCamTwitch />
      </div>
    </main>
  );
}
