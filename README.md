# 🏄‍♂️ La Lora Surf Cam

Una aplicación web moderna que proporciona acceso en tiempo real a las condiciones de surf a través de cámaras web. Diseñada para ayudar a surfistas y visitantes de playa a tomar decisiones informadas sobre cuándo y dónde ir a surfear.

## ✨ Características

- **📹 Transmisión en Tiempo Real:** Visualiza streams de video en vivo desde ubicaciones de surf
- **🔐 Sistema de Autenticación:** Acceso seguro con diferentes niveles de usuario (Gratuito/Premium)
- **⏱️ Sistema de Prueba Gratuita:** Los usuarios gratuitos tienen acceso limitado por tiempo
- **📱 Diseño Responsivo:** Interfaz optimizada para dispositivos móviles y de escritorio
- **🎨 UI Moderna:** Interfaz elegante construida con Tailwind CSS y componentes shadcn/ui
- **🚀 Proxy HLS Inteligente:** Solución CORS integrada para streams HLS

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework React con App Router
- **React 18** - Biblioteca para interfaces de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes de UI modernos y accesibles

### Streaming & Multimedia
- **HLS.js** - Biblioteca para reproducción de streams HLS en navegadores
- **HTTP Live Streaming (HLS)** - Protocolo de streaming adaptativo

### Autenticación & Backend
- **Firebase Authentication** - Sistema de autenticación seguro
- **Next.js API Routes** - Endpoints del servidor para proxy HLS

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS
- **Vercel** - Plataforma de despliegue (configurada)

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn** como gestor de paquetes
- **Cuenta de Firebase** para autenticación

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
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # HLS Stream Configuration (opcional)
   NEXT_PUBLIC_HLS_STREAM_URL=http://your-hls-server.com/hls

   # Development Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:9002
   ```

4. **Configurar Firebase**
   
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto o usa uno existente
   - Habilita Authentication con Email/Password
   - Copia las credenciales de configuración a tu `.env.local`

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
│   │   │   └── hls-proxy/     # Proxy HLS para CORS
│   │   ├── globals.css        # Estilos globales
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página principal
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes shadcn/ui
│   │   ├── AppHeader.tsx     # Header de la aplicación
│   │   ├── HlsPlayer.tsx     # Reproductor HLS
│   │   ├── Login.tsx         # Componente de login
│   │   └── SurfCam.tsx       # Componente principal
│   ├── context/              # Contextos de React
│   │   └── AuthContext.tsx   # Contexto de autenticación
│   ├── hooks/                # Custom hooks
│   │   ├── useAuth.ts        # Hook de autenticación
│   │   └── use-mobile.tsx    # Hook para detección móvil
│   └── lib/                  # Utilidades
│       └── utils.ts          # Funciones utilitarias
├── public/                   # Archivos estáticos
├── docs/                     # Documentación adicional
└── package.json             # Dependencias y scripts
```

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

### Ejemplo de Uso
```javascript
// En lugar de acceder directamente a:
// http://hls-server.com/hls/stream.m3u8

// Usar el proxy:
// http://localhost:9002/api/hls-proxy/stream.m3u8
```

## 🎯 Funcionalidades Principales

### Sistema de Autenticación
- **Login/Logout** con Firebase Authentication
- **Diferentes niveles de acceso** (Gratuito/Premium)
- **Persistencia de sesión** entre recargas

### Sistema de Prueba Gratuita
- **60 segundos de acceso** para usuarios gratuitos
- **Contador visual** del tiempo restante
- **Pantalla de bloqueo** al terminar el tiempo

### Reproductor HLS
- **Reproducción automática** al cargar
- **Controles nativos** del navegador
- **Manejo de errores** y recuperación automática
- **Soporte para Safari** (HLS nativo) y otros navegadores (HLS.js)

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Despliega automáticamente en cada push

### Otros Proveedores
La aplicación es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Clave API de Firebase | ✅ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación | ✅ |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto Firebase | ✅ |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de almacenamiento | ✅ |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID del remitente | ✅ |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ID de la aplicación | ✅ |
| `NEXT_PUBLIC_HLS_STREAM_URL` | URL del servidor HLS | ❌ |
| `NEXT_PUBLIC_APP_URL` | URL de la aplicación | ❌ |

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
- **shadcn/ui** - Por los componentes de UI de alta calidad
- **HLS.js** - Por la biblioteca de streaming HLS
- **Firebase** - Por el sistema de autenticación robusto

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo
- Revisa la documentación en `/docs`

---

**¡Disfruta surfeando! 🏄‍♂️🌊**
