# Overlay de Mareas en Tiempo Real

## 🎯 Nuevo Overlay Implementado

Se ha reemplazado el branding de YouTube por un **overlay fijo de mareas** que muestra información en tiempo real sobre las condiciones de marea en Costa Rica.

## 🌊 Características del TideOverlay

### **Información Mostrada:**
- **Estado actual**: Pleamar o Bajamar
- **Altura de marea**: En metros con precisión decimal
- **Próximo cambio**: Hora de la siguiente marea
- **Medidor visual**: Representación gráfica del nivel de agua

### **Diseño Visual:**
- **Posición**: Esquina superior derecha (top-4 right-4)
- **Estilo**: Fondo negro semi-transparente con blur
- **Iconos**: Emojis de olas para representar mareas
- **Colores**: Azul para pleamar, azul oscuro para bajamar

## 🔧 Funcionalidades Técnicas

### **Actualización Automática:**
```typescript
// Actualiza cada 30 minutos
const interval = setInterval(fetchTideData, 30 * 60 * 1000);
```

### **Cálculo de Mareas:**
```typescript
const calculateCurrentTide = (tides: TideData[], currentTime: Date) => {
  // Encuentra la marea más reciente antes del tiempo actual
  // Calcula el próximo cambio de marea
  // Retorna altura, tipo y próxima hora
};
```

### **Medidor Visual:**
```typescript
const getTidePercentage = (height: number) => {
  // Normaliza altura de marea a porcentaje (rango -2 a 4 metros)
  const minHeight = -2;
  const maxHeight = 4;
  return ((height - minHeight) / (maxHeight - minHeight)) * 100;
};
```

## 📊 Datos Utilizados

### **Fuente de Datos:**
- **API**: `/api/tide-data` (existente)
- **Zona horaria**: America/Costa_Rica
- **Formato**: Altura en metros, tiempo en ISO string

### **Rango de Mareas:**
- **Mínimo**: -2 metros (bajamar extrema)
- **Máximo**: 4 metros (pleamar extrema)
- **Normalización**: 0-100% para el medidor visual

## 🎨 Diseño del Overlay

### **Estructura Visual:**
```
┌─────────────────────────────┐
│ 🌊  Marea  [████████] Pleamar │
│     [████]    2.3m           │
│              Próx: 14:30     │
└─────────────────────────────┘
```

### **Elementos del Overlay:**
1. **Icono de marea**: 🌊 (dinámico según tipo)
2. **Medidor visual**: Barra vertical con nivel de agua
3. **Altura**: Número en metros con color diferenciado
4. **Tipo**: "Pleamar" o "Bajamar"
5. **Próximo cambio**: Hora de la siguiente marea

## 🔄 Estados del Componente

### **Loading State:**
```typescript
if (loading) {
  return <LoadingSpinner />;
}
```

### **Error State:**
```typescript
if (error || !currentTide) {
  return <ErrorMessage />;
}
```

### **Success State:**
```typescript
return <TideMeter />;
```

## 🎯 Beneficios del Nuevo Overlay

### **Para Surfistas:**
- **Información crítica**: Mareas son esenciales para surf
- **Tiempo real**: Datos actualizados cada 30 minutos
- **Visual claro**: Fácil de leer mientras ve el video
- **Próximo cambio**: Planificación de sesiones

### **Para el Negocio:**
- **Valor agregado**: Información útil para usuarios
- **Diferenciación**: Overlay único y funcional
- **Engagement**: Usuarios consultan información regularmente
- **Profesionalismo**: Muestra atención al detalle

### **Para la UX:**
- **No intrusivo**: Posición fija, no molesta
- **Informativo**: Datos relevantes para el contexto
- **Consistente**: Siempre visible durante reproducción
- **Útil**: Información práctica para surfistas

## 🔧 Integración Técnica

### **Reemplazo del Branding:**
```typescript
// Antes
<div className="YouTube branding">YT</div>

// Después  
<TideOverlay />
```

### **Posicionamiento:**
- **Z-index**: 20 (por encima de overlays publicitarios)
- **Posición**: Absolute top-4 right-4
- **Responsive**: Se adapta a diferentes tamaños

### **Performance:**
- **Lazy loading**: Solo carga cuando es necesario
- **Caching**: Datos se cachean por 30 minutos
- **Error handling**: Fallback graceful en caso de error

## 📱 Responsive Design

### **Desktop:**
- Overlay completo con medidor visual
- Información detallada visible
- Posición fija en esquina superior derecha

### **Mobile:**
- Mismo diseño adaptado
- Texto más pequeño pero legible
- Mantiene funcionalidad completa

## 🎨 Personalización

### **Colores Dinámicos:**
```typescript
const getTideColor = (type: 'high' | 'low') => {
  return type === 'high' ? 'text-blue-400' : 'text-blue-600';
};
```

### **Iconos Dinámicos:**
```typescript
const getTideIcon = (type: 'high' | 'low') => {
  return type === 'high' ? '🌊' : '🌊';
};
```

---

**Resultado**: Un overlay **funcional y útil** que proporciona información crítica sobre mareas en tiempo real, reemplazando el branding genérico de YouTube con datos **relevantes para surfistas** en Costa Rica. 🌊📊
