"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Waves } from "lucide-react";

export default function SimpleHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Waves className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">La Lora Surf Cam</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
