"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SOCKET_URL = "https://socket-pbvr.onrender.com";
//const SOCKET_URL = "http://localhost:5000";

type ChatMessage = {
  _id: string;
  userId: string;
  timestamp: string | number;
  [key: string]: any;
};

export default function Chat() {
  const { user } = useAuth();
  const userId = user?._id;
  const [groups, setGroups] = useState<any[]>([{ key: "general", name: "General", protected: false }]);
  const [activeTab, setActiveTab] = useState("general");
  const [messagesMap, setMessagesMap] = useState(new Map<string, any>());
  const [input, setInput] = useState("");
  const [joinedGroups, setJoinedGroups] = useState<string[]>(["general"]);
  const [joining, setJoining] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");
  const [joinError, setJoinError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingGroup, setPendingGroup] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sending, setSending] = useState(false);
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMINUSER || 'josephquesada92@gmail.com';

  // Reaction emojis
  const REACTION_EMOJIS = ["👍", "😂", "❤️", "🙏", "😮", "🤙"];
  const [openReactionFor, setOpenReactionFor] = useState<string | null>(null);

  // Handle reaction click
  const handleReact = useCallback((msgId: string, emoji: string) => {
    if (!userId || !socketRef.current) return;
    // Optimistically update UI
    setMessagesMap((prev) => {
      const newMap = new Map(prev);
      const msg = newMap.get(msgId);
      if (msg) {
        const reactions = msg.reactions || [];
        const userReacted = reactions.some((r: any) => r.emoji === emoji && String(r.userId) === String(userId));
        if (userReacted) {
          msg.reactions = reactions.filter((r: any) => !(r.emoji === emoji && String(r.userId) === String(userId)));
        } else {
          msg.reactions = [...reactions, { emoji, userId }];
        }
        newMap.set(msgId, { ...msg });
      }
      return newMap;
    });
    socketRef.current.emit('messageReaction', { messageId: msgId, emoji, userId });
    setOpenReactionFor(null); // Hide bar after reacting
  }, [userId]);

  // Hide emoji bar on click outside
  useEffect(() => {
    if (!openReactionFor) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.reaction-bar-popover')) {
        setOpenReactionFor(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openReactionFor]);

  // Listen for reaction updates via socket
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    const onReaction = (data: any) => {
      console.log('Received messageReaction socket event', data);
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        const msg = newMap.get(data._id);
        if (msg) {
          msg.reactions = data.reactions;
          newMap.set(data._id, { ...msg });
        }
        return newMap;
      });
    };
    socket.on('messageReaction', onReaction);
    return () => {
      socket.off('messageReaction', onReaction);
    };
  }, [socketRef]);

  // Fetch groups from API
  useEffect(() => {
    fetch("/api/chat/groups/list")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGroups([{ key: "general", name: "General", protected: false }, ...data.groups.map((g: any) => ({ key: g.name, name: g.name, protected: true }))]);
        }
      });
  }, []);

  // --- SOCKET.IO INTEGRATION ---
  useEffect(() => {
    // Connect to socket
    socketRef.current = io(SOCKET_URL, { path: "/socket" });

    // Authenticate (if you have a token)
    // socketRef.current.emit('authenticate', token);
    // socketRef.current.on('authenticated', () => { /* handle success */ });
    // socketRef.current.on('unauthorized', () => { /* handle fail */ });

    // Join group (default to 'general')
    socketRef.current.emit('join', { group: activeTab });

    // Listen for new messages
    socketRef.current.on('message', (msgObj) => {
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(msgObj._id, msgObj);
        return newMap;
      });
    });

    // Listen for message edits
    socketRef.current.on('messageEdited', (msgObj) => {
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        if (newMap.has(msgObj._id)) {
          newMap.set(msgObj._id, { ...newMap.get(msgObj._id), ...msgObj });
        }
        return newMap;
      });
    });

    // Listen for message deletions
    socketRef.current.on('messageDeleted', ({ messageId }) => {
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(messageId);
        return newMap;
      });
    });

    // Listen for message reactions
    socketRef.current.on('messageReaction', ({ _id, reactions }) => {
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        if (newMap.has(_id)) {
          newMap.set(_id, { ...newMap.get(_id), reactions });
        }
        return newMap;
      });
    });

    // Error handling
    socketRef.current.on('messageError', ({ error }) => { console.error('Message error:', error); });
    socketRef.current.on('messageEditError', ({ error }) => { console.error('Edit error:', error); });
    socketRef.current.on('messageDeleteError', ({ error }) => { console.error('Delete error:', error); });
    socketRef.current.on('messageReactionError', ({ error }) => { console.error('Reaction error:', error); });

    // Clean up on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [activeTab]);

  // Helper: check if user is at bottom
  const isAtBottom = () => {
    const el = chatBoxRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 40; // 40px tolerance
  };

  // Listen for scroll to toggle button
  useEffect(() => {
    const el = chatBoxRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowScrollButton(!isAtBottom());
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Show button if new messages arrive and not at bottom
  useEffect(() => {
    if (!isAtBottom()) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  }, [messagesMap]);

  // Scroll to bottom only when sending a message (not on every new message)
  const prevMessagesLength = useRef(messagesMap.size);
  const isInitialLoad = useRef(true);
  
  useEffect(() => {
    // Skip scroll on initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    
    if (messagesMap.size > prevMessagesLength.current) {
      // Only scroll if the last message is from the current user
      const lastMsg = Array.from(messagesMap.values())[messagesMap.size - 1];
      if (lastMsg && lastMsg.userId === userId) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
    prevMessagesLength.current = messagesMap.size;
  }, [messagesMap, userId]);

  // Fetch chat history on tab change (replace, do not merge)
  useEffect(() => {
    if (!user) return;
    fetch(`/api/chat/history?group=${activeTab}`)
      .then((res) => res.json())
      .then((data) => {
        const map = new Map<string, any>();
        (data.messages || []).forEach((m: ChatMessage) => map.set(m._id, m));
        setMessagesMap(map);
      });
  }, [activeTab, user]);

  // Listen for messages
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    const onMessage = (msg: any) => {
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(msg._id, msg);
        return newMap;
      });
    };
    socket.on('message', onMessage);
    return () => {
      socket.off('message', onMessage);
    };
  }, [socketRef.current]);

  // Log messages state on every update
  useEffect(() => {
  }, [messagesMap]);

  const handleSend = () => {
    if (!input.trim() || !user || sending) return;
    if (!userId) return;
    setSending(true);
    const msgObj = {
      group: activeTab,
      userId,
      username: user.username || user.email || "", // Use email if no username
      message: input,
    };
    socketRef.current?.emit('message', msgObj);
    setInput("");
    setTimeout(() => setSending(false), 500); // Prevent rapid double send
  };

  // Password flow: check localStorage for access
  const hasGroupAccess = (groupKey: string) => {
    if (groupKey === "general") return true;
    return localStorage.getItem(`group_access_${groupKey}`) === "true" || joinedGroups.includes(groupKey);
  };

  // When clicking a tab
  const handleTabClick = (group: any) => {
    if (!group.protected || hasGroupAccess(group.key)) {
      setActiveTab(group.key);
    } else {
      setPendingGroup(group.key);
      setShowPasswordModal(true);
      setJoinPassword("");
      setJoinError("");
    }
  };

  // Join group with password
  const handleJoinGroup = async () => {
    setJoining(true);
    setJoinError("");
    if (!pendingGroup) return;
    const res = await fetch("/api/chat/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: pendingGroup, password: joinPassword, userId }),
    });
    const data = await res.json();
    if (data.success) {
      setJoinedGroups((prev) => [...prev, pendingGroup]);
      localStorage.setItem(`group_access_${pendingGroup}`, "true");
      setActiveTab(pendingGroup);
      setShowPasswordModal(false);
      setJoinPassword("");
    } else {
      setJoinError(data.error || "No se pudo unir al grupo");
    }
    setJoining(false);
  };

  // Delete message (admin only, via socket)
  const handleDeleteMessage = (messageId: string) => {
    if (!user || user.email !== ADMIN_EMAIL || !socketRef.current) return;
    console.log('Emitting messageDeleted', { messageId });
    socketRef.current.emit('messageDeleted', { messageId });
  };

  // Listen for messageDeleted event from socket
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    const onMessageDeleted = ({ messageId }) => {
      console.log('Received messageDeleted event', messageId);
      setMessagesMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(messageId);
        return newMap;
      });
    };
    socket.on('messageDeleted', onMessageDeleted);
    return () => {
      socket.off('messageDeleted', onMessageDeleted);
    };
  }, []);

  // Edit message (within 5 min, only author)
  const handleEditMessage = (msg: any) => {
    setEditingId(msg._id);
    setEditInput(msg.message);
  };

  const handleSaveEdit = (msg: any) => {
    if (!editInput.trim() || !user || !socketRef.current) return;
    socketRef.current.emit('messageEdited', {
      messageId: msg._id,
      newMessage: editInput,
    });
    setEditingId(null);
    setEditInput("");
  };

  const canEditMessage = (msg: any) => {
    if (!user || !msg._id || msg.userId !== user._id) return false;
    const now = Date.now();
    const sent = new Date(msg.timestamp).getTime();
    return now - sent < 5 * 60 * 1000; // 5 minutos
  };

  const canAccessTab = (groupKey: string) => {
    if (groupKey === "general") return true;
    return joinedGroups.includes(groupKey);
  };

  // Before rendering messages
  const allMessages = Array.from(messagesMap.values()) as ChatMessage[];
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
  const uniqueMessages = allMessages.filter((m: ChatMessage) => {
    const ts = new Date(m.timestamp).getTime();
    return ts >= startOfDay && ts <= endOfDay;
  });
  uniqueMessages.forEach((m: ChatMessage) => {
    if (!m._id) console.warn('[Chat] Message missing _id:', m);
  });

  return (
    <Card className="mt-8 max-w-2xl mx-auto">
      <CardContent className="p-0">
        <div className="flex border-b overflow-x-auto no-scrollbar">
          {groups.map((g: any) => (
            <button
              key={g.key}
              className={`flex-1 py-2 px-4 text-center font-semibold transition-colors whitespace-nowrap ${activeTab === g.key ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`}
              onClick={() => handleTabClick(g)}
              disabled={g.protected && !hasGroupAccess(g.key)}
            >
              {g.name}
              {g.protected && <span className="ml-1 text-xs text-gray-500">🔒</span>}
            </button>
          ))}
        </div>
        {/* Password modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-bold mb-2">Acceso a grupo protegido</h3>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Contraseña</label>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={e => setJoinPassword(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Contraseña del grupo"
                  disabled={joining}
                />
              </div>
              {joinError && <div className="text-red-500 text-sm mb-2">{joinError}</div>}
              <div className="flex gap-2 mt-4">
                <Button onClick={handleJoinGroup} className="flex-1">Entrar</Button>
                <Button variant="outline" onClick={() => setShowPasswordModal(false)} className="flex-1">Cancelar</Button>
              </div>
            </div>
          </div>
        )}
        <div className="h-80 overflow-y-auto p-4 bg-white relative" ref={chatBoxRef}>
          {groups.find(g => g.key === activeTab)?.protected && !canAccessTab(activeTab) ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h3 className="text-lg font-bold mb-2">Unirse a {groups.find(g => g.key === activeTab)?.name}</h3>
              <input
                type="password"
                placeholder="Contraseña del grupo"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                className="border rounded px-3 py-2 mb-2 w-full max-w-xs"
                disabled={joining}
              />
              <Button onClick={async () => {
                setJoining(true);
                setJoinError("");
                const res = await fetch("/api/chat/groups/join", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ group: activeTab, password: joinPassword, userId }),
                });
                const data = await res.json();
                if (data.success) {
                  setJoinedGroups((prev) => [...prev, activeTab]);
                  localStorage.setItem(`group_access_${activeTab}`, "true");
                  setJoinPassword("");
                  setJoinError("");
                } else {
                  setJoinError(data.error || "No se pudo unir al grupo");
                }
                setJoining(false);
              }} disabled={joining || !joinPassword}>
                {joining ? "Uniendo..." : "Unirse"}
              </Button>
              {joinError && <div className="text-red-500 mt-2">{joinError}</div>}
            </div>
          ) : (
            <>
              {messagesMap.size === 0 ? (
                <div className="text-gray-400 text-center mt-8">No hay mensajes aún.</div>
              ) : (
                uniqueMessages.map((msg: ChatMessage) => {
                  const isOwn = user && msg.userId === user._id;
                  const isEditing = editingId === msg._id;
                  return (
                    <div key={msg._id} className={`mb-2 flex ${isOwn ? 'justify-end' : 'justify-start'}`}> 
                      {isEditing ? (
                        <div className="flex flex-col max-w-xs w-full">
                          <input
                            className="border rounded px-2 py-1 text-sm mb-1"
                            value={editInput}
                            onChange={e => setEditInput(e.target.value)}
                            maxLength={500}
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveEdit(msg)} className="text-green-600 text-xs">Guardar</button>
                            <button onClick={() => { setEditingId(null); setEditInput(""); }} className="text-gray-400 text-xs">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className={`max-w-xs w-full rounded-lg px-4 py-2 shadow-md break-words relative ${isOwn ? 'bg-blue-500 text-white ml-8' : 'bg-gray-200 text-gray-900 mr-8'}`}
                        >
                          {/* Trash icon (top right, only for admin, inside bubble) */}
                          {user && user.email === ADMIN_EMAIL && msg._id && !editingId && (
                            <button
                              onClick={() => handleDeleteMessage(msg._id!)}
                              className="absolute top-2 right-2 p-1 rounded-full bg-white hover:bg-red-100 text-red-500 shadow"
                              title="Eliminar mensaje"
                            >
                              <span role="img" aria-label="Eliminar">🗑️</span>
                            </button>
                          )}
                          <div className="flex items-center mb-1">
                            <span className={`font-semibold text-xs ${isOwn ? 'text-white' : 'text-blue-700'}`}>{msg.username || msg.email}</span>
                            {msg.edited && <span className={`ml-2 text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>(editado)</span>}
                          </div>
                          <div className="text-sm">{msg.message}</div>
                          <div className="flex justify-end mt-1">
                            <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>
                          {/* Bottom row: badges */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex gap-1 flex-wrap">
                              {REACTION_EMOJIS.map((emoji) => {
                                const reactions = (msg.reactions || []).filter((r: any) => r.emoji === emoji);
                                if (reactions.length === 0) return null;
                                const userReacted = reactions.some((r: any) => String(r.userId) === String(userId));
                                // If userReacted, make badge clickable to undo
                                return userReacted ? (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReact(msg._id, emoji)}
                                    className={`flex items-center px-2 py-0.5 rounded-full text-sm border text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${isOwn ? 'bg-blue-600 text-white border-blue-400' : 'bg-gray-300 text-blue-700 border-blue-400'} hover:opacity-80 cursor-pointer`}
                                    title="Haz clic para quitar tu reacción"
                                  >
                                    <span>{emoji}</span>
                                    <span className="ml-1">{reactions.length}</span>
                                  </button>
                                ) : (
                                  <span
                                    key={emoji}
                                    className={`flex items-center px-2 py-0.5 rounded-full text-sm border text-xs bg-white text-gray-700 border-gray-300`}
                                  >
                                    <span>{emoji}</span>
                                    <span className="ml-1">{reactions.length}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          {/* Reaction icon and popover (bottom right, inside bubble) */}
                          <div className="absolute right-2 bottom-2 flex flex-col items-center gap-2">
                            <button
                              className="reaction-trigger p-1 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow"
                              onClick={() => setOpenReactionFor(msg._id)}
                              title="Reaccionar"
                            >
                              <span role="img" aria-label="Reaccionar">🤙➕</span>
                            </button>
                            {openReactionFor === msg._id && (
                              <div className="reaction-bar-popover absolute z-10 right-12 bottom-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1">
                                {REACTION_EMOJIS.map((emoji) => {
                                  const reactions = (msg.reactions || []).filter((r: any) => r.emoji === emoji);
                                  const userReacted = reactions.some((r: any) => String(r.userId) === String(userId));
                                  return (
                                    <button
                                      key={emoji}
                                      className={`flex items-center px-2 py-1 rounded-full text-lg border transition-colors ${userReacted ? (isOwn ? 'bg-blue-600 text-white border-blue-400' : 'bg-gray-300 text-blue-700 border-blue-400') : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                                      onClick={() => handleReact(msg._id, emoji)}
                                      disabled={!userId}
                                      title={emoji}
                                    >
                                      {emoji}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {!isEditing && canEditMessage(msg) && (
                        <button
                          onClick={() => handleEditMessage(msg)}
                          className="ml-2 text-blue-500 hover:text-blue-700 text-xs opacity-80 self-end"
                          title="Editar mensaje"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </>
          )}
          {showScrollButton && (
            <button
              className="fixed bottom-24 right-8 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all"
              onClick={() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                setShowScrollButton(false);
              }}
            >
              ↓ Ir al último mensaje
            </button>
          )}
        </div>
        {canAccessTab(activeTab) && (
          <div className="flex border-t p-2 bg-gray-50">
            {!userId && (
              <div className="text-red-500 text-sm flex-1">No se encontró el ID de usuario. No puedes enviar mensajes.</div>
            )}
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2 mr-2"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !sending) handleSend();
              }}
              disabled={!user || !userId || sending}
            />
            <Button onClick={handleSend} disabled={!input.trim() || !user || !userId || sending}>
              Enviar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
