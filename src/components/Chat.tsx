"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageBox, ChatList } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';

const SOCKET_URL = "https://socket-pbvr.onrender.com";

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

  // Connect to socket
  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL, { path: "/socket" });
    socketRef.current = socket;
    // Join general by default
    socket.emit("join", { group: "general", userId });
    // Join el-trillo if already joined
    if (joinedGroups.includes("el-trillo")) {
      socket.emit("join", { group: "el-trillo", userId });
    }
    // Listen for messages
    socket.on("message", (msg) => {
      setMessagesMap((prev) => {
        if (msg._id && prev.has(msg._id)) {
          return prev;
        }
        const newMap = new Map(prev);
        newMap.set(msg._id, msg);
        return newMap;
      });
    });
    // Listen for messageDeleted
    socket.on("messageDeleted", (data) => {
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data._id);
        return newMap;
      });
    });
    // Listen for messageEdited
    socket.on("messageEdited", (data) => {
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(data._id, { ...newMap.get(data._id), message: data.message, edited: true });
        return newMap;
      });
    });
    // Log connection errors
    socket.on("connect_error", (err) => {
    });
    socket.on("error", (err) => {
    });
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [user]);

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
  useEffect(() => {
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
    fetch(`/api/chat/messages?group=${activeTab}`)
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

  const handleDeleteMessage = async (messageId: string) => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    try {
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user.email,
        },
      });
      const data = await res.json();
      if (data.success) {
        setMessagesMap((prev) => {
          const newMap = new Map(prev);
          newMap.delete(messageId);
          return newMap;
        });
      } else {
        alert(data.error || 'No se pudo eliminar el mensaje');
      }
    } catch (err) {
      alert('Error al eliminar el mensaje');
    }
  };

  const handleEditMessage = async (msg: any) => {
    setEditingId(msg._id);
    setEditInput(msg.message);
  };

  const handleSaveEdit = async (msg: any) => {
    if (!editInput.trim() || !user) return;
    const res = await fetch(`/api/chat/messages/${msg._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user._id,
      },
      body: JSON.stringify({ message: editInput }),
    });
    const data = await res.json();
    if (data.success) {
      setEditingId(null);
      setEditInput("");
    } else {
      alert(data.error || 'No se pudo editar el mensaje');
    }
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
                        <MessageBox
                          id={msg._id}
                          position={isOwn ? 'right' : 'left'}
                          type={'text'}
                          title={msg.username || msg.email}
                          titleColor={isOwn ? '#075e54' : '#128c7e'}
                          text={`${msg.message}${msg.edited ? ' (editado)' : ''}`}
                          date={new Date(msg.timestamp)}
                          dateString={new Date(msg.timestamp).toLocaleTimeString()}
                          notch={true}
                          focus={false}
                          forwarded={false}
                          replyButton={false}
                          removeButton={false}
                          status={'waiting'}
                          retracted={false}
                        />
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
                      {user && user.email === ADMIN_EMAIL && msg._id && !isEditing && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id!)}
                          className="ml-2 text-red-500 hover:text-red-700 text-xs opacity-80 self-end"
                          title="Eliminar mensaje"
                        >
                          Eliminar
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
