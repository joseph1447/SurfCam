"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SOCKET_URL = "/api/socket";
const GROUPS = [
  { key: "general", label: "General", protected: false },
  { key: "el-trillo", label: "El Trillo", protected: true },
];

export default function Chat() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [messages, setMessages] = useState<{_id?: string, userId: string, username: string, message: string, timestamp: string}[]>([]);
  const [input, setInput] = useState("");
  const [joinedGroups, setJoinedGroups] = useState<string[]>(["general"]);
  const [joining, setJoining] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");
  const [joinError, setJoinError] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMINUSER || 'josephquesada92@gmail.com';

  // Connect to socket
  useEffect(() => {
    if (!user) return;
    console.log('Chat user object:', user);
    const userId = user._id || user.id;
    if (!userId) return;
    const socket = io(window.location.origin, { path: "/api/socket" });
    socketRef.current = socket;
    // Join general by default
    socket.emit("join", { group: "general", userId });
    // Join el-trillo if already joined
    if (joinedGroups.includes("el-trillo")) {
      socket.emit("join", { group: "el-trillo", userId });
    }
    // Listen for messages
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    // Listen for messageDeleted
    socket.on("messageDeleted", (data) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== data._id));
    });
    // Listen for messageEdited
    socket.on("messageEdited", (data) => {
      setMessages((prev) => prev.map((msg) => msg._id === data._id ? { ...msg, message: data.message, edited: true } : msg));
    });
    // Log connection errors
    socket.on("connect_error", (err) => {
      console.error("Socket.IO connect_error:", err);
    });
    socket.on("error", (err) => {
      console.error("Socket.IO error:", err);
    });
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [user]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat history on tab change
  useEffect(() => {
    if (!user) return;
    fetch(`/api/chat/messages?group=${activeTab}`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []));
  }, [activeTab, user]);

  const handleSend = () => {
    if (!input.trim() || !user) return;
    const userId = user._id || user.id;
    if (!userId) return;
    socketRef.current?.emit("message", {
      group: activeTab,
      userId,
      username: user.username || user.email,
      message: input,
    });
    setInput("");
  };

  const handleJoinGroup = async () => {
    setJoining(true);
    setJoinError("");
    // Call API to join group (password protected)
    const res = await fetch("/api/chat/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: "el-trillo", password: joinPassword }),
    });
    const data = await res.json();
    if (data.success) {
      setJoinedGroups((prev) => [...prev, "el-trillo"]);
      socketRef.current?.emit("join", { group: "el-trillo", userId: user._id });
      setActiveTab("el-trillo");
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
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
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

  const userId = user?._id || user?.id;

  return (
    <Card className="mt-8 max-w-2xl mx-auto">
      <CardContent className="p-0">
        <div className="flex border-b">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              className={`flex-1 py-2 px-4 text-center font-semibold transition-colors ${activeTab === g.key ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`}
              onClick={() => {
                if (g.protected && !canAccessTab(g.key)) return;
                setActiveTab(g.key);
              }}
              disabled={g.protected && !canAccessTab(g.key)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="h-80 overflow-y-auto p-4 bg-white">
          {activeTab === "el-trillo" && !canAccessTab("el-trillo") ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h3 className="text-lg font-bold mb-2">Unirse a El Trillo</h3>
              <input
                type="password"
                placeholder="Contraseña del grupo"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                className="border rounded px-3 py-2 mb-2 w-full max-w-xs"
                disabled={joining}
              />
              <Button onClick={handleJoinGroup} disabled={joining || !joinPassword}>
                {joining ? "Uniendo..." : "Unirse"}
              </Button>
              {joinError && <div className="text-red-500 mt-2">{joinError}</div>}
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="text-gray-400 text-center mt-8">No hay mensajes aún.</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id || Math.random()} className="mb-2 flex items-center group">
                    <span className="font-semibold text-primary">{msg.username || msg.email}:</span> {editingId === msg._id ? (
                      <>
                        <input
                          className="border rounded px-2 py-1 text-sm mr-2"
                          value={editInput}
                          onChange={e => setEditInput(e.target.value)}
                          maxLength={500}
                        />
                        <button onClick={() => handleSaveEdit(msg)} className="text-green-600 text-xs mr-2">Guardar</button>
                        <button onClick={() => { setEditingId(null); setEditInput(""); }} className="text-gray-400 text-xs">Cancelar</button>
                      </>
                    ) : (
                      <>
                        {msg.message} {msg.edited && <span className="text-xs text-gray-400">(editado)</span>}
                        {canEditMessage(msg) && (
                          <button
                            onClick={() => handleEditMessage(msg)}
                            className="ml-2 text-blue-500 hover:text-blue-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Editar mensaje"
                          >
                            Editar
                          </button>
                        )}
                      </>
                    )}
                    <span className="text-xs text-gray-400 ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    {user && user.email === ADMIN_EMAIL && msg._id && (
                      <button
                        onClick={() => handleDeleteMessage(msg._id!)}
                        className="ml-2 text-red-500 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar mensaje"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </>
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
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={!user || !userId}
            />
            <Button onClick={handleSend} disabled={!input.trim() || !user || !userId}>
              Enviar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
