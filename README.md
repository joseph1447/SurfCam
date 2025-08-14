# 🏄‍♂️ Santa Teresa Surf Cam

Una aplicación web moderna y Progressive Web App (PWA) que proporciona acceso en tiempo real a las condiciones de surf de Santa Teresa, Costa Rica. Diseñada para ayudar a surfistas y visitantes a tomar decisiones informadas sobre cuándo ir a surfear, con funcionalidades premium y análisis de usuarios.

## ✨ Características Principales

- **📹 Transmisión en Tiempo Real:** Visualiza streams de video en vivo desde Santa Teresa
- **📱 Progressive Web App (PWA):** Instalable en dispositivos móviles y de escritorio
- **🔐 Sistema de Autenticación Avanzado:** Acceso con diferentes niveles (Gratuito/Premium)
- **⏱️ Sistema de Prueba Gratuita:** 60 segundos de acceso para usuarios gratuitos
- **📊 Panel de Administración:** Gestión de usuarios y métricas en tiempo real
- **📈 Análisis de Usuarios:** Tracking completo de actividad y sesiones
- **🏨 Páginas Informativas:** Hospedaje, clases de surf, restaurantes y contacto
- **🎨 UI Moderna:** Interfaz elegante construida con Tailwind CSS y shadcn/ui
- **🚀 Proxy HLS Inteligente:** Solución CORS integrada para streams HLS
- **🌐 Diseño Responsivo:** Optimizado para todos los dispositivos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework React con App Router
- **React 18** - Biblioteca para interfaces de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes de UI modernos y accesibles
- **Lucide React** - Iconos modernos y consistentes

### Progressive Web App (PWA)
- **Web App Manifest** - Configuración de instalación
- **Service Worker** - Caching y funcionalidades offline
- **HLS.js** - Biblioteca para reproducción de streams HLS
- **HTTP Live Streaming (HLS)** - Protocolo de streaming adaptativo

### Backend & Base de Datos
- **MongoDB Atlas** - Base de datos en la nube
- **Mongoose** - ODM para MongoDB
- **bcryptjs** - Hashing de contraseñas
- **Next.js API Routes** - Endpoints del servidor

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS
- **Vercel** - Plataforma de despliegue

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn** como gestor de paquetes
- **Cuenta de MongoDB Atlas** para la base de datos

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd SurfCam
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_atlas_connection_string

   # HLS Stream Configuration (opcional)
   NEXT_PUBLIC_HLS_STREAM_URL=http://your-hls-server.com/hls

   # Development Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:9002

   # Admin Configuration
   ADMIN_EMAIL=josephquesada92@gmail.com
   ADMIN_PASSWORD=surfoQ2194
   ```

4. **Configurar MongoDB Atlas**
   
   - Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
   - Crea un nuevo cluster
   - Obtén la cadena de conexión
   - Configura las variables de entorno

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

6. **Abrir en el navegador**
   
   La aplicación estará disponible en `http://localhost:9002`

## 🏗️ Arquitectura del Proyecto

```
SurfCam/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── admin/         # Endpoints de administración
│   │   │   ├── auth/          # Autenticación y registro
│   │   │   └── hls-proxy/     # Proxy HLS para CORS
│   │   ├── admin/             # Panel de administración
│   │   ├── contacto/          # Página de planes premium
│   │   ├── hospedaje/         # Página de hospedaje
│   │   ├── restaurantes/      # Página de restaurantes
│   │   ├── surf-lessons/      # Página de clases de surf
│   │   ├── globals.css        # Estilos globales
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página principal
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes shadcn/ui
│   │   ├── AppHeader.tsx     # Header principal
│   │   ├── HospedajeHeader.tsx # Header para hospedaje
│   │   ├── SimpleHeader.tsx  # Header simple
│   │   ├── HlsPlayer.tsx     # Reproductor HLS
│   │   ├── Login.tsx         # Componente de login
│   │   ├── SurfCam.tsx       # Componente principal
│   │   ├── InstallPWAButton.tsx # Botón de instalación PWA
│   │   └── PWAProvider.tsx   # Proveedor PWA
│   ├── context/              # Contextos de React
│   │   └── AuthContext.tsx   # Contexto de autenticación
│   ├── hooks/                # Custom hooks
│   │   └── usePWA.ts         # Hook para funcionalidades PWA
│   ├── lib/                  # Utilidades
│   │   └── mongodb.ts        # Conexión a MongoDB
│   └── models/               # Modelos de MongoDB
│       ├── User.ts           # Modelo de usuario
│       ├── Admin.ts          # Modelo de administrador
│       └── Metrics.ts        # Modelo de métricas
├── public/                   # Archivos estáticos
│   ├── manifest.json         # Web App Manifest
│   ├── sw.js                 # Service Worker
│   ├── seataya.png           # Logo de Seataya
│   └── wave-*.png            # Iconos de la aplicación
└── package.json             # Dependencias y scripts
```

## 📱 Progressive Web App (PWA)

### Características PWA
- **Instalación nativa** en dispositivos móviles y de escritorio
- **Funcionalidad offline** con Service Worker
- **Iconos adaptativos** para diferentes tamaños
- **Splash screen** personalizado
- **Actualizaciones automáticas**

### Instalación
- **Chrome/Edge:** Toca el ícono de instalación en la barra de direcciones
- **Safari:** Toca el botón compartir y selecciona "Añadir a pantalla de inicio"
- **Android:** Aparecerá un banner automático para instalar

## 🔧 Configuración del Proxy HLS

La aplicación incluye un proxy inteligente para manejar streams HLS que resuelve problemas de CORS:

### Características del Proxy
- **Reescritura de URLs:** Convierte URLs relativas y absolutas para usar el proxy
- **Manejo de Contenido Binario:** Procesa correctamente archivos `.ts` (segmentos de video)
- **Headers CORS:** Agrega headers necesarios para acceso cross-origin
- **Content-Type Correcto:** Establece MIME types apropiados para HLS

### Endpoint del Proxy
```
GET /api/hls-proxy/[path]
```

## 🎯 Funcionalidades Principales

### Sistema de Autenticación
- **Login/Logout** con base de datos MongoDB
- **Diferentes niveles de acceso** (Gratuito/Premium)
- **Persistencia de sesión** entre recargas
- **Tracking de actividad** y métricas de usuario

### Sistema de Prueba Gratuita
- **60 segundos de acceso** para usuarios gratuitos
- **Contador visual** del tiempo restante
- **Pantalla de bloqueo** al terminar el tiempo
- **Opciones de upgrade** a premium

### Panel de Administración (`/admin`)
- **Métricas en tiempo real** (usuarios activos, gratuitos, premium)
- **Gestión de usuarios** (activar/desactivar, cambiar tipo)
- **Análisis detallado** (sesiones, dispositivos, actividad)
- **Acceso restringido** solo para administradores

### Páginas Informativas
- **Hospedaje** (`/hospedaje`): Seataya Luxury Villas y Leidymar Apartments
- **Clases de Surf** (`/surf-lessons`): Información de instructores locales
- **Restaurantes** (`/restaurantes`): Recomendaciones gastronómicas
- **Contacto** (`/contacto`): Planes premium y servicios de desarrollo

### Reproductor HLS
- **Reproducción automática** al cargar
- **Controles nativos** del navegador
- **Manejo de errores** y recuperación automática
- **Soporte para Safari** (HLS nativo) y otros navegadores (HLS.js)
- **Prevención de reproducción** después del tiempo gratuito

## 📊 Análisis de Usuarios

### Métricas Recolectadas
- **Conteo de logins** y frecuencia de uso
- **Tiempo de sesión** promedio y total
- **Dispositivos y navegadores** utilizados
- **Actividad por hora y día**
- **Historial de sesiones** detallado

### API Endpoints
- `POST /api/auth/register` - Registro y tracking de login
- `POST /api/auth/logout` - Tracking de logout
- `POST /api/auth/activity` - Tracking de actividad
- `GET /api/admin/users` - Lista de usuarios
- `GET /api/admin/metrics` - Métricas en tiempo real

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Despliega automáticamente en cada push

### Variables de Entorno para Producción
```env
MONGODB_URI=your_mongodb_atlas_connection_string
NEXT_PUBLIC_APP_URL=https://your-domain.com
ADMIN_EMAIL=josephquesada92@gmail.com
ADMIN_PASSWORD=your_secure_password
```

## 🔒 Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `MONGODB_URI` | Cadena de conexión de MongoDB Atlas | ✅ |
| `NEXT_PUBLIC_HLS_STREAM_URL` | URL del servidor HLS | ❌ |
| `NEXT_PUBLIC_APP_URL` | URL de la aplicación | ❌ |
| `ADMIN_EMAIL` | Email del administrador | ✅ |
| `ADMIN_PASSWORD` | Contraseña del administrador | ✅ |

## 📞 Contacto y Soporte

### Información de Contacto
- **Email:** josephquesada92@gmail.com
- **WhatsApp:** +50683161976
- **Sitio Web:** https://doc-manager-front.vercel.app

### Planes Premium
- **Individual:** $5/mes (SINPE)
- **Empresarial:** Contacto directo
- **Servicios de Desarrollo:** Sitios web y aplicaciones

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Seataya Luxury Villas** - Por proporcionar la increíble vista a las olas
- **Leidymar Apartments** - Por el hospedaje de calidad
- **shadcn/ui** - Por los componentes de UI de alta calidad
- **HLS.js** - Por la biblioteca de streaming HLS
- **MongoDB Atlas** - Por la base de datos en la nube

---

**¡Disfruta surfeando en Santa Teresa! 🏄‍♂️🌊**
