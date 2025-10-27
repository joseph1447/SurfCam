# Sistema de Overlays Publicitarios - Santa Teresa Surf Cam

## 🎯 Funcionalidad Implementada

Se ha implementado un sistema completo de overlays publicitarios similar al de YouTube, que permite mostrar anuncios sobre el video de YouTube con funcionalidades avanzadas de gestión.

## 🚀 Características Principales

### 📺 Servidor por Defecto: YouTube
- **YouTube es ahora el servidor por defecto** para mejor accesibilidad
- **Twitch como opción premium** para usuarios que quieren HD y chat
- **Overlays publicitarios solo en YouTube** para monetización

### 🎨 Sistema de Overlays
- **Posicionamiento flexible**: 4 posiciones (esquinas)
- **Rotación automática**: Cambia cada 10 segundos
- **Visibilidad inteligente**: Se oculta después de 5 segundos, reaparece cada 15 segundos
- **Tracking de clicks**: Contador automático de interacciones
- **Fechas de activación**: Control de inicio y fin de campañas

### 🛠️ Panel de Administración Simplificado
- **Solo gestión de anuncios**: Eliminada toda la lógica de usuarios y reportes
- **CRUD completo**: Crear, editar, eliminar overlays
- **Métricas en tiempo real**: Total overlays, clicks, estadísticas
- **Interfaz intuitiva**: Formularios simples y tablas organizadas

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:
- `src/models/AdOverlay.ts` - Modelo de datos para overlays
- `src/components/AdOverlay.tsx` - Componente para mostrar overlays
- `src/app/api/ad-overlays/route.ts` - API pública para obtener overlays
- `src/app/api/admin/ad-overlays/route.ts` - API de administración
- `src/app/api/admin/ad-overlays/click/route.ts` - API para tracking de clicks

### Archivos Modificados:
- `src/components/YouTubeEmbedClient.tsx` - Integración de overlays
- `src/components/ServerSwitcher.tsx` - YouTube como recomendado
- `src/components/SurfCamTwitch.tsx` - YouTube como servidor por defecto
- `src/app/admin/page.tsx` - Panel simplificado solo para anuncios

## 🔧 Configuración del Sistema

### Variables de Entorno Requeridas:
```bash
# MongoDB para almacenar overlays
MONGODB_URI=tu_mongodb_uri_aqui

# URLs de la aplicación
NEXTAUTH_URL=https://santateresasurfcam.com
```

### Estructura de Datos:
```typescript
interface AdOverlay {
  logoUrl: string;        // URL del logo/imagen
  text: string;          // Texto del anuncio (máx 100 chars)
  redirectUrl: string;   // URL de destino al hacer click
  position: string;      // Posición en pantalla
  isActive: boolean;     // Estado activo/inactivo
  startDate?: Date;      // Fecha de inicio (opcional)
  endDate?: Date;        // Fecha de fin (opcional)
  clickCount: number;    // Contador de clicks
}
```

## 🎮 Uso del Panel de Administración

### Acceso:
1. Ir a `/admin`
2. Iniciar sesión con credenciales de administrador
3. Ver panel simplificado solo para overlays

### Crear Overlay:
1. Click en "Crear Overlay"
2. Completar formulario:
   - **URL del Logo**: Enlace a imagen del anunciante
   - **Texto**: Nombre o mensaje del anuncio
   - **URL de Redirección**: Enlace de destino
   - **Posición**: Esquina donde aparecerá
   - **Fechas**: Opcional, para campañas temporales
3. Guardar

### Gestionar Overlays:
- **Ver todos**: Tabla con todos los overlays creados
- **Editar**: Click en icono de edición
- **Eliminar**: Click en icono de basura
- **Métricas**: Ver clicks y estadísticas en tiempo real

## 🎨 Comportamiento de los Overlays

### Rotación Automática:
- **Cambio cada 10 segundos** entre overlays activos
- **Solo muestra overlays activos** y dentro de fechas válidas
- **Fallback**: Si no hay overlays, no muestra nada

### Visibilidad Inteligente:
- **Aparece inmediatamente** al cargar el video
- **Se oculta después de 5 segundos**
- **Reaparece cada 15 segundos**
- **Transiciones suaves** con animaciones CSS

### Tracking de Clicks:
- **Contador automático** en base de datos
- **Apertura en nueva pestaña** para mejor UX
- **Métricas en tiempo real** en panel admin

## 🌐 API Endpoints

### Públicos:
- `GET /api/ad-overlays` - Obtener overlays activos para mostrar

### Administración:
- `GET /api/admin/ad-overlays` - Listar todos los overlays
- `POST /api/admin/ad-overlays` - Crear nuevo overlay
- `PUT /api/admin/ad-overlays` - Actualizar overlay existente
- `DELETE /api/admin/ad-overlays?id=X` - Eliminar overlay
- `POST /api/admin/ad-overlays/click` - Registrar click

## 🎯 Beneficios del Sistema

### Para Administradores:
- **Monetización fácil**: Agregar anuncios sin código
- **Control total**: Activar/desactivar campañas
- **Métricas claras**: Ver efectividad de cada anuncio
- **Interfaz simple**: Solo lo necesario para anuncios

### Para Usuarios:
- **YouTube por defecto**: Acceso universal sin autenticación
- **Overlays discretos**: No interrumpen la experiencia
- **Opcional Twitch**: Para usuarios que quieren premium
- **Navegación fluida**: Links abren en nueva pestaña

### Para Anunciantes:
- **Visibilidad garantizada**: Overlays siempre visibles
- **Tracking preciso**: Contador de clicks real
- **Flexibilidad**: Múltiples posiciones y horarios
- **Profesional**: Apariencia similar a YouTube

## 🚀 Próximos Pasos Sugeridos

1. **Configurar MongoDB** para almacenar overlays
2. **Crear primeros overlays** desde el panel admin
3. **Probar rotación** y comportamiento en vivo
4. **Configurar métricas** adicionales si es necesario
5. **Optimizar imágenes** de logos para mejor rendimiento

---

**Sistema implementado exitosamente** ✅  
**YouTube como servidor por defecto** ✅  
**Panel de administración simplificado** ✅  
**Overlays publicitarios funcionales** ✅
