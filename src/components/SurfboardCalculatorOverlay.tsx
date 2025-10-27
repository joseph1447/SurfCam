"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, X } from 'lucide-react';
import SurfboardCalculator from './SurfboardCalculator';

interface CalculatorConfig {
  isEnabled: boolean;
  buttonText: string;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export default function SurfboardCalculatorOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<CalculatorConfig>({
    isEnabled: true,
    buttonText: '¿Cuál es mi modelo de tabla?',
    position: 'top-right'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/calculator-config');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setConfig(data.config);
          }
        }
      } catch (error) {
        console.error('Error fetching calculator config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Don't render if disabled or still loading
  if (loading || !config.isEnabled) {
    return null;
  }

  const getPositionClasses = (position: CalculatorConfig['position']) => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <div className={`absolute z-[9999] ${getPositionClasses(config.position)}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 text-sm"
        >
          <Calculator className="w-4 h-4" />
          <span className="hidden sm:inline">{config.buttonText}</span>
          <span className="sm:hidden">¿Mi tabla?</span>
        </Button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-2">
          <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-xl shadow-2xl relative z-[99999]">
            {/* Header fijo */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl flex items-center justify-between z-[99999]">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                {config.buttonText}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Contenido */}
            <div className="p-4 relative z-[99999]">
              <SurfboardCalculator />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
