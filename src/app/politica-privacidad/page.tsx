import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              ← Volver a SurfCam
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Información que Recopilamos</h2>
            <p className="mb-4">
              En <strong>SurfCam</strong> recopilamos la siguiente información para proporcionar nuestros servicios:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Información de contacto:</strong> Tu dirección de correo electrónico cuando te registras como invitado o usas el acceso premium.</li>
              <li><strong>Información de Google:</strong> Si eliges iniciar sesión con Google, recopilamos tu nombre y foto de perfil de tu cuenta de Google.</li>
              <li><strong>Datos de uso:</strong> Información sobre cómo utilizas nuestra aplicación, incluyendo el tiempo de visualización y las interacciones en el chat.</li>
              <li><strong>Mensajes del chat:</strong> Los mensajes que envías en el chat público de la aplicación.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Cómo Utilizamos tu Información</h2>
            <p className="mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Gestionar tu acceso a la transmisión en vivo</li>
              <li>Controlar el estado premium y los límites de tiempo para usuarios gratuitos</li>
              <li>Facilitar la comunicación en el chat público</li>
              <li>Mejorar nuestros servicios y la experiencia del usuario</li>
              <li>Enviar códigos de acceso temporales para usuarios invitados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Compartir Información</h2>
            <p className="mb-4">
              <strong>No vendemos, alquilamos ni compartimos tu información personal con terceros</strong>, excepto en las siguientes circunstancias:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Cuando es necesario para proporcionar nuestros servicios</li>
              <li>Cuando es requerido por ley o para proteger nuestros derechos</li>
              <li>Con tu consentimiento explícito</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Seguridad de Datos</h2>
            <p className="mb-4">
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Retención de Datos</h2>
            <p className="mb-4">
              Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera un período de retención más largo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Tus Derechos</h2>
            <p className="mb-4">
              Tienes derecho a:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Acceder a la información personal que tenemos sobre ti</li>
              <li>Corregir información inexacta o incompleta</li>
              <li>Solicitar la eliminación de tus datos personales</li>
              <li>Oponerte al procesamiento de tu información personal</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies y Tecnologías Similares</h2>
            <p className="mb-4">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestra aplicación. Puedes controlar el uso de cookies a través de la configuración de tu navegador.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Cambios a esta Política</h2>
            <p className="mb-4">
              Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cualquier cambio significativo publicando la nueva política en esta página.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contacto</h2>
            <p className="mb-4">
              Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tu información personal, puedes contactarnos:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:info@surf-cam-one.vercel.app" className="text-primary hover:underline">
                  info@surf-cam-one.vercel.app
                </a>
              </p>
              <p className="mb-2">
                <strong>Sitio web:</strong>{' '}
                <a href="https://surf-cam-one.vercel.app" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  https://surf-cam-one.vercel.app
                </a>
              </p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <Link href="/">
              <Button className="w-full">
                ← Volver a SurfCam
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
