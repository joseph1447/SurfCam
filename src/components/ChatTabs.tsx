'use client';

import { useState } from 'react';
import ChatWindow from './ChatWindow';

interface ChatTabsProps {
  userId: string;
  username: string;
  userGroups: string[];
}

export default function ChatTabs({ userId, username, userGroups }: ChatTabsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'eltrillo'>('general');

  const tabs = [
    { id: 'general' as const, label: 'General Chat', icon: '💬', locked: false },
    { id: 'eltrillo' as const, label: 'El Trillo', icon: '🎉', locked: !userGroups.includes('eltrillo') },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-background via-[hsl(215,25%,8%)] to-background rounded-xl overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-cyan-500/20 bg-[hsl(215,30%,10%)]/50 backdrop-blur-sm px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-all duration-300 relative group ${
              activeTab === tab.id
                ? 'text-cyan-400'
                : 'text-muted-foreground hover:text-cyan-300/80'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.locked && (
              <span className="text-xs bg-orange-500/30 text-orange-400 px-2 py-0.5 rounded-full">
                Locked
              </span>
            )}
            
            {/* Animated underline */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <ChatWindow
          group={activeTab}
          userGroups={userGroups}
          userId={userId}
          username={username}
        />
      </div>
    </div>
  );
}
