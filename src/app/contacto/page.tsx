"use client";

import { useState } from "react";
import SimpleHeader from "@/components/SimpleHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageCircle, CreditCard, User, Building2, CheckCircle } from "lucide-react";

export default function ContactoPage() {
  const [selectedPlan, setSelectedPlan] = useState<'individual' | 'business' | null>(null);

  const handleWhatsAppContact = (plan: 'individual' | 'business') => {
    const message = plan === 'individual' 
      ? "Hola! Me interesa el plan individual de La Lora Surf Cam por $5/mes. ¿Cómo puedo proceder con el pago por SINPE?"
      : "Hola! Me interesa el plan de negocios para La Lora Surf Cam. ¿Podrían proporcionarme más información?";
    
    const whatsappUrl = `https://wa.me/50662765617?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailContact = () => {
    const subject = "Consulta Plan de Negocios - La Lora Surf Cam";
    const body = "Hola,\n\nMe interesa obtener más información sobre el plan de negocios para La Lora Surf Cam.\n\nSaludos cordiales.";
    const mailtoUrl = `mailto:josephquesada92@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SimpleHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Planes Premium</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Desbloquea acceso ilimitado a La Lora Surf Cam y disfruta de las mejores olas sin interrupciones
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Individual Plan */}
            <Card className={`relative transition-all duration-300 hover:shadow-lg ${
              selectedPlan === 'individual' ? 'ring-2 ring-primary' : ''
            }`}>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Plan Individual</CardTitle>
                <CardDescription>Perfecto para surfistas y entusiastas</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">$5</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Acceso ilimitado 24/7</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Sin interrupciones</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Calidad HD</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Soporte prioritario</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => handleWhatsAppContact('individual')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Pagar por WhatsApp
                </Button>
                <div className="mt-3 text-center">
                  <Badge variant="secondary" className="text-xs">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Pago por SINPE
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className={`relative transition-all duration-300 hover:shadow-lg ${
              selectedPlan === 'business' ? 'ring-2 ring-primary' : ''
            }`}>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Plan de Negocios</CardTitle>
                <CardDescription>Ideal para hoteles, restaurantes y empresas</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">Personalizado</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Múltiples pantallas</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Integración personalizada</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Soporte dedicado</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Contrato personalizado</span>
                  </li>
                </ul>
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleWhatsAppContact('business')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contactar por WhatsApp
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleEmailContact}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contactar por Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Instructions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Instrucciones de Pago - Plan Individual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Realiza el pago por SINPE</h4>
                    <p className="text-sm text-muted-foreground">
                      Transfiere $5 USD (o su equivalente en colones) al número de SINPE que te proporcionaremos.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Envía el comprobante</h4>
                    <p className="text-sm text-muted-foreground">
                      Toma una captura de pantalla del comprobante de pago y envíalo por WhatsApp al +506 6276 5617.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Recibe tu acceso</h4>
                    <p className="text-sm text-muted-foreground">
                      Una vez confirmado el pago, te activaremos tu cuenta premium inmediatamente.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

                     {/* Contact Information */}
           <Card className="mb-8">
             <CardHeader>
               <CardTitle>Información de Contacto</CardTitle>
               <CardDescription>
                 ¿Tienes preguntas? No dudes en contactarnos
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                   <h4 className="font-semibold flex items-center">
                     <MessageCircle className="h-4 w-4 mr-2" />
                     WhatsApp
                   </h4>
                   <p className="text-sm text-muted-foreground">
                     Para pagos y consultas rápidas
                   </p>
                   <Button 
                     variant="outline" 
                     onClick={() => handleWhatsAppContact('individual')}
                     className="w-full"
                   >
                     +506 6276 5617
                   </Button>
                 </div>
                 <div className="space-y-4">
                   <h4 className="font-semibold flex items-center">
                     <Mail className="h-4 w-4 mr-2" />
                     Email
                   </h4>
                   <p className="text-sm text-muted-foreground">
                     Para consultas de negocios
                   </p>
                   <Button 
                     variant="outline" 
                     onClick={handleEmailContact}
                     className="w-full"
                   >
                     josephquesada92@gmail.com
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>

           {/* Powered By */}
           <div className="text-center text-sm text-muted-foreground mt-8">
             <p>
               Desarrollado por{' '}
               <a
                 href="https://www.wedoitwithai.com"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-primary hover:underline font-semibold"
               >
                 We Do It With AI
               </a>
             </p>
           </div>
        </div>
      </main>
    </div>
  );
}
