'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, UserPlus, Save } from 'lucide-react';

interface User {
  _id: string;
  email: string;
  groups: string[];
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkGroupAction, setBulkGroupAction] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // TODO: Create API endpoint for fetching users
      // const res = await fetch('/api/admin/users');
      // const data = await res.json();
      // setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGroup = async (userId: string, group: string) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;

    const newGroups = user.groups.includes(group)
      ? user.groups.filter(g => g !== group)
      : [...user.groups, group];

    try {
      // TODO: Create API endpoint for updating user groups
      // const res = await fetch(`/api/admin/users/${userId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ groups: newGroups }),
      // });

      setUsers(users.map(u => u._id === userId ? { ...u, groups: newGroups } : u));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleBulkAddGroup = async () => {
    if (!bulkGroupAction || selectedUsers.size === 0) return;

    try {
      for (const userId of selectedUsers) {
        await handleToggleGroup(userId, bulkGroupAction);
      }
      setSelectedUsers(new Set());
      setBulkGroupAction('');
    } catch (error) {
      console.error('Error bulk updating users:', error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[hsl(215,30%,12%)] to-[hsl(210,50%,10%)] rounded-2xl border border-cyan-500/20 p-6 shadow-xl shadow-cyan-500/10">
        <h1 className="text-3xl font-headline font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text mb-2">
          User Management
        </h1>
        <p className="text-muted-foreground">Manage users and assign them to group chats</p>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="bg-[hsl(215,30%,12%)] rounded-2xl border border-cyan-500/20 p-4 flex items-center gap-4 animate-fade-in-up shadow-lg shadow-cyan-500/10">
          <span className="text-sm font-semibold text-cyan-400">
            {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex-1 flex gap-2">
            <select
              value={bulkGroupAction}
              onChange={(e) => setBulkGroupAction(e.target.value)}
              className="px-3 py-2 bg-[hsl(215,25%,15%)] border border-cyan-500/30 text-foreground rounded-lg text-sm"
            >
              <option value="">Select a group...</option>
              <option value="general">General</option>
              <option value="eltrillo">El Trillo</option>
            </select>
            <Button
              onClick={handleBulkAddGroup}
              disabled={!bulkGroupAction}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add to Group
            </Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[hsl(215,30%,12%)] rounded-2xl border border-cyan-500/20 overflow-hidden shadow-xl shadow-cyan-500/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-[hsl(215,25%,15%)]">
                <th className="px-6 py-4 text-left">
                  <Checkbox
                    checked={selectedUsers.size === users.length && users.length > 0}
                    onChange={() => {
                      if (selectedUsers.size === users.length) {
                        setSelectedUsers(new Set());
                      } else {
                        setSelectedUsers(new Set(users.map(u => u._id)));
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Groups</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors">
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedUsers.has(user._id)}
                      onChange={() => toggleUserSelection(user._id)}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {['general', 'eltrillo'].map((group) => (
                        <button
                          key={group}
                          onClick={() => handleToggleGroup(user._id, group)}
                          className={`px-3 py-1 text-xs rounded-full font-semibold transition-all duration-300 ${
                            user.groups.includes(group)
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                              : 'bg-[hsl(215,25%,20%)] text-muted-foreground border border-cyan-500/20 hover:border-cyan-500/50'
                          }`}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No users found</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Loading users...</p>
          </div>
        )}
      </div>
    </div>
  );
}
