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
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLogin from '@/components/AdminLogin';

interface User {
  _id: string;
  username?: string;
  email: string;
  role?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  loginCount?: number;
  accessType?: 'free' | 'premium';
  totalViews?: number;
  averageSessionTime?: number;
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
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminInfo, setAdminInfo] = useState<{ email: string; role: string } | null>(null);
  
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Enhanced filtering and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [accessTypeFilter, setAccessTypeFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'moderator' | 'admin'>('all');
  const [isActiveFilter, setIsActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loginCountMin, setLoginCountMin] = useState('');
  const [loginCountMax, setLoginCountMax] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  
  // Sorting state
  const [sortField, setSortField] = useState<string>('lastLogin');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Dialog state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteAction, setPromoteAction] = useState<'promote' | 'demote'>('promote');
  
  // Filter options from API
  const [filterOptions, setFilterOptions] = useState<{
    accessTypes: string[];
    roles: string[];
  }>({ accessTypes: [], roles: [] });
  
  const { toast } = useToast();

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch data only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, currentPage, pageSize, sortField, sortDirection, searchTerm, accessTypeFilter, roleFilter, isActiveFilter, dateFrom, dateTo, loginCountMin, loginCountMax]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store' // Ensure fresh auth check
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAdminInfo(data.admin);
        } else {
          setIsAuthenticated(false);
          setAdminInfo(null);
        }
      } else {
        setIsAuthenticated(false);
        setAdminInfo(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setAdminInfo(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      setIsAuthenticated(false);
      setAdminInfo(null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: sortField,
        sortOrder: sortDirection,
        ...(searchTerm && { search: searchTerm }),
        ...(accessTypeFilter !== 'all' && { accessType: accessTypeFilter }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(isActiveFilter !== 'all' && { isActive: isActiveFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(loginCountMin && { loginCountMin }),
        ...(loginCountMax && { loginCountMax }),
      });

      // Fetch users with enhanced filtering and pagination
      const usersResponse = await fetch(`/api/admin/users?${params}`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
        setTotalPages(usersData.pagination?.pages || 1);
        setTotalUsers(usersData.pagination?.total || 0);
        setFilterOptions(usersData.filterOptions || { accessTypes: [], roles: [] });
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
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const clearFilters = () => {
    setSearchTerm('');
    setAccessTypeFilter('all');
    setRoleFilter('all');
    setIsActiveFilter('all');
    setDateFrom('');
    setDateTo('');
    setLoginCountMin('');
    setLoginCountMax('');
    setCurrentPage(1);
  };

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
    // These metrics now come from the API and represent filtered data
    return {
      totalUsers: totalUsers,
      activeUsers: users.filter(u => u.isActive).length,
      premiumUsers: users.filter(u => u.accessType === 'premium').length,
      freeUsers: users.filter(u => u.accessType === 'free' || !u.accessType).length,
      totalLogins: users.reduce((sum, u) => sum + (u.loginCount || 0), 0),
      todayLogins: users.filter(u => {
        if (!u.lastLogin) return false;
        const today = new Date().toDateString();
        return new Date(u.lastLogin).toDateString() === today;
      }).length
    };
  };

  const metrics = getMetrics();

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg font-medium text-gray-700">Verificando acceso...</div>
          <div className="text-sm text-gray-500">Comprobando credenciales de administrador</div>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  // Show loading while fetching data
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Conectado como: <span className="font-medium">{adminInfo?.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

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
              <CardTitle className="flex items-center justify-between">
                <span>Gestión de Usuarios</span>
                <div className="text-sm text-gray-500">
                  Total: {totalUsers.toLocaleString()} usuarios
                </div>
              </CardTitle>
              
              {/* Enhanced Filter Section */}
              <div className="space-y-4">
                {/* First Row - Search and Basic Filters */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por email o nombre..."
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
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="free">Gratuitos</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={roleFilter} onValueChange={(value: 'all' | 'user' | 'moderator' | 'admin') => setRoleFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="moderator">Moderador</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={isActiveFilter} onValueChange={(value: 'all' | 'true' | 'false') => setIsActiveFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">Activos</SelectItem>
                      <SelectItem value="false">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap">
                    <Filter className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                </div>
                
                {/* Second Row - Advanced Filters */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">Filtros Avanzados:</div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="dateFrom" className="text-sm whitespace-nowrap">Desde:</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="dateTo" className="text-sm whitespace-nowrap">Hasta:</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="loginMin" className="text-sm whitespace-nowrap">Logins min:</Label>
                    <Input
                      id="loginMin"
                      type="number"
                      placeholder="0"
                      value={loginCountMin}
                      onChange={(e) => setLoginCountMin(e.target.value)}
                      className="w-20"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="loginMax" className="text-sm whitespace-nowrap">Logins max:</Label>
                    <Input
                      id="loginMax"
                      type="number"
                      placeholder="∞"
                      value={loginCountMax}
                      onChange={(e) => setLoginCountMax(e.target.value)}
                      className="w-20"
                    />
                  </div>
                </div>
                
                {/* Third Row - Sorting and Page Size */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Select value={sortField} onValueChange={handleSort}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lastLogin">Último login</SelectItem>
                        <SelectItem value="createdAt">Fecha de creación</SelectItem>
                        <SelectItem value="username">Nombre de usuario</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="role">Rol</SelectItem>
                        <SelectItem value="loginCount">Número de logins</SelectItem>
                        <SelectItem value="totalViews">Total vistas</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSort(sortField)}
                      className="whitespace-nowrap"
                    >
                      {sortDirection === 'asc' ? '↑' : '↓'} {sortDirection === 'asc' ? 'Asc' : 'Desc'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pageSize" className="text-sm">Mostrar:</Label>
                    <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500">por página</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalUsers)} de {totalUsers.toLocaleString()} usuarios
                  </div>
                  {loading && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Cargando...</span>
                    </div>
                  )}
                </div>
                
                {/* Users Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('username')}>
                          <div className="flex items-center gap-2">
                            Usuario
                            {sortField === 'username' && (
                              <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('email')}>
                          <div className="flex items-center gap-2">
                            Email
                            {sortField === 'email' && (
                              <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('role')}>
                          <div className="flex items-center gap-2">
                            Rol
                            {sortField === 'role' && (
                              <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('accessType')}>
                          <div className="flex items-center gap-2">
                            Tipo de Acceso
                            {sortField === 'accessType' && (
                              <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('isActive')}>
                          <div className="flex items-center gap-2">
                            Estado
                            {sortField === 'isActive' && (
                              <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('loginCount')}>
                          <div className="flex items-center gap-2">
                            Logins
                            {sortField === 'loginCount' && (
                              <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('lastLogin')}>
                          <div className="flex items-center gap-2">
                            Último Login
                            {sortField === 'lastLogin' && (
                              <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('createdAt')}>
                          <div className="flex items-center gap-2">
                            Fecha Creación
                            {sortField === 'createdAt' && (
                              <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            {loading ? 'Cargando usuarios...' : 'No se encontraron usuarios con los filtros aplicados'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell className="font-medium">
                              {user.username || <span className="text-gray-400 italic">Sin nombre</span>}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'moderator' ? 'default' : 'secondary'}>
                                {user.role || 'user'}
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
                            <TableCell className="text-center">{user.loginCount || 0}</TableCell>
                            <TableCell className="text-sm">
                              {user.lastLogin ? formatDate(user.lastLogin) : <span className="text-gray-400">Nunca</span>}
                            </TableCell>
                            <TableCell className="text-sm">{formatDate(user.createdAt)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                title="Editar usuario"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1 || loading}
                      >
                        Primera
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        Anterior
                      </Button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              disabled={loading}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                      >
                        Siguiente
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages || loading}
                      >
                        Última
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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
