"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Hotel, Utensils, Waves } from "lucide-react";

const SurfboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M2.3 14.7c-1.3 1.3-1.3 3.4 0 4.7s3.4 1.3 4.7 0l2.8-2.8-4.7-4.7-2.8 2.8z" />
        <path d="M12.2 4.2 18 10l3.8-3.8c1.3-1.3 1.3-3.4 0-4.7s-3.4-1.3-4.7 0L12.2 4.2z" />
        <path d="m5.2 9.2 4-4" />
        <path d="m14.2 18.2 4-4" />
        <path d="m7.2 12.2 4.5 4.5" />
    </svg>
);


export default function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Waves className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold font-headline text-primary">
            Santa Teresa Surf Cam
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a
            href="#"
            className="flex items-center gap-2 transition-colors hover:text-primary"
          >
            <SurfboardIcon className="h-4 w-4" />
            Clases de Surf
          </a>
          <a
            href="#"
            className="flex items-center gap-2 transition-colors hover:text-primary"
          >
            <Hotel className="h-4 w-4" />
            Hospedaje
          </a>
          <a
            href="#"
            className="flex items-center gap-2 transition-colors hover:text-primary"
          >
            <Utensils className="h-4 w-4" />
            Restaurantes
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-sm text-right hidden sm:block">
            <p className="font-semibold">{user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.accessType} Access</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Cerrar sesión">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
