"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Menu, X } from "lucide-react";

export default function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090A0E]/95 border-b border-white/10 shadow-lg shadow-black/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Brand Name */}
          <button
            onClick={toggleMobileMenu}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#3366BB] to-[#2A5599] rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
                <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
                <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
              </svg>
            </div>
            <span className="text-xl font-headline font-bold text-white hidden sm:inline-block">
              Santa Teresa Surf Cam
            </span>
            <span className="text-lg font-headline font-bold text-white sm:hidden">
              SurfCam
            </span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/Aiservices">
              <Button variant="ghost" className="text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300 font-medium">
                AI Services
              </Button>
            </Link>
            <Link href="/surf-lessons">
              <Button variant="ghost" className="text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300 font-medium">
                Clases de Surf
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              size="sm"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4 space-y-2 animate-in fade-in-up duration-300">
            <Link href="/Aiservices">
              <Button variant="ghost" className="w-full justify-start text-left text-white/70 hover:text-white hover:bg-white/5">
                AI Services
              </Button>
            </Link>
            <Link href="/surf-lessons">
              <Button variant="ghost" className="w-full justify-start text-left text-white/70 hover:text-white hover:bg-white/5">
                Clases de Surf
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
