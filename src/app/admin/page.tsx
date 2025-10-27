"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  LogOut,
  Monitor,
  Calendar,
  MousePointer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLogin from '@/components/AdminLogin';

interface AdOverlay {
  _id: string;
  logoUrl: string;
  text: string;
  redirectUrl: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminInfo, setAdminInfo] = useState<{ email: string; role: string } | null>(null);
  
  const [overlays, setOverlays] = useState<AdOverlay[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [selectedOverlay, setSelectedOverlay] = useState<AdOverlay | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    logoUrl: '',
    text: '',
    redirectUrl: '',
    position: 'bottom-right' as const,
    isActive: true,
    startDate: '',
    endDate: ''
  });
  
  const { toast } = useToast();

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch data only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOverlays();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
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

  const fetchOverlays = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/ad-overlays');
      if (response.ok) {
        const data = await response.json();
        setOverlays(data);
      } else {
        throw new Error('Error al cargar overlays');
      }
    } catch (error) {
      console.error('Error fetching overlays:', error);
      toast({
        title: "Error",
        description: "Error al cargar los overlays publicitarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOverlay = async () => {
    try {
      const response = await fetch('/api/admin/ad-overlays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Overlay publicitario creado correctamente",
        });
        setCreateDialogOpen(false);
        resetForm();
        fetchOverlays();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear overlay');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear overlay",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOverlay = async () => {
    if (!selectedOverlay) return;

    try {
      const response = await fetch('/api/admin/ad-overlays', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedOverlay._id, ...formData }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Overlay publicitario actualizado correctamente",
        });
        setEditDialogOpen(false);
        resetForm();
        fetchOverlays();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar overlay');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar overlay",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOverlay = async (overlay: AdOverlay) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el overlay "${overlay.text}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ad-overlays?id=${overlay._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Overlay publicitario eliminado correctamente",
        });
        fetchOverlays();
      } else {
        throw new Error('Error al eliminar overlay');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar overlay",
        variant: "destructive",
      });
    }
  };

  const handleEditOverlay = (overlay: AdOverlay) => {
    setSelectedOverlay(overlay);
    setFormData({
      logoUrl: overlay.logoUrl,
      text: overlay.text,
      redirectUrl: overlay.redirectUrl,
      position: overlay.position,
      isActive: overlay.isActive,
      startDate: overlay.startDate ? new Date(overlay.startDate).toISOString().split('T')[0] : '',
      endDate: overlay.endDate ? new Date(overlay.endDate).toISOString().split('T')[0] : ''
    });
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      logoUrl: '',
      text: '',
      redirectUrl: '',
      position: 'bottom-right',
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setSelectedOverlay(null);
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

  const getMetrics = () => {
    return {
      totalOverlays: overlays.length,
      activeOverlays: overlays.filter(o => o.isActive).length,
      totalClicks: overlays.reduce((sum, o) => sum + o.clickCount, 0),
      avgClicksPerOverlay: overlays.length > 0 ? Math.round(overlays.reduce((sum, o) => sum + o.clickCount, 0) / overlays.length) : 0
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
        <h1 className="text-3xl font-bold">Panel de Administración - Overlays Publicitarios</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Overlays</p>
                <p className="text-2xl font-bold">{metrics.totalOverlays}</p>
              </div>
              <Monitor className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overlays Activos</p>
                <p className="text-2xl font-bold">{metrics.activeOverlays}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold">{metrics.totalClicks}</p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio Clicks</p>
                <p className="text-2xl font-bold">{metrics.avgClicksPerOverlay}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overlays Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestión de Overlays Publicitarios</CardTitle>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Overlay
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overlays Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Texto</TableHead>
                    <TableHead>URL de Redirección</TableHead>
                    <TableHead>Posición</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overlays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No hay overlays publicitarios creados
                      </TableCell>
                    </TableRow>
                  ) : (
                    overlays.map((overlay) => (
                      <TableRow key={overlay._id}>
                        <TableCell>
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <img 
                              src={overlay.logoUrl} 
                              alt={overlay.text}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{overlay.text}</TableCell>
                        <TableCell className="text-sm text-blue-600 max-w-xs truncate">
                          {overlay.redirectUrl}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {overlay.position.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={overlay.isActive ? 'default' : 'secondary'}>
                            {overlay.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {overlay.clickCount}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(overlay.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditOverlay(overlay)}
                              title="Editar overlay"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOverlay(overlay)}
                              title="Eliminar overlay"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Overlay Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Overlay Publicitario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="logoUrl">URL del Logo</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
            <div>
              <Label htmlFor="text">Texto del Overlay</Label>
              <Input
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Nombre del anunciante"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="redirectUrl">URL de Redirección</Label>
              <Input
                id="redirectUrl"
                value={formData.redirectUrl}
                onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                placeholder="https://ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="position">Posición</Label>
              <Select value={formData.position} onValueChange={(value: any) => setFormData({ ...formData, position: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Esquina inferior derecha</SelectItem>
                  <SelectItem value="bottom-left">Esquina inferior izquierda</SelectItem>
                  <SelectItem value="top-right">Esquina superior derecha</SelectItem>
                  <SelectItem value="top-left">Esquina superior izquierda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Fecha de Inicio (opcional)</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Fecha de Fin (opcional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Overlay activo</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={handleCreateOverlay} disabled={!formData.logoUrl || !formData.text || !formData.redirectUrl}>
                Crear Overlay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Overlay Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Overlay Publicitario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-logoUrl">URL del Logo</Label>
              <Input
                id="edit-logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
            <div>
              <Label htmlFor="edit-text">Texto del Overlay</Label>
              <Input
                id="edit-text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Nombre del anunciante"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="edit-redirectUrl">URL de Redirección</Label>
              <Input
                id="edit-redirectUrl"
                value={formData.redirectUrl}
                onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                placeholder="https://ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-position">Posición</Label>
              <Select value={formData.position} onValueChange={(value: any) => setFormData({ ...formData, position: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Esquina inferior derecha</SelectItem>
                  <SelectItem value="bottom-left">Esquina inferior izquierda</SelectItem>
                  <SelectItem value="top-right">Esquina superior derecha</SelectItem>
                  <SelectItem value="top-left">Esquina superior izquierda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-startDate">Fecha de Inicio (opcional)</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-endDate">Fecha de Fin (opcional)</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">Overlay activo</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateOverlay} disabled={!formData.logoUrl || !formData.text || !formData.redirectUrl}>
                Actualizar Overlay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}