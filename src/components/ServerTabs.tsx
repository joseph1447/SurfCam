"use client";

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
      <Card className="bg-[#121419]/80 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="flex bg-white/5 rounded-lg p-1 w-full max-w-md">
              {/* YouTube Tab - Left, default */}
              <Button
                variant={currentServer === 'youtube' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onServerChange('youtube')}
                className={`flex-1 flex items-center gap-2 ${
                  currentServer === 'youtube'
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                    : 'hover:bg-white/10 text-white/70'
                }`}
              >
                <Youtube className="w-4 h-4" />
                <span className="font-medium">YouTube</span>
              </Button>

              {/* Twitch Tab - Right */}
              <Button
                variant={currentServer === 'twitch' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onServerChange('twitch')}
                className={`flex-1 flex items-center gap-2 ${
                  currentServer === 'twitch'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                    : 'hover:bg-white/10 text-white/70'
                }`}
              >
                <Tv className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Twitch HD & Replays</span>
                <span className="font-medium sm:hidden">Twitch HD</span>
              </Button>
            </div>
          </div>

          {/* Server Info */}
          <div className="mt-3 text-center">
            {currentServer === 'youtube' ? (
              <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                <Monitor className="w-4 h-4 text-red-500" />
                <span>Standard quality - Universal access - Ad overlays</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                <Play className="w-4 h-4 text-purple-500" />
                <span>Max HD quality - Interactive chat - Replays and clips</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
