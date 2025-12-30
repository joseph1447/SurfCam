"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppHeader() {
  const { resolvedTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-[hsl(210,50%,6%)]/95 via-[hsl(200,100%,50%)]/10 to-[hsl(210,50%,6%)]/95 border-b border-cyan-500/20 shadow-lg shadow-cyan-500/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Brand Name */}
          <button
            onClick={toggleMobileMenu}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
                <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
                <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
              </svg>
            </div>
            <span className="text-xl font-headline font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent hidden sm:inline-block">
              Santa Teresa Surf Cam
            </span>
            <span className="text-lg font-headline font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent sm:hidden">
              SurfCam
            </span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/surf-lessons">
              <Button variant="ghost" className="text-sm text-foreground/80 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 font-medium">
                Clases de Surf
              </Button>
            </Link>
            <Link href="/hospedaje">
              <Button variant="ghost" className="text-sm text-foreground/80 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 font-medium">
                Hospedaje
              </Button>
            </Link>
            <Link href="/restaurantes">
              <Button variant="ghost" className="text-sm text-foreground/80 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 font-medium">
                Restaurantes
              </Button>
            </Link>
            <Link href="/contacto">
              <Button variant="ghost" className="text-sm text-foreground/80 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 font-medium">
                Contacto
              </Button>
            </Link>
            <div className="ml-4 pl-4 border-l border-cyan-500/20">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              size="sm"
              className="p-2 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-cyan-500/20 pt-4 space-y-2 animate-in fade-in-up duration-300">
            <Link href="/surf-lessons">
              <Button variant="ghost" className="w-full justify-start text-left text-foreground/80 hover:text-cyan-400 hover:bg-cyan-500/10">
                🏄‍♂️ Clases de Surf
              </Button>
            </Link>
            <Link href="/hospedaje">
              <Button variant="ghost" className="w-full justify-start text-left text-foreground/80 hover:text-cyan-400 hover:bg-cyan-500/10">
                🏨 Hospedaje
              </Button>
            </Link>
            <Link href="/restaurantes">
              <Button variant="ghost" className="w-full justify-start text-left text-foreground/80 hover:text-cyan-400 hover:bg-cyan-500/10">
                🍽️ Restaurantes
              </Button>
            </Link>
            <Link href="/contacto">
              <Button variant="ghost" className="w-full justify-start text-left text-foreground/80 hover:text-cyan-400 hover:bg-cyan-500/10">
                📧 Contacto
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
