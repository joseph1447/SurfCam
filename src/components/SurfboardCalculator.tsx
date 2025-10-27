"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Waves, Ruler, Star, MapPin } from 'lucide-react';

interface SurfboardRecommendation {
  volume: number;
  length: number;
  width: number;
  thickness: number;
  surfaceArea: number;
  level: string;
  waveSize: string;
  style: string;
}

interface BrandRecommendation {
  brand: string;
  model: string;
  volume: number;
  length: number;
  width: number;
  thickness: number;
  description: string;
  priceRange: string;
  bestFor: string[];
}

interface LocalShaperSpecs {
  volume: number;
  length: number;
  width: number;
  thickness: number;
  noseWidth: number;
  tailWidth: number;
  rocker: string;
  finSetup: string;
  materials: string[];
  finishing: string[];
}

export default function SurfboardCalculator() {
  const [formData, setFormData] = useState({
    weight: '70',
    height: '175',
    level: 'intermediate',
    waveSize: '2-4',
    style: 'shortboard',
    conditions: ''
  });

  const [recommendation, setRecommendation] = useState<SurfboardRecommendation | null>(null);
  const [brandRecommendations, setBrandRecommendations] = useState<BrandRecommendation[]>([]);
  const [localShaperSpecs, setLocalShaperSpecs] = useState<LocalShaperSpecs | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateSurfboard = () => {
    if (!formData.weight || !formData.height || !formData.level || !formData.waveSize || !formData.style) {
      return;
    }

    setLoading(true);

    // Simular cálculo (en producción sería más complejo)
    setTimeout(() => {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      
      // ALGORITMO REALISTA BASADO EN DATOS REALES
      
      // 1. CÁLCULO DE VOLUMEN BASE (litros por kg de peso corporal)
      let litersPerKg = 0.35; // Base para intermedio
      
      // Ajuste por nivel
      if (formData.level === 'beginner') litersPerKg = 0.40; // Más volumen para estabilidad
      else if (formData.level === 'advanced') litersPerKg = 0.30; // Menos volumen para maniobrabilidad
      
      // Ajuste por tamaño de olas
      if (formData.waveSize === '0-2') litersPerKg += 0.05; // Más volumen para olas pequeñas
      else if (formData.waveSize === '4-6') litersPerKg -= 0.03; // Menos volumen para olas grandes
      else if (formData.waveSize === '6+') litersPerKg -= 0.05; // Aún menos para olas muy grandes
      
      // Ajuste por estilo de tabla
      if (formData.style === 'longboard') litersPerKg += 0.15; // Mucho más volumen
      else if (formData.style === 'funboard') litersPerKg += 0.08; // Más volumen
      else if (formData.style === 'fish') litersPerKg += 0.03; // Ligeramente más volumen
      else if (formData.style === 'gun') litersPerKg -= 0.05; // Menos volumen para velocidad
      
      // Ajuste por altura (surfistas más altos pueden manejar más volumen)
      if (height > 180) litersPerKg += 0.02;
      else if (height < 160) litersPerKg -= 0.02;
      
      const idealVolume = Math.round(weight * litersPerKg * 10) / 10; // Redondear a 1 decimal
      
      // 2. CÁLCULO DE DIMENSIONES REALISTAS
      let lengthFeet = 0;
      let lengthInches = 0;
      let widthInches = 0;
      let thicknessInches = 0;
      
      // Longitud basada en altura y estilo
      const heightInFeet = height / 30.48; // Convertir cm a pies
      
      if (formData.style === 'longboard') {
        lengthFeet = Math.max(9, Math.min(10, Math.round(heightInFeet * 0.9)));
        lengthInches = Math.round((Math.random() - 0.5) * 6); // ±3 pulgadas
      } else if (formData.style === 'funboard') {
        lengthFeet = Math.max(7, Math.min(8, Math.round(heightInFeet * 0.8)));
        lengthInches = Math.round((Math.random() - 0.5) * 6);
      } else if (formData.style === 'shortboard') {
        lengthFeet = Math.max(5, Math.min(7, Math.round(heightInFeet * 0.7)));
        lengthInches = Math.round((Math.random() - 0.5) * 6);
      } else if (formData.style === 'fish') {
        lengthFeet = Math.max(5, Math.min(6, Math.round(heightInFeet * 0.65)));
        lengthInches = Math.round((Math.random() - 0.5) * 6);
      } else if (formData.style === 'gun') {
        lengthFeet = Math.max(7, Math.min(9, Math.round(heightInFeet * 0.85)));
        lengthInches = Math.round((Math.random() - 0.5) * 6);
      }
      
      // Ajustar longitud total
      const totalLengthInches = lengthFeet * 12 + lengthInches;
      
      // Ancho basado en estilo y volumen
      if (formData.style === 'longboard') {
        widthInches = Math.max(22, Math.min(24, 22 + (idealVolume - 25) * 0.1));
      } else if (formData.style === 'funboard') {
        widthInches = Math.max(20, Math.min(22, 20 + (idealVolume - 20) * 0.1));
      } else if (formData.style === 'shortboard') {
        widthInches = Math.max(18, Math.min(20, 18 + (idealVolume - 15) * 0.1));
      } else if (formData.style === 'fish') {
        widthInches = Math.max(20, Math.min(22, 20 + (idealVolume - 18) * 0.1));
      } else if (formData.style === 'gun') {
        widthInches = Math.max(18, Math.min(20, 18 + (idealVolume - 20) * 0.1));
      }
      
      // Grosor basado en volumen y longitud
      const baseThickness = idealVolume / (totalLengthInches * widthInches * 0.6); // Factor de forma 0.6
      thicknessInches = Math.max(2.0, Math.min(3.5, baseThickness));
      
      // Redondear dimensiones
      widthInches = Math.round(widthInches * 10) / 10;
      thicknessInches = Math.round(thicknessInches * 100) / 100;
      
      const surfaceArea = totalLengthInches * widthInches * 0.8; // Factor de forma

      const newRecommendation: SurfboardRecommendation = {
        volume: idealVolume,
        length: `${lengthFeet}'${lengthInches}"`,
        width: `${widthInches}"`,
        thickness: `${thicknessInches}"`,
        surfaceArea: Math.round(surfaceArea * 10) / 10,
        level: formData.level,
        waveSize: formData.waveSize,
        style: formData.style
      };

      setRecommendation(newRecommendation);
      generateBrandRecommendations(newRecommendation);
      generateLocalShaperSpecs(newRecommendation);
      setLoading(false);
    }, 1000);
  };

  const generateBrandRecommendations = (rec: SurfboardRecommendation) => {
    const brands: BrandRecommendation[] = [];

    // Generar recomendaciones basadas en el estilo y condiciones
    if (rec.style === 'shortboard') {
      if (rec.waveSize === '0-2' || rec.waveSize === '2-4') {
        brands.push({
          brand: 'Channel Islands',
          model: 'CI Pro',
          volume: rec.volume,
          length: rec.length,
          width: rec.width,
          thickness: rec.thickness,
          description: 'Tabla de alto rendimiento para olas pequeñas a medianas',
          priceRange: '$800-1200',
          bestFor: ['Olas de 1-4 pies', 'Surfistas intermedios-avanzados', 'Performance']
        });
      }
      brands.push({
        brand: 'JS Industries',
        model: 'Monsta Box',
        volume: rec.volume + 1,
        length: rec.length,
        width: rec.width,
        thickness: rec.thickness,
        description: 'Tabla versátil para diferentes condiciones',
        priceRange: '$700-1000',
        bestFor: ['Olas de 2-5 pies', 'Surfistas intermedios', 'Versatilidad']
      });
    } else if (rec.style === 'fish') {
      brands.push({
        brand: 'Sharp Eye',
        model: 'Disco Inferno',
        volume: rec.volume,
        length: rec.length,
        width: rec.width,
        thickness: rec.thickness,
        description: 'Fish moderna para olas pequeñas y cerradas',
        priceRange: '$600-900',
        bestFor: ['Olas de 1-3 pies', 'Surfistas intermedios', 'Velocidad']
      });
      brands.push({
        brand: 'Hypto Krypto',
        model: 'Hypto Krypto',
        volume: rec.volume + 0.5,
        length: rec.length,
        width: rec.width,
        thickness: rec.thickness,
        description: 'Híbrida versátil para múltiples condiciones',
        priceRange: '$650-950',
        bestFor: ['Olas de 1-4 pies', 'Surfistas intermedios', 'Adaptabilidad']
      });
    } else if (rec.style === 'longboard') {
      brands.push({
        brand: 'Rusty',
        model: 'Dwight Yoakam',
        volume: rec.volume,
        length: rec.length,
        width: rec.width,
        thickness: rec.thickness,
        description: 'Longboard clásico para olas pequeñas',
        priceRange: '$800-1200',
        bestFor: ['Olas de 0-3 pies', 'Surfistas principiantes-intermedios', 'Estabilidad']
      });
    }

    setBrandRecommendations(brands);
  };

  const generateLocalShaperSpecs = (rec: SurfboardRecommendation) => {
    const widthValue = parseFloat(rec.width.replace('"', '')); // Remover las comillas para obtener el número
    
    const specs: LocalShaperSpecs = {
      volume: rec.volume,
      length: rec.length,
      width: rec.width,
      thickness: rec.thickness,
      noseWidth: `${(widthValue * 0.8).toFixed(1)}"`,
      tailWidth: `${(widthValue * 0.7).toFixed(1)}"`,
      rocker: rec.waveSize === '0-2' ? 'Bajo (para velocidad)' : 
              rec.waveSize === '6+' ? 'Alto (para control)' : 'Moderado',
      finSetup: rec.style === 'fish' ? 'Quad (4 quillas)' : 'Thruster (3 quillas)',
      materials: ['EPS Foam', 'Epoxy Resin', 'Fiberglass'],
      finishing: ['Gloss Finish', 'Rail Tape', 'Traction Pad']
    };

    setLocalShaperSpecs(specs);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Formulario */}
        <Card className="border-2 border-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Waves className="w-5 h-5 text-blue-600" />
              Información del Surfista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="level">Nivel de Surf</Label>
              <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona tu nivel" />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="waveSize">Tamaño de Olas</Label>
              <Select value={formData.waveSize} onValueChange={(value) => handleInputChange('waveSize', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tamaño de olas donde surfearás" />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  <SelectItem value="0-2">0-2 pies (Olas pequeñas)</SelectItem>
                  <SelectItem value="2-4">2-4 pies (Olas medianas)</SelectItem>
                  <SelectItem value="4-6">4-6 pies (Olas grandes)</SelectItem>
                  <SelectItem value="6+">6+ pies (Olas muy grandes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="style">Estilo de Surfing</Label>
              <Select value={formData.style} onValueChange={(value) => handleInputChange('style', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo de tabla preferida" />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  <SelectItem value="longboard">Longboard</SelectItem>
                  <SelectItem value="funboard">Funboard</SelectItem>
                  <SelectItem value="shortboard">Shortboard</SelectItem>
                  <SelectItem value="fish">Fish</SelectItem>
                  <SelectItem value="gun">Gun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={calculateSurfboard} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
              disabled={loading || !formData.weight || !formData.height || !formData.level || !formData.waveSize || !formData.style}
            >
              {loading ? 'Consultando...' : 'Consultar'}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="space-y-4">
          {recommendation && (
            <>
              {/* Medidas Recomendadas */}
              <Card className="border-2 border-green-100">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Ruler className="w-5 h-5 text-green-600" />
                    Medidas Recomendadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{recommendation.volume}L</div>
                      <div className="text-xs text-gray-600">Volumen</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{recommendation.length}'</div>
                      <div className="text-xs text-gray-600">Longitud</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">{recommendation.width}"</div>
                      <div className="text-xs text-gray-600">Ancho</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">{recommendation.thickness}"</div>
                      <div className="text-xs text-gray-600">Grosor</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {recommendation.level.charAt(0).toUpperCase() + recommendation.level.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {recommendation.waveSize} pies
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {recommendation.style.charAt(0).toUpperCase() + recommendation.style.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs con Recomendaciones */}
              <Tabs defaultValue="brands" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="brands">Marcas Famosas</TabsTrigger>
                  <TabsTrigger value="shaper">Shaper Local</TabsTrigger>
                </TabsList>
                
                <TabsContent value="brands" className="space-y-4">
                  {brandRecommendations.map((brand, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          {brand.brand} - {brand.model}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-3">{brand.description}</p>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-gray-500">Volumen</div>
                            <div className="font-semibold">{brand.volume}L</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Precio</div>
                            <div className="font-semibold">{brand.priceRange}</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Ideal para:</div>
                          <div className="flex flex-wrap gap-1">
                            {brand.bestFor.map((item, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="shaper" className="space-y-4">
                  {localShaperSpecs && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-red-600" />
                          Especificaciones para Shaper Local
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Volumen</div>
                            <div className="font-semibold">{localShaperSpecs.volume}L</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Longitud</div>
                            <div className="font-semibold">{localShaperSpecs.length}'</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Ancho</div>
                            <div className="font-semibold">{localShaperSpecs.width}"</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Grosor</div>
                            <div className="font-semibold">{localShaperSpecs.thickness}"</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Ancho Nose</div>
                            <div className="font-semibold">{localShaperSpecs.noseWidth}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Ancho Tail</div>
                            <div className="font-semibold">{localShaperSpecs.tailWidth}</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Configuración:</div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-gray-500">Rocker: </span>
                              <span className="font-semibold">{localShaperSpecs.rocker}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Fin Setup: </span>
                              <span className="font-semibold">{localShaperSpecs.finSetup}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Materiales Recomendados:</div>
                          <div className="flex flex-wrap gap-1">
                            {localShaperSpecs.materials.map((material, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Acabados:</div>
                          <div className="flex flex-wrap gap-1">
                            {localShaperSpecs.finishing.map((finish, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {finish}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
