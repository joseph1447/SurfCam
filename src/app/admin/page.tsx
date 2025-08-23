"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  MessageCircle, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  loginCount: number;
  accessType?: 'free' | 'premium';
}

interface Moderator {
  _id: string;
  email: string;
  username?: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accessTypeFilter, setAccessTypeFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteAction, setPromoteAction] = useState<'promote' | 'demote'>('promote');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      // Fetch moderators
      const moderatorsResponse = await fetch('/api/admin/moderators');
      if (moderatorsResponse.ok) {
        const moderatorsData = await moderatorsResponse.json();
        setModerators(moderatorsData.moderators || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesAccessType = accessTypeFilter === 'all' || user.accessType === accessTypeFilter;
    return matchesSearch && matchesAccessType;
  }).sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'username':
        aValue = a.username?.toLowerCase() || '';
        bValue = b.username?.toLowerCase() || '';
        break;
      case 'email':
        aValue = a.email?.toLowerCase() || '';
        bValue = b.email?.toLowerCase() || '';
        break;
      case 'role':
        aValue = a.role?.toLowerCase() || '';
        bValue = b.role?.toLowerCase() || '';
        break;
      case 'loginCount':
        aValue = a.loginCount || 0;
        bValue = b.loginCount || 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const filteredModerators = moderators.filter(moderator =>
    moderator.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  );

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Usuario actualizado correctamente",
        });
        setEditDialogOpen(false);
        fetchData();
      } else {
        throw new Error('Error al actualizar usuario');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar usuario",
        variant: "destructive",
      });
    }
  };

  const handlePromoteUser = async () => {
    try {
      const response = await fetch('/api/admin/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: promoteEmail, action: promoteAction }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Usuario ${promoteAction === 'promote' ? 'promovido a' : 'degradado de'} moderador correctamente`,
        });
        setShowPromoteDialog(false);
        setPromoteEmail('');
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al gestionar moderador');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al gestionar moderador",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Costa_Rica'
    });
  };

  const formatDateOnly = (date: Date) => {
    return date.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Costa_Rica'
    });
  };

  const getMetrics = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const premiumUsers = users.filter(u => u.accessType === 'premium').length;
    const freeUsers = users.filter(u => u.accessType === 'free' || !u.accessType).length;
    const totalLogins = users.reduce((sum, u) => sum + (u.loginCount || 0), 0);
    const today = new Date().toDateString();
    const todayLogins = users.filter(u => 
      u.lastLogin && new Date(u.lastLogin).toDateString() === today
    ).length;

    return { totalUsers, activeUsers, premiumUsers, freeUsers, totalLogins, todayLogins };
  };

  const metrics = getMetrics();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold">{metrics.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold">{metrics.activeUsers}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Premium</p>
                <p className="text-2xl font-bold">{metrics.premiumUsers}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Gratuitos</p>
                <p className="text-2xl font-bold">{metrics.freeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logins</p>
                <p className="text-2xl font-bold">{metrics.totalLogins}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Logins Hoy</p>
                <p className="text-2xl font-bold">{metrics.todayLogins}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="moderators" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Moderadores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={accessTypeFilter} onValueChange={(value: 'all' | 'free' | 'premium') => setAccessTypeFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tipo de acceso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <SelectItem value="premium">Solo Premium</SelectItem>
                    <SelectItem value="free">Solo Gratuitos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortField} onValueChange={handleSort}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Fecha de creación</SelectItem>
                    <SelectItem value="username">Nombre de usuario</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="role">Rol</SelectItem>
                    <SelectItem value="loginCount">Número de logins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Tipo de Acceso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Logins</TableHead>
                    <TableHead>Último Login</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.accessType === 'premium' ? 'default' : 'secondary'}>
                          {user.accessType === 'premium' ? 'Premium' : 'Gratuito'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.loginCount || 0}</TableCell>
                      <TableCell>
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderators" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Moderadores</CardTitle>
                <Button onClick={() => setShowPromoteDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Gestionar Moderador
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar moderadores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredModerators.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Nombre de Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Último Login</TableHead>
                      <TableHead>Fecha Creación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModerators.map((moderator) => (
                      <TableRow key={moderator._id}>
                        <TableCell className="font-medium">{moderator.email}</TableCell>
                        <TableCell>{moderator.username || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {moderator.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={moderator.isActive ? 'default' : 'secondary'}>
                            {moderator.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {moderator.lastLogin ? formatDate(moderator.lastLogin) : 'Nunca'}
                        </TableCell>
                        <TableCell>{formatDate(moderator.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay moderadores</h3>
                  <p className="text-gray-500 mb-4">Promueve usuarios a moderadores para comenzar</p>
                  <Button onClick={() => setShowPromoteDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Promover Primer Moderador
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select value={selectedUser.role} onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="moderator">Moderador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="accessType">Tipo de Acceso</Label>
                <Select value={selectedUser.accessType || 'free'} onValueChange={(value: 'free' | 'premium') => setSelectedUser({ ...selectedUser, accessType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={selectedUser.isActive}
                  onCheckedChange={(checked) => setSelectedUser({ ...selectedUser, isActive: checked })}
                />
                <Label htmlFor="isActive">Usuario activo</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveUser}>
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Promote/Demote Moderator Dialog */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Moderador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email del usuario</Label>
              <Input
                id="email"
                type="email"
                value={promoteEmail}
                onChange={(e) => setPromoteEmail(e.target.value)}
                placeholder="Ingresa el email del usuario"
              />
            </div>
            <div>
              <Label htmlFor="action">Acción</Label>
              <Select value={promoteAction} onValueChange={(value: 'promote' | 'demote') => setPromoteAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promote">Promover a Moderador</SelectItem>
                  <SelectItem value="demote">Degradar de Moderador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPromoteDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handlePromoteUser} disabled={!promoteEmail.trim()}>
                {promoteAction === 'promote' ? 'Promover' : 'Degradar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
