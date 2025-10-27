import type { Metadata } from 'next';
import SurfboardCalculator from '@/components/SurfboardCalculator';

export const metadata: Metadata = {
  title: 'Calculadora de Tabla de Surf | Encuentra tu Tabla Ideal',
  description: 'Calcula el volumen, medidas y encuentra la tabla de surf perfecta para tu peso, altura y nivel. Recomendaciones de marcas famosas como Channel Islands, JS, Sharp Eye y guía para shaper local.',
  keywords: [
    'calculadora tabla surf',
    'volumen tabla surf',
    'medidas tabla surf',
    'tabla surf ideal',
    'surfboard calculator',
    'surfboard sizing',
    'tabla surf peso altura',
    'nivel surf tabla',
    'Channel Islands',
    'JS Industries',
    'Sharp Eye',
    'Rusty',
    'shaper local',
    'tabla surf personalizada',
    'surfboard volume',
    'tabla surf principiante',
    'tabla surf avanzado',
    'fish surfboard',
    'longboard',
    'shortboard',
    'funboard',
    'gun surfboard'
  ],
  openGraph: {
    title: 'Calculadora de Tabla de Surf | Encuentra tu Tabla Ideal',
    description: 'Calcula el volumen, medidas y encuentra la tabla de surf perfecta para tu peso, altura y nivel. Recomendaciones de marcas famosas y guía para shaper local.',
    url: 'https://santateresasurfcam.com/calculadora-tabla-surf',
    siteName: 'Santa Teresa Surf Cam',
    locale: 'es_CR',
    type: 'website',
    images: [
      {
        url: '/wave-128.png',
        width: 128,
        height: 128,
        alt: 'Calculadora de Tabla de Surf',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Tabla de Surf | Encuentra tu Tabla Ideal',
    description: 'Calcula el volumen, medidas y encuentra la tabla de surf perfecta para tu peso, altura y nivel.',
    images: ['/wave-128.png'],
  },
  alternates: {
    canonical: 'https://santateresasurfcam.com/calculadora-tabla-surf',
  },
};

export default function SurfboardCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SurfboardCalculator />
    </div>
  );
}
