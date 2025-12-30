'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Lock } from 'lucide-react';

interface Message {
  _id: string;
  group: string;
  userId: string;
  username: string;
  text: string;
  timestamp: Date;
}

interface ChatWindowProps {
  group: string;
  userGroups: string[];
  userId: string;
  username: string;
}

export default function ChatWindow({ group, userGroups, userId, username }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canAccess = userGroups.includes(group);

  useEffect(() => {
    if (!canAccess) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?group=${group}`);
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [group, canAccess]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !canAccess) return;

    setLoading(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group, userId, username, text: newMessage }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages([...messages, newMsg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canAccess) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-glow backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-8">
        <div className="text-center space-y-4">
          <Lock className="w-12 h-12 mx-auto text-orange-500/60" />
          <h3 className="text-lg font-headline font-semibold text-foreground">Access Restricted</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            You don't have access to this group chat. Contact support to join "{group}".
          </p>
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold">
            Request Access
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(210,50%,8%)] rounded-2xl border border-cyan-500/20 overflow-hidden shadow-xl shadow-cyan-500/10">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-2xl shadow-lg ${
                  msg.userId === userId
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-none'
                    : 'bg-[hsl(215,25%,20%)] text-foreground border border-cyan-500/30 rounded-bl-none'
                }`}
              >
                {msg.userId !== userId && (
                  <p className="text-xs text-cyan-400 font-semibold mb-1">{msg.username}</p>
                )}
                <p className="text-sm break-words">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.userId === userId ? 'text-blue-100/60' : 'text-muted-foreground'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-cyan-500/20 p-4 bg-[hsl(215,30%,10%)] backdrop-blur-sm">
        <div className="flex gap-3">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={loading}
            className="bg-[hsl(215,25%,15%)] border-cyan-500/30 text-foreground placeholder:text-muted-foreground focus:border-cyan-500/60 focus:ring-cyan-500/20 rounded-lg"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !newMessage.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
