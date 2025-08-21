import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CondicionesServicio() {
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
            Condiciones del Servicio
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los Términos</h2>
            <p className="mb-4">
              Al acceder y utilizar <strong>SurfCam</strong>, aceptas estar sujeto a estas Condiciones del Servicio. 
              Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Descripción del Servicio</h2>
            <p className="mb-4">
              <strong>SurfCam</strong> es una aplicación web que proporciona:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Transmisión en vivo de la cámara de surf de La Lora</li>
              <li>Chat público para comunicación entre usuarios</li>
              <li>Información sobre mareas y condiciones del surf</li>
              <li>Enlaces a servicios relacionados (clases de surf, hospedaje, restaurantes)</li>
              <li>Acceso premium con funcionalidades extendidas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Uso Aceptable</h2>
            <p className="mb-4">
              Al utilizar nuestro servicio, te comprometes a:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Usar el servicio solo para fines legales y apropiados</li>
              <li>No interferir con el funcionamiento del servicio</li>
              <li>No intentar acceder a áreas restringidas del sistema</li>
              <li>Respetar los derechos de otros usuarios</li>
              <li>No compartir información de acceso con terceros</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Conducta en el Chat</h2>
            <p className="mb-4">
              En el chat público, está prohibido:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Enviar mensajes ofensivos, abusivos o discriminatorios</li>
              <li>Spam o mensajes comerciales no solicitados</li>
              <li>Información personal de otros usuarios</li>
              <li>Contenido ilegal o inapropiado</li>
              <li>Suplantación de identidad</li>
            </ul>
            <p className="mb-4">
              Nos reservamos el derecho de moderar el chat y suspender usuarios que violen estas reglas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Límites de Uso</h2>
            <p className="mb-4">
              <strong>Usuarios gratuitos:</strong> Acceso limitado a la transmisión en vivo por 1 minuto.
            </p>
            <p className="mb-4">
              <strong>Usuarios premium:</strong> Acceso ilimitado a todas las funcionalidades.
            </p>
            <p className="mb-4">
              Nos reservamos el derecho de modificar estos límites con previo aviso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Propiedad Intelectual</h2>
            <p className="mb-4">
              Todo el contenido de <strong>SurfCam</strong>, incluyendo pero no limitado a:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Diseño y funcionalidad de la aplicación</li>
              <li>Logotipos y marcas comerciales</li>
              <li>Contenido de texto y multimedia</li>
              <li>Código fuente y software</li>
            </ul>
            <p className="mb-4">
              Está protegido por derechos de autor y otras leyes de propiedad intelectual. 
              No está permitida la reproducción, distribución o modificación sin autorización.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Disponibilidad del Servicio</h2>
            <p className="mb-4">
              Nos esforzamos por mantener el servicio disponible 24/7, pero no garantizamos:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Disponibilidad ininterrumpida del servicio</li>
              <li>Calidad constante de la transmisión</li>
              <li>Acceso sin interrupciones técnicas</li>
            </ul>
            <p className="mb-4">
              El servicio puede estar sujeto a mantenimiento programado o interrupciones por causas técnicas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitación de Responsabilidad</h2>
            <p className="mb-4">
              <strong>SurfCam</strong> no será responsable por:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Daños indirectos o consecuenciales</li>
              <li>Pérdida de datos o información</li>
              <li>Interrupciones del servicio</li>
              <li>Acciones de terceros usuarios</li>
              <li>Problemas técnicos fuera de nuestro control</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Enlaces Externos</h2>
            <p className="mb-4">
              Nuestra aplicación puede contener enlaces a sitios web de terceros. 
              No somos responsables del contenido, políticas de privacidad o prácticas de estos sitios externos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Modificaciones</h2>
            <p className="mb-4">
              Nos reservamos el derecho de modificar estas condiciones en cualquier momento. 
              Los cambios entrarán en vigor inmediatamente después de su publicación en la aplicación.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Terminación</h2>
            <p className="mb-4">
              Podemos suspender o terminar tu acceso al servicio en cualquier momento por:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Violación de estos términos</li>
              <li>Uso inapropiado del servicio</li>
              <li>Actividad fraudulenta</li>
              <li>Razones técnicas o de seguridad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Ley Aplicable</h2>
            <p className="mb-4">
              Estas condiciones se rigen por las leyes de Costa Rica. 
              Cualquier disputa será resuelta en los tribunales competentes de Costa Rica.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contacto</h2>
            <p className="mb-4">
              Si tienes preguntas sobre estas condiciones del servicio, puedes contactarnos:
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
