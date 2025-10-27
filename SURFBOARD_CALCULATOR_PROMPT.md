# Surfboard Size Calculator - Component Prompt

## 🏄‍♂️ Objetivo
Crear un componente completo de calculadora de tablas de surf que determine el volumen ideal, medidas y recomendaciones de tablas basado en:
- Peso del surfista
- Altura
- Nivel de surf (principiante, intermedio, avanzado)
- Tamaño de olas donde surfeará
- Estilo de surfing preferido
- Condiciones de agua

## 📊 Algoritmo de Cálculo

### Fórmula Base de Volumen:
```
Volumen Base = Peso (kg) × Factor de Nivel × Factor de Olas × Factor de Estilo
```

### Factores por Nivel:
- **Principiante**: 0.35-0.45 L/kg (más volumen para estabilidad)
- **Intermedio**: 0.30-0.40 L/kg (balance entre estabilidad y performance)
- **Avanzado**: 0.25-0.35 L/kg (menos volumen para mayor maniobrabilidad)

### Factores por Tamaño de Olas:
- **0-2 pies**: +10% volumen (más flotación para olas pequeñas)
- **2-4 pies**: 0% (volumen estándar)
- **4-6 pies**: -5% volumen (menos volumen para olas más grandes)
- **6+ pies**: -10% volumen (tablas más pequeñas para olas grandes)

### Factores por Estilo:
- **Longboard**: +20% volumen
- **Funboard**: +10% volumen
- **Shortboard**: 0% volumen
- **Fish**: -5% volumen
- **Gun**: -15% volumen

## 🎯 Funcionalidades Requeridas

### 1. Formulario de Entrada:
- Peso (kg)
- Altura (cm)
- Nivel de surf
- Tamaño de olas preferido
- Estilo de surfing
- Condiciones de agua (costa, reef, point break)

### 2. Cálculos Automáticos:
- Volumen ideal en litros
- Longitud recomendada
- Ancho recomendado
- Grosor recomendado
- Área de superficie

### 3. Recomendaciones de Marcas:
- Tablas famosas que coincidan con las medidas
- Marcas: HS, JS, Sharp Eye, Channel Islands, Rusty, etc.
- Modelos específicos por estilo

### 4. Opciones de Shaper Local:
- Medidas detalladas para shaper local
- Especificaciones técnicas
- Materiales recomendados
- Finishing options

### 5. Información Educativa:
- Explicación de cada medida
- Por qué estas medidas son ideales
- Consejos de uso
- Mantenimiento de la tabla

## 🎨 Diseño UX/UI

### Layout:
- Formulario en la izquierda
- Resultados en la derecha
- Diseño responsive
- Animaciones suaves
- Colores relacionados con surf (azules, blancos, naranjas)

### Estados:
- Loading durante cálculos
- Resultados con animación
- Error handling
- Validación de formulario

## 📱 Integración

### Como Overlay en YouTube:
- Botón flotante para abrir calculadora
- Modal overlay con calculadora completa
- Mantener funcionalidad en fullscreen

### Como Página Independiente:
- Ruta: `/calculadora-tabla-surf`
- SEO optimizado
- Meta tags específicos
- Sitemap incluido

## 🔧 Implementación Técnica

### Componentes:
1. `SurfboardCalculator` - Componente principal
2. `CalculatorForm` - Formulario de entrada
3. `ResultsDisplay` - Mostrar resultados
4. `BrandRecommendations` - Recomendaciones de marcas
5. `LocalShaperGuide` - Guía para shaper local

### Estado:
- React hooks para manejo de estado
- Validación de formulario
- Cálculos en tiempo real
- Persistencia de resultados

### Estilos:
- Tailwind CSS para styling
- Componentes UI existentes
- Responsive design
- Dark/light mode support

## 📈 SEO y Marketing

### Meta Tags:
- Title: "Calculadora de Tabla de Surf | Encuentra tu Tabla Ideal"
- Description: "Calcula el volumen, medidas y encuentra la tabla de surf perfecta para tu peso, altura y nivel. Recomendaciones de marcas famosas y guía para shaper local."
- Keywords: surfboard calculator, tabla surf, volumen surf, medidas tabla surf

### Contenido SEO:
- Artículos sobre sizing de tablas
- Guías de compra
- Comparativas de marcas
- Tips de mantenimiento

## 🎯 Resultados Esperados

### Para el Usuario:
- Tabla perfecta para su nivel y condiciones
- Ahorro de dinero en compras incorrectas
- Mejora en performance de surf
- Educación sobre equipamiento

### Para el Negocio:
- Tráfico orgánico por SEO
- Engagement de usuarios
- Autoridad en el nicho de surf
- Monetización por afiliados con marcas

---

**Este componente será una herramienta valiosa para la comunidad de surf, mejorando el SEO del sitio y proporcionando valor real a los usuarios.**
