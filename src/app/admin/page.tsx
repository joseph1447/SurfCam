"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Crown, 
  User, 
  Eye, 
  TrendingUp, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  LogOut,
  RefreshCw
} from "lucide-react";
import EditUserModal from "@/components/EditUserModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  _id: string;
  email: string;
  accessType: 'free' | 'premium';
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  subscription?: {
    plan: 'individual' | 'business';
    startDate: string;
    endDate: string;
    paymentMethod: 'SINPE' | 'other';
    status: 'active' | 'expired' | 'cancelled';
  };
  totalViews: number;
  loginCount: number;
  totalSessionTime: number;
  averageSessionTime: number;
  sessionHistory: Array<{
    loginTime: string;
    logoutTime?: string;
    sessionDuration: number;
    userAgent: string;
    ipAddress: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
  }>;
  activityStats: {
    firstLogin: string;
    lastActivity: string;
    totalDaysActive: number;
    consecutiveDaysActive: number;
    preferredLoginTime: string;
    mostActiveDay: string;
  };
}

interface Metrics {
  totalUsers: number;
  activeUsers: number;
  freeUsers: number;
  premiumUsers: number;
  activePremiumUsers: number;
  newUsers: number;
  totalViews: number;
  dailyMetrics: {
    views: number;
    uniqueUsers: number;
    newUsers: number;
    premiumConversions: number;
  };
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const { toast } = useToast();
  const [fixingIndex, setFixingIndex] = useState(false);
  const [fixIndexResult, setFixIndexResult] = useState<string | null>(null);

  // Login del admin
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('adminToken', 'authenticated');
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar métricas
  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      const data = await response.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  // Cargar usuarios
  const loadUsers = async (page = 1) => {
    try {
      const response = await fetch(`/api/admin/users?page=${page}&limit=20`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.page);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Actualizar usuario
  const updateUser = async (userData: any) => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (data.success) {
        loadUsers(currentPage);
        loadMetrics();
        setIsEditModalOpen(false);
        setSelectedUser(null);
      } else {
        throw new Error(data.error || 'Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // Eliminar usuario
  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        loadUsers(currentPage);
        loadMetrics();
        setIsEditModalOpen(false);
        setSelectedUser(null);
      } else {
        throw new Error(data.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  // Handle delete user confirmation
  const handleDeleteUserClick = (user: AdminUser) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete._id);
      setUserToDelete(null);
    }
  };

  // Crear usuario
  const createUser = async (userData: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (data.success) {
        loadUsers(currentPage);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
  };

  const handleFixUserIndex = async () => {
    setFixingIndex(true);
    setFixIndexResult(null);
    try {
      const res = await fetch("/api/admin/fix-user-index");
      const data = await res.json();
      setFixIndexResult(data.message);
      toast({ title: "Índices de email", description: data.message });
    } catch (err) {
      setFixIndexResult("Error al intentar arreglar los índices.");
      toast({ title: "Error", description: "No se pudo arreglar los índices." });
    } finally {
      setFixingIndex(false);
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token === 'authenticated') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Cargar datos cuando esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadMetrics();
      loadUsers();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">🔐 Admin Login</CardTitle>
            <CardDescription>Acceso exclusivo para administradores</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏄‍♂️ Santa Teresa Surf Cam - Admin</h1>
              <p className="text-sm text-gray-600">Panel de administración</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="users">👥 Usuarios</TabsTrigger>
            <TabsTrigger value="analytics">📈 Análisis</TabsTrigger>
            <TabsTrigger value="premium">💎 Premium</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      +{metrics.newUsers} nuevos hoy
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      Últimas 24 horas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuarios Premium</CardTitle>
                    <Crown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.activePremiumUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      Suscripciones activas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Vistas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalViews}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.dailyMetrics.views} hoy
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

                         <div className="flex justify-between items-center">
               <h2 className="text-lg font-semibold">Métricas del Día</h2>
               <div className="flex gap-2">
                 <Button onClick={loadMetrics} variant="outline" size="sm">
                   <RefreshCw className="h-4 w-4 mr-2" />
                   Actualizar
                 </Button>
                 <Button onClick={handleFixUserIndex} variant="outline" size="sm" disabled={fixingIndex}>
                   {fixingIndex ? "Arreglando..." : "Arreglar Índices de Email"}
                 </Button>
               </div>
             </div>
            {fixIndexResult && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm mt-2">
                {fixIndexResult}
              </div>
            )}

            {metrics && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{metrics.dailyMetrics.views}</div>
                      <div className="text-sm text-gray-600">Vistas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{metrics.dailyMetrics.uniqueUsers}</div>
                      <div className="text-sm text-gray-600">Usuarios Únicos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{metrics.dailyMetrics.newUsers}</div>
                      <div className="text-sm text-gray-600">Nuevos Usuarios</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{metrics.dailyMetrics.premiumConversions}</div>
                      <div className="text-sm text-gray-600">Conversiones Premium</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Usuarios */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Gestión de Usuarios</h2>
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-gray-600">
                            Registrado: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={user.accessType === 'premium' ? 'default' : 'secondary'}>
                          {user.accessType === 'premium' ? '💎 Premium' : '👤 Gratis'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUserClick(user)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                <div className="flex justify-center mt-6 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => loadUsers(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => loadUsers(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-lg font-semibold">Análisis Detallado de Usuarios</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card key={user._id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium truncate">
                        {user.email}
                      </CardTitle>
                      <Badge variant={user.accessType === 'premium' ? 'default' : 'secondary'}>
                        {user.accessType === 'premium' ? '💎 Premium' : '👤 Gratis'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Logins:</span> {user.loginCount || 0}
                      </div>
                      <div>
                        <span className="font-medium">Tiempo Total:</span> {Math.floor((user.totalSessionTime || 0) / 60)}m
                      </div>
                      <div>
                        <span className="font-medium">Promedio:</span> {Math.floor((user.averageSessionTime || 0) / 60)}m
                      </div>
                      <div>
                        <span className="font-medium">Días Activo:</span> {user.activityStats?.totalDaysActive || 0}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="text-xs">
                        <span className="font-medium">Dispositivo más usado:</span>
                        <div className="mt-1">
                          {(() => {
                            if (!user.sessionHistory || user.sessionHistory.length === 0) {
                              return <Badge variant="outline" className="text-xs">Sin datos</Badge>;
                            }
                            const deviceCounts = user.sessionHistory.reduce((acc: any, session) => {
                              acc[session.deviceType] = (acc[session.deviceType] || 0) + 1;
                              return acc;
                            }, {});
                            const mostUsed = Object.keys(deviceCounts).reduce((a, b) => 
                              deviceCounts[a] > deviceCounts[b] ? a : b
                            );
                            return (
                              <Badge variant="outline" className="text-xs">
                                {mostUsed === 'mobile' ? '📱' : mostUsed === 'tablet' ? '📱' : '💻'} {mostUsed}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>
                      
                                             <div className="text-xs">
                         <span className="font-medium">Navegador preferido:</span>
                         <div className="mt-1">
                           {(() => {
                             if (!user.sessionHistory || user.sessionHistory.length === 0) {
                               return <Badge variant="outline" className="text-xs">Sin datos</Badge>;
                             }
                             const browserCounts = user.sessionHistory.reduce((acc: any, session) => {
                               acc[session.browser] = (acc[session.browser] || 0) + 1;
                               return acc;
                             }, {});
                             const mostUsed = Object.keys(browserCounts).reduce((a, b) => 
                               browserCounts[a] > browserCounts[b] ? a : b
                             );
                             return (
                               <Badge variant="outline" className="text-xs">
                                 🌐 {mostUsed}
                               </Badge>
                             );
                           })()}
                         </div>
                       </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="font-medium">Primer login:</span> {user.activityStats?.firstLogin ? new Date(user.activityStats.firstLogin).toLocaleDateString() : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Última actividad:</span> {user.activityStats?.lastActivity ? new Date(user.activityStats.lastActivity).toLocaleDateString() : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Días consecutivos:</span> {user.activityStats?.consecutiveDaysActive || 0}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Premium */}
          <TabsContent value="premium" className="space-y-6">
            <h2 className="text-lg font-semibold">Gestión de Suscripciones Premium</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Aquí puedes gestionar las suscripciones premium de los usuarios.
                </p>
                {/* Contenido de gestión premium */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={updateUser}
        onDelete={deleteUser}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que quieres eliminar al usuario "${userToDelete?.email}"? Esta acción no se puede deshacer y se perderán todos los datos del usuario.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}
