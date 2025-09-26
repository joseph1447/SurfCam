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
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Clickable for mobile menu */}
          <button
            onClick={toggleMobileMenu}
            className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
              <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
              <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
            </svg>
            <span>Santa Teresa Surf Cam</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/surf-lessons">
              <Button variant="ghost" className="text-sm">
                Clases de Surf
              </Button>
            </Link>
            <Link href="/hospedaje">
              <Button variant="ghost" className="text-sm">
                Hospedaje
              </Button>
            </Link>
            <Link href="/restaurantes">
              <Button variant="ghost" className="text-sm">
                Restaurantes
              </Button>
            </Link>
            <Link href="/contacto">
              <Button variant="ghost" className="text-sm">
                Contacto
              </Button>
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4">
            <div className="flex flex-col space-y-2">
              <Link href="/surf-lessons">
                <Button variant="ghost" className="w-full justify-start text-left">
                  🏄‍♂️ Clases de Surf
                </Button>
              </Link>
              <Link href="/hospedaje">
                <Button variant="ghost" className="w-full justify-start text-left">
                  🏠 Hospedaje
                </Button>
              </Link>
              <Link href="/restaurantes">
                <Button variant="ghost" className="w-full justify-start text-left">
                  🍽️ Restaurantes
                </Button>
              </Link>
              <Link href="/contacto">
                <Button variant="ghost" className="w-full justify-start text-left">
                  📞 Contacto
                </Button>
              </Link>
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tema:</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
