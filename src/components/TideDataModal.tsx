"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TideDataPoint {
  time: string;
  height: number;
}

interface TideData {
  _id?: string;
  date: string;
  location: {
    lat: number;
    lng: number;
  };
  tideHeight: TideDataPoint[];
  currentHeight: number;
  nextHighTide: {
    time: string;
    height: number;
  };
  nextLowTide: {
    time: string;
    height: number;
  };
}

interface TideDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TideData) => Promise<void>;
  tideData?: TideData | null;
  isEditing?: boolean;
}

export default function TideDataModal({ 
  isOpen, 
  onClose, 
  onSave, 
  tideData, 
  isEditing = false 
}: TideDataModalProps) {
  const [formData, setFormData] = useState<TideData>({
    date: '',
    location: { lat: 9.6489, lng: -85.1683 },
    tideHeight: [],
    currentHeight: 0,
    nextHighTide: { time: '', height: 0 },
    nextLowTide: { time: '', height: 0 }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newTidePoint, setNewTidePoint] = useState({ time: '', height: '' });
  const { toast } = useToast();

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && tideData) {
      setFormData({
        ...tideData,
        date: new Date(tideData.date).toISOString().split('T')[0],
        tideHeight: tideData.tideHeight.map(point => ({
          ...point,
          time: new Date(point.time).toISOString().slice(0, 16)
        })),
        nextHighTide: {
          ...tideData.nextHighTide,
          time: new Date(tideData.nextHighTide.time).toISOString().slice(0, 16)
        },
        nextLowTide: {
          ...tideData.nextLowTide,
          time: new Date(tideData.nextLowTide.time).toISOString().slice(0, 16)
        }
      });
    } else if (isOpen && !isEditing) {
      // Reset form for new data
      setFormData({
        date: new Date().toISOString().split('T')[0],
        location: { lat: 9.6489, lng: -85.1683 },
        tideHeight: [],
        currentHeight: 0,
        nextHighTide: { time: '', height: 0 },
        nextLowTide: { time: '', height: 0 }
      });
    }
  }, [isOpen, tideData, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(formData);
      toast({
        title: isEditing ? "Datos actualizados" : "Datos creados",
        description: isEditing ? "Los datos de marea han sido actualizados exitosamente" : "Los datos de marea han sido creados exitosamente"
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar los datos de marea",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTidePoint = () => {
    if (newTidePoint.time && newTidePoint.height) {
      setFormData(prev => ({
        ...prev,
        tideHeight: [...prev.tideHeight, {
          time: newTidePoint.time,
          height: parseFloat(newTidePoint.height)
        }].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      }));
      setNewTidePoint({ time: '', height: '' });
    }
  };

  const removeTidePoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tideHeight: prev.tideHeight.filter((_, i) => i !== index)
    }));
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString('es-CR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Costa_Rica'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🌊 {isEditing ? 'Editar' : 'Crear'} Datos de Marea
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lat">Latitud</Label>
              <Input
                id="lat"
                type="number"
                step="0.0001"
                value={formData.location.lat}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, lat: parseFloat(e.target.value) }
                }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitud</Label>
              <Input
                id="lng"
                type="number"
                step="0.0001"
                value={formData.location.lng}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, lng: parseFloat(e.target.value) }
                }))}
                required
              />
            </div>
          </div>

          {/* Altura actual */}
          <div>
            <Label htmlFor="currentHeight">Altura Actual (metros)</Label>
            <Input
              id="currentHeight"
              type="number"
              step="0.1"
              value={formData.currentHeight}
              onChange={(e) => setFormData(prev => ({ ...prev, currentHeight: parseFloat(e.target.value) }))}
              required
            />
          </div>

          {/* Próximas mareas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Próxima Marea Alta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="highTideTime">Hora</Label>
                  <Input
                    id="highTideTime"
                    type="datetime-local"
                    value={formData.nextHighTide.time}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      nextHighTide: { ...prev.nextHighTide, time: e.target.value }
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="highTideHeight">Altura (metros)</Label>
                  <Input
                    id="highTideHeight"
                    type="number"
                    step="0.1"
                    value={formData.nextHighTide.height}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      nextHighTide: { ...prev.nextHighTide, height: parseFloat(e.target.value) }
                    }))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Próxima Marea Baja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="lowTideTime">Hora</Label>
                  <Input
                    id="lowTideTime"
                    type="datetime-local"
                    value={formData.nextLowTide.time}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      nextLowTide: { ...prev.nextLowTide, time: e.target.value }
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lowTideHeight">Altura (metros)</Label>
                  <Input
                    id="lowTideHeight"
                    type="number"
                    step="0.1"
                    value={formData.nextLowTide.height}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      nextLowTide: { ...prev.nextLowTide, height: parseFloat(e.target.value) }
                    }))}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Datos de altura de marea */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Datos de Altura de Marea</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Agregar nuevo punto */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="newTime">Hora</Label>
                  <Input
                    id="newTime"
                    type="datetime-local"
                    value={newTidePoint.time}
                    onChange={(e) => setNewTidePoint(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="newHeight">Altura (metros)</Label>
                  <Input
                    id="newHeight"
                    type="number"
                    step="0.1"
                    value={newTidePoint.height}
                    onChange={(e) => setNewTidePoint(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={addTidePoint} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Lista de puntos */}
              <div className="space-y-2">
                {formData.tideHeight.map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{formatTime(point.time)}</Badge>
                      <span className="font-medium">{point.height}m</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTidePoint(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {formData.tideHeight.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay datos de altura de marea agregados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
