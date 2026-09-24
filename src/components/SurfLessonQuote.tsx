"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  AlertCircle,
  MessageCircle
} from 'lucide-react';

interface SurfLessonQuoteProps {
  compact?: boolean;
  className?: string;
}

// Precio fijo por persona por día. Sin descuentos por grupo ni por paquete de días.
const PRICE_PER_PERSON_PER_DAY = 70;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
// Acepta formatos internacionales: se valida solo la cantidad de dígitos.
const isValidPhone = (value: string) => value.replace(/\D/g, '').length >= 8;

export default function SurfLessonQuote({ compact = false, className = '' }: SurfLessonQuoteProps) {
  const [lessonType, setLessonType] = useState<'private' | 'group'>('group');
  const [people, setPeople] = useState(1);
  const [days, setDays] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const calculation = useMemo(() => ({
    pricePerPerson: PRICE_PER_PERSON_PER_DAY,
    totalPrice: PRICE_PER_PERSON_PER_DAY * people * days,
  }), [people, days]);

  const validation = useMemo(() => {
    const name = customerName.trim();
    const email = customerEmail.trim();
    const phone = customerPhone.trim();

    return {
      nameOk: name.length >= 2,
      emailFormatOk: email.length === 0 || isValidEmail(email),
      phoneFormatOk: phone.length === 0 || isValidPhone(phone),
      hasContact: (email.length > 0 && isValidEmail(email)) || (phone.length > 0 && isValidPhone(phone)),
    };
  }, [customerName, customerEmail, customerPhone]);

  const canSubmit = validation.nameOk && validation.hasContact;

  const errorMessage = !validation.nameOk
    ? 'Escribe tu nombre para poder identificar tu reserva.'
    : !validation.emailFormatOk
      ? 'El correo no tiene un formato válido.'
      : !validation.phoneFormatOk
        ? 'El teléfono debe tener al menos 8 dígitos.'
        : !validation.hasContact
          ? 'Necesitamos un correo o un número de teléfono para contactarte.'
          : '';

  const handleReservation = async () => {
    if (!canSubmit) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);
    setIsSending(true);
    setSendStatus('idle');

    const quoteData = {
      lessonType,
      people,
      days,
      pricePerPerson: calculation.pricePerPerson,
      totalPrice: calculation.totalPrice,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined
    };

    try {
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData)
      });

      const data = await response.json();

      if (response.ok) {
        setSendStatus('success');

        // Open WhatsApp with pre-filled message
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank');
        }

        // Reset form after 5 seconds (longer to let user see success)
        setTimeout(() => {
          setSendStatus('idle');
          setCustomerName('');
          setCustomerEmail('');
          setCustomerPhone('');
        }, 5000);
      } else {
        setSendStatus('error');
        setTimeout(() => setSendStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      // Even if API fails, try to open WhatsApp as fallback
      const tipoClase = lessonType === 'private' ? 'Privada' : 'Grupal';
      const fallbackMsg = [
        `🏄 *Nueva Cotización - Santa Teresa Surf Cam*`,
        ``,
        `👤 *Cliente:* ${customerName.trim()}`,
        customerEmail.trim() ? `📧 *Email:* ${customerEmail.trim()}` : '',
        customerPhone.trim() ? `📱 *Teléfono:* ${customerPhone.trim()}` : '',
        ``,
        `📋 *Detalles:*`,
        `• Tipo: ${tipoClase}`,
        `• Personas: ${people}`,
        `• Días: ${days}`,
        `• Precio/persona/día: $${calculation.pricePerPerson}`,
        ``,
        `💰 *Total: $${calculation.totalPrice} USD*`,
      ].filter(Boolean).join('\n');
      window.open(`https://wa.me/50662681168?text=${encodeURIComponent(fallbackMsg)}`, '_blank');

      setSendStatus('error');
      setTimeout(() => setSendStatus('idle'), 3000);
    } finally {
      setIsSending(false);
    }
  };

  if (compact) {
    return (
      <Card className={`rounded-2xl border-[rgba(160,205,235,0.1)] bg-[linear-gradient(180deg,rgba(13,30,44,0.8),rgba(7,17,27,0.8))] backdrop-blur-[14px] ${className}`}>
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
            <div className="text-xs text-muted-foreground mt-1">
              ${calculation.pricePerPerson}/persona/día · precio fijo
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Tu nombre *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              aria-invalid={showErrors && !validation.nameOk}
              className="bg-white/5 border-white/10 focus:border-cyan-500 text-sm"
            />
            <Input
              type="email"
              inputMode="email"
              placeholder="tu@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              aria-invalid={showErrors && !validation.emailFormatOk}
              className="bg-white/5 border-white/10 focus:border-cyan-500 text-sm"
            />
            <Input
              type="tel"
              inputMode="tel"
              placeholder="+506 8888 8888"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              aria-invalid={showErrors && !validation.phoneFormatOk}
              className="bg-white/5 border-white/10 focus:border-cyan-500 text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Obligatorio: correo <span className="text-cyan-400">o</span> teléfono para contactarte.
            </p>
          </div>

          {showErrors && errorMessage && (
            <p role="alert" className="flex items-start gap-2 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </p>
          )}

          {/* CTA Button */}
          <Button
            onClick={handleReservation}
            disabled={isSending}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : sendStatus === 'success' ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                ¡Enviado por WhatsApp!
              </>
            ) : sendStatus === 'error' ? (
              <>
                <MessageCircle className="h-4 w-4 mr-2" />
                Reintentar
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4 mr-2" />
                Cotizar por WhatsApp
              </>
            )}
          </Button>
          {sendStatus === 'error' && (
            <p className="text-xs text-red-400 text-center">Error al enviar email, pero se abrió WhatsApp.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full version for surf-lessons page
  return (
    <Card className={`rounded-2xl border-[rgba(160,205,235,0.1)] bg-[linear-gradient(180deg,rgba(13,30,44,0.8),rgba(7,17,27,0.8))] backdrop-blur-[14px] overflow-hidden ${className}`}>
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
              <div className="text-xs text-muted-foreground">$70/persona</div>
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
              <div className="text-xs text-muted-foreground">$70/clase</div>
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
        </div>

        {/* Price Summary */}
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-6 space-y-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Total a Pagar</div>
            <div className="text-5xl font-bold text-cyan-400">
              ${calculation.totalPrice}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tarifa única de ${PRICE_PER_PERSON_PER_DAY} por persona, por día
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">${calculation.pricePerPerson}</div>
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

        {/* Customer Contact Info (required) */}
        <div className="space-y-3 bg-white/5 rounded-xl p-4">
          <Label className="text-sm font-semibold">Tus datos de contacto</Label>
          <p className="text-xs text-muted-foreground">
            Déjanos tu <span className="text-cyan-400">correo o tu teléfono</span> (al menos uno) para confirmarte la reserva.
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="customer-name" className="text-xs">Nombre *</Label>
              <Input
                id="customer-name"
                type="text"
                placeholder="Tu nombre"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                aria-invalid={showErrors && !validation.nameOk}
                className="bg-white/5 border-white/10 focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer-email" className="text-xs flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-cyan-400" />
                Email
              </Label>
              <Input
                id="customer-email"
                type="email"
                inputMode="email"
                placeholder="tu@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                aria-invalid={showErrors && !validation.emailFormatOk}
                className="bg-white/5 border-white/10 focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer-phone" className="text-xs flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-cyan-400" />
                Teléfono / WhatsApp
              </Label>
              <Input
                id="customer-phone"
                type="tel"
                inputMode="tel"
                placeholder="+506 8888 8888"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                aria-invalid={showErrors && !validation.phoneFormatOk}
                className="bg-white/5 border-white/10 focus:border-cyan-500"
              />
            </div>
          </div>

          {showErrors && errorMessage && (
            <p role="alert" className="flex items-start gap-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {errorMessage}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleReservation}
          disabled={isSending}
          size="lg"
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg h-14 disabled:opacity-50"
        >
          {isSending ? (
            <>
              <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Enviando cotización...
            </>
          ) : sendStatus === 'success' ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              ¡Enviado por WhatsApp!
            </>
          ) : sendStatus === 'error' ? (
            <>
              <MessageCircle className="h-5 w-5 mr-2" />
              Reintentar envío
            </>
          ) : (
            <>
              <MessageCircle className="h-5 w-5 mr-2" />
              Cotizar por WhatsApp
            </>
          )}
        </Button>

        {sendStatus === 'success' && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-sm text-green-400">
              ¡Cotización enviada! Se abrió WhatsApp para continuar la conversación.
            </p>
          </div>
        )}

        {sendStatus === 'error' && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
            <p className="text-sm text-yellow-400">
              Error al enviar email de respaldo, pero se abrió WhatsApp para tu cotización.
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
