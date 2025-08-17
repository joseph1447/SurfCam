"use client";
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PerfilPage() {
  const { user, setUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Debes iniciar sesión</h2>
        <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">Ir al inicio</button>
      </div>
    </div>
  );
  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user._id },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.success) {
        setUser((u) => u ? { ...u, username } : u);
        setMsg('¡Guardado!');
        setEditing(false);
      } else {
        setMsg(data.error || 'Error al guardar');
      }
    } catch {
      setMsg('Error de red');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex flex-col items-center mb-6 relative">
          <Link href="/" className="absolute left-0 top-0">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-semibold text-sm shadow mr-2 mt-1">
              ← Volver a la cámara
            </button>
          </Link>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-4xl font-bold text-white mb-2 shadow-lg">
            {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold mb-1">Perfil de Usuario</h2>
          <p className="text-gray-500">Gestiona tu información personal</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="bg-gray-100 px-3 py-2 rounded text-gray-700 font-mono">{user.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de acceso</label>
            <div className="bg-gray-100 px-3 py-2 rounded text-gray-700">{user.accessType === 'premium' ? '💎 Premium' : '👤 Gratis'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
            {editing ? (
              <input
                className="border rounded px-3 py-2 w-full"
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={32}
                autoFocus
              />
            ) : (
              <div className="bg-gray-100 px-3 py-2 rounded text-gray-700 font-semibold">
                {user.username || <span className="text-gray-400">(no definido)</span>}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setEditing(false)} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">Cancelar</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold shadow">Editar</button>
          )}
          <button onClick={logout} className="ml-auto bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold shadow">Cerrar sesión</button>
        </div>
        {msg && <div className="mt-4 text-center text-green-600 font-medium">{msg}</div>}
      </div>
    </div>
  );
}
