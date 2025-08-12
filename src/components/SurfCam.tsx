"use client";

import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FREE_TIER_DURATION_SECONDS = 60;

export default function SurfCam() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(FREE_TIER_DURATION_SECONDS);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (user?.accessType === "free") {
      setIsBlocked(false);
      setTimeLeft(FREE_TIER_DURATION_SECONDS);

      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setIsBlocked(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user]);

  const twitchParent = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow lg:w-3/4 relative">
              <div className="aspect-video w-full relative rounded-xl overflow-hidden shadow-2xl shadow-primary/20">
                <iframe
                  src={`https://player.twitch.tv/?channel=elsurfo&parent=${twitchParent}&muted=true&autoplay=true`}
                  frameBorder="0"
                  allowFullScreen={true}
                  scrolling="no"
                  className="w-full h-full"
                  title="La Lora Surf Cam - Video"
                ></iframe>
                {isBlocked && (
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-lg flex flex-col items-center justify-center z-10 p-4 text-center animate-in fade-in">
                    <h2 className="text-2xl font-bold font-headline mb-2">Tiempo de prueba terminado</h2>
                    <p className="mb-4 max-w-sm">
                      Para continuar viendo las olas sin interrupciones, considera apoyar el proyecto.
                    </p>
                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Ver Planes Premium</Button>
                  </div>
                )}
                 {user?.accessType === "free" && !isBlocked && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-sm px-3 py-1 rounded-full z-20">
                    Tiempo restante: {timeLeft}s
                  </div>
                )}
              </div>
            </div>
            <div className="lg:w-1/4">
               <Card className="h-[calc(100vh-12rem)] min-h-[400px] shadow-lg">
                <CardContent className="p-0 h-full">
                    <iframe
                        src={`https://www.twitch.tv/embed/elsurfo/chat?parent=${twitchParent}&darkpopout`}
                        className="w-full h-full rounded-lg"
                        title="La Lora Surf Cam - Chat"
                    ></iframe>
                </CardContent>
               </Card>
            </div>
          </div>

          <footer className="text-center mt-12 py-6 border-t">
            <p className="text-sm text-muted-foreground">
              Un agradecimiento especial a{' '}
              <a
                href="https://seataya.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                Seataya Luxury Villas
              </a>
              {' '}por brindarnos esta increíble vista a las olas.
            </p>
             <p className="text-xs text-muted-foreground mt-1">¿Buscas dónde quedarte?{' '}
                <a href="https://seataya.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                    ¡Visita Seataya!
                </a>
             </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
