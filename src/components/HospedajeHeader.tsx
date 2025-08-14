"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Waves, Crown } from "lucide-react";

export default function HospedajeHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Waves className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Santa Teresa Surf Cam</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link href="/contacto">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" size="sm">
              <Crown className="h-4 w-4 mr-2" />
              Adquirir Plan Premium
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
