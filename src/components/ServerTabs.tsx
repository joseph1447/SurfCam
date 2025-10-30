"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tv, Youtube, Monitor, Play } from "lucide-react";

interface ServerTabsProps {
  currentServer: 'youtube' | 'twitch';
  onServerChange: (server: 'youtube' | 'twitch') => void;
}

export default function ServerTabs({ currentServer, onServerChange }: ServerTabsProps) {
  return (
    <div className="mb-4">
      <Card className="bg-gradient-to-r from-red-600/10 to-purple-600/10 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1 w-full max-w-md">
              {/* Twitch Tab - Left, default selected externally */}
              <Button
                variant={currentServer === 'twitch' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onServerChange('twitch')}
                className={`flex-1 flex items-center gap-2 ${
                  currentServer === 'twitch' 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm' 
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Tv className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Twitch HD & Replays</span>
                <span className="font-medium sm:hidden">Twitch HD</span>
              </Button>

              {/* YouTube Tab - Right */}
              <Button
                variant={currentServer === 'youtube' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onServerChange('youtube')}
                className={`flex-1 flex items-center gap-2 ${
                  currentServer === 'youtube' 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm' 
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Youtube className="w-4 h-4" />
                <span className="font-medium">YouTube</span>
              </Button>
            </div>
          </div>
          
          {/* Server Info */}
          <div className="mt-3 text-center">
            {currentServer === 'youtube' ? (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Monitor className="w-4 h-4 text-red-600" />
                <span>Calidad estándar • Acceso universal • Overlays publicitarios</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Play className="w-4 h-4 text-purple-600" />
                <span>Calidad HD máxima • Chat interactivo • Replays y clips</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
