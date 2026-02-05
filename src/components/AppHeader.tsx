"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Menu, X } from "lucide-react";
import dynamic from "next/dynamic";

const AnimatedLogo = dynamic(() => import("./AnimatedLogo"), {
  ssr: false,
  loading: () => <div style={{ width: '400px', height: '100px' }} />,
});

export default function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090A0E]/95 border-b border-white/10 shadow-lg shadow-black/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 3D Animated Logo */}
          {mounted && <AnimatedLogo />}

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
