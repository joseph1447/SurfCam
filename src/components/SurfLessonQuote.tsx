"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Calculator,
  Users,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
  Minus,
  Plus,
  Waves,
  Sparkles
} from 'lucide-react';

interface SurfLessonQuoteProps {
  compact?: boolean;
  className?: string;
}

// Pricing structure - rounded prices
const PRICING = {
  private: {
    perPerson: 80,
    maxPeople: 1,
  },
  group: {
    // Price per lesson based on number of people (rounded)
    1: 70,    // $70
    2: 120,   // total ($60 c/u)
    3: 180,   // total ($60 c/u)
    4: 240,   // 4 x $60
  },
  // Package discounts (price per person per day) - rounded
  packages: {
    1: null,  // no discount for single day
    2: 65,    // $65/person/day
    3: 65,    // $65/person/day
    4: 60,    // $60/person/day
    5: 55,    // $55/person/day
  }
};

export default function SurfLessonQuote({ compact = false, className = '' }: SurfLessonQuoteProps) {
  const [lessonType, setLessonType] = useState<'private' | 'group'>('group');
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const calculation = useMemo(() => {
    let pricePerDay = 0;
    let totalPrice = 0;
    let pricePerPerson = 0;
    let savings = 0;
    let originalPrice = 0;

    if (lessonType === 'private') {
      // Private lessons: $80 per person per day
      pricePerDay = PRICING.private.perPerson;
      pricePerPerson = PRICING.private.perPerson;

      // Calculate with package discount
      if (days >= 5) {
        pricePerPerson = PRICING.packages[5]!;
      } else if (days >= 4) {
        pricePerPerson = PRICING.packages[4]!;
      } else if (days >= 2) {
        pricePerPerson = PRICING.packages[2]!;
      }

      originalPrice = PRICING.private.perPerson * days;
      totalPrice = pricePerPerson * days;
      savings = originalPrice - totalPrice;
    } else {
      // Group lessons
      const peopleKey = Math.min(people, 4) as 1 | 2 | 3 | 4;

      if (people <= 3) {
        pricePerDay = PRICING.group[peopleKey];
      } else {
        // 4+ people: $60 per person
        pricePerDay = people * 60;
      }

      pricePerPerson = pricePerDay / people;

      // Apply package discount for multiple days
      if (days >= 2) {
        let discountedPricePerPerson: number;
        if (days >= 5) {
          discountedPricePerPerson = PRICING.packages[5]!;
        } else if (days >= 4) {
          discountedPricePerPerson = PRICING.packages[4]!;
        } else {
          discountedPricePerPerson = PRICING.packages[2]!;
        }

        originalPrice = pricePerDay * days;
        totalPrice = discountedPricePerPerson * people * days;
        pricePerPerson = discountedPricePerPerson;
        savings = originalPrice - totalPrice;
      } else {
        originalPrice = pricePerDay;
        totalPrice = pricePerDay;
      }
    }

    return {
      pricePerDay,
      totalPrice,
      pricePerPerson,
      savings,
      originalPrice,
    };
  }, [lessonType, people, days]);

  const handleReservation = async () => {
    setIsSending(true);
    setSendStatus('idle');

    try {
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonType,
          people,
          days,
          pricePerPerson: calculation.pricePerPerson.toFixed(0),
          totalPrice: calculation.totalPrice,
          savings: calculation.savings,
          customerName: customerName.trim() || undefined,
          customerEmail: customerEmail.trim() || undefined
        })
      });

      if (response.ok) {
        setSendStatus('success');
        // Reset form after 3 seconds
        setTimeout(() => {
          setSendStatus('idle');
          setCustomerName('');
          setCustomerEmail('');
        }, 3000);
      } else {
        setSendStatus('error');
        setTimeout(() => setSendStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      setSendStatus('error');
      setTimeout(() => setSendStatus('idle'), 3000);
    } finally {
      setIsSending(false);
    }
  };

  if (compact) {
    return (
      <Card className={`border-cyan-500/30 bg-gradient-to-br from-[#0d1117]/95 to-[#161b22]/95 backdrop-blur-md ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-cyan-400" />
            Cotiza tu Clase de Surf
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lesson Type Toggle */}
          <div className="flex gap-2">
            <Button
              variant={lessonType === 'group' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLessonType('group')}
              className={lessonType === 'group'
                ? 'flex-1 bg-cyan-600 hover:bg-cyan-700'
                : 'flex-1 border-cyan-500/30 hover:bg-cyan-500/10'}
            >
              <Users className="h-4 w-4 mr-1" />
              Grupal
            </Button>
            <Button
              variant={lessonType === 'private' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setLessonType('private'); setPeople(1); }}
              className={lessonType === 'private'
                ? 'flex-1 bg-cyan-600 hover:bg-cyan-700'
                : 'flex-1 border-cyan-500/30 hover:bg-cyan-500/10'}
            >
              Privada
            </Button>
          </div>

          {/* Controls Row */}
          <div className="flex gap-4">
            {lessonType === 'group' && (
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Personas</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-cyan-500/30"
                    onClick={() => setPeople(Math.max(1, people - 1))}
                    disabled={people <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-bold text-cyan-400">{people}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-cyan-500/30"
                    onClick={() => setPeople(Math.min(10, people + 1))}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Días</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-cyan-500/30"
                  onClick={() => setDays(Math.max(1, days - 1))}
                  disabled={days <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-bold text-cyan-400">{days}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-cyan-500/30"
                  onClick={() => setDays(Math.min(7, days + 1))}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Price Display */}
          <div className="bg-cyan-500/10 rounded-lg p-3 text-center">
            <div className="text-3xl font-bold text-cyan-400">
              ${calculation.totalPrice}
            </div>
            {calculation.savings > 0 && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs line-through text-muted-foreground">${calculation.originalPrice}</span>
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  Ahorras ${calculation.savings}
                </Badge>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              ${calculation.pricePerPerson.toFixed(0)}/persona/día
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Tu nombre"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-white/5 border-white/10 focus:border-cyan-500 text-sm"
            />
            <Input
              type="email"
              placeholder="tu@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="bg-white/5 border-white/10 focus:border-cyan-500 text-sm"
            />
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleReservation}
            disabled={isSending || !customerName.trim() || !customerEmail.trim()}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : sendStatus === 'success' ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                ¡Enviado!
              </>
            ) : sendStatus === 'error' ? (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Reintentar
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Enviar Cotización
              </>
            )}
          </Button>
          {sendStatus === 'error' && (
            <p className="text-xs text-red-400 text-center">Error al enviar. Por favor intenta de nuevo.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full version for surf-lessons page
  return (
    <Card className={`border-cyan-500/30 bg-gradient-to-br from-[#0d1117]/95 to-[#161b22]/95 backdrop-blur-md overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <CardHeader className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
            <Calculator className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <CardTitle className="text-2xl">Cotizador de Clases</CardTitle>
            <p className="text-sm text-muted-foreground">Calcula el precio de tu experiencia</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative">
        {/* Lesson Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Tipo de Clase</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLessonType('group')}
              className={`p-4 rounded-xl border-2 transition-all ${
                lessonType === 'group'
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-white/10 hover:border-cyan-500/50'
              }`}
            >
              <Users className={`h-6 w-6 mx-auto mb-2 ${lessonType === 'group' ? 'text-cyan-400' : 'text-muted-foreground'}`} />
              <div className={`font-semibold ${lessonType === 'group' ? 'text-cyan-400' : ''}`}>Grupal</div>
              <div className="text-xs text-muted-foreground">Desde $55/persona</div>
            </button>
            <button
              onClick={() => { setLessonType('private'); setPeople(1); }}
              className={`p-4 rounded-xl border-2 transition-all ${
                lessonType === 'private'
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-white/10 hover:border-cyan-500/50'
              }`}
            >
              <Waves className={`h-6 w-6 mx-auto mb-2 ${lessonType === 'private' ? 'text-cyan-400' : 'text-muted-foreground'}`} />
              <div className={`font-semibold ${lessonType === 'private' ? 'text-cyan-400' : ''}`}>Privada</div>
              <div className="text-xs text-muted-foreground">$80/clase</div>
            </button>
          </div>
        </div>

        {/* Number of People */}
        {lessonType === 'group' && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              Número de Personas
            </Label>
            <div className="flex items-center justify-center gap-4 bg-white/5 rounded-xl p-4">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-cyan-500/30 hover:bg-cyan-500/20"
                onClick={() => setPeople(Math.max(1, people - 1))}
                disabled={people <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[80px]">
                <span className="text-4xl font-bold text-cyan-400">{people}</span>
                <p className="text-xs text-muted-foreground">
                  {people === 1 ? 'persona' : 'personas'}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-cyan-500/30 hover:bg-cyan-500/20"
                onClick={() => setPeople(Math.min(10, people + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {people >= 4 && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-400">
                <Sparkles className="h-4 w-4" />
                <span>Precio especial para grupos de 4+</span>
              </div>
            )}
          </div>
        )}

        {/* Number of Days */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-400" />
            Número de Días
          </Label>
          <div className="flex items-center justify-center gap-4 bg-white/5 rounded-xl p-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-cyan-500/30 hover:bg-cyan-500/20"
              onClick={() => setDays(Math.max(1, days - 1))}
              disabled={days <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[80px]">
              <span className="text-4xl font-bold text-cyan-400">{days}</span>
              <p className="text-xs text-muted-foreground">
                {days === 1 ? 'día' : 'días'}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-cyan-500/30 hover:bg-cyan-500/20"
              onClick={() => setDays(Math.min(7, days + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {days >= 2 && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-400">
              <Sparkles className="h-4 w-4" />
              <span>
                {days >= 5 ? 'Máximo descuento: $55/persona/día' :
                 days >= 4 ? 'Descuento aplicado: $60/persona/día' :
                 'Descuento aplicado: $65/persona/día'}
              </span>
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-6 space-y-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Total a Pagar</div>
            <div className="text-5xl font-bold text-cyan-400">
              ${calculation.totalPrice}
            </div>
            {calculation.savings > 0 && (
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-lg line-through text-muted-foreground">${calculation.originalPrice}</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Ahorras ${calculation.savings}
                </Badge>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">${calculation.pricePerPerson.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">por persona/día</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{people * days}</div>
              <div className="text-xs text-muted-foreground">clases totales</div>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Incluido en tu clase:</Label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>Tabla de surf</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>Instructor experto</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>Equipo completo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>1.5 hrs de clase</span>
            </div>
          </div>
        </div>

        {/* Customer Contact Info (Optional) */}
        <div className="space-y-3 bg-white/5 rounded-xl p-4">
          <Label className="text-sm font-semibold">Tu información (opcional)</Label>
          <p className="text-xs text-muted-foreground">
            Déjanos tu contacto para enviarte una confirmación
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="customer-name" className="text-xs">Nombre</Label>
              <Input
                id="customer-name"
                type="text"
                placeholder="Tu nombre"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer-email" className="text-xs">Email</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="tu@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleReservation}
          disabled={isSending}
          size="lg"
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-lg h-14 disabled:opacity-50"
        >
          {isSending ? (
            <>
              <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Enviando cotización...
            </>
          ) : sendStatus === 'success' ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              ¡Cotización enviada!
            </>
          ) : sendStatus === 'error' ? (
            <>
              <Mail className="h-5 w-5 mr-2" />
              Reintentar envío
            </>
          ) : (
            <>
              <Mail className="h-5 w-5 mr-2" />
              Enviar Cotización
            </>
          )}
        </Button>

        {sendStatus === 'success' && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-sm text-green-400">
              ¡Cotización enviada exitosamente! Te contactaremos pronto.
            </p>
          </div>
        )}

        {sendStatus === 'error' && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
            <p className="text-sm text-red-400">
              Error al enviar la cotización. Por favor intenta de nuevo.
            </p>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Instructores locales con años de experiencia
        </p>
      </CardContent>
    </Card>
  );
}
