# Santa Teresa Surf Cam

Transmisión en vivo 24/7 de las mejores olas de Santa Teresa, Costa Rica.

## 🌊 Características Principales

### 📺 Servidores de Video Duales
- **Twitch (Recomendado)**: Calidad HD máxima, chat interactivo, suscripciones disponibles
- **YouTube (Alternativo)**: Calidad estándar, acceso universal, opción de respaldo

### 🎯 Funcionalidades
- **Transmisión en Vivo**: Video en tiempo real de las condiciones del surf
- **Chat Interactivo**: Conecta con otros surfistas (solo en Twitch)
- **Datos de Mareas**: Información actualizada sobre mareas y condiciones
- **Reportes de Usuarios**: Los surfistas pueden reportar condiciones actuales
- **PWA**: Instalable como aplicación móvil
- **Responsive**: Optimizado para móviles y desktop

## 🚀 Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Video**: Twitch Embed API, YouTube Embed API
- **Autenticación**: Twitch OAuth2
- **Base de Datos**: MongoDB con Mongoose
- **Deployment**: Vercel

## 🔧 Variables de Entorno

```bash
# Twitch API Configuration
NEXT_PUBLIC_TWITCH_CLIENT_ID=tu_client_id_de_twitch_aqui
TWITCH_CLIENT_SECRET=tu_client_secret_de_twitch_aqui

# Application URLs
NEXTAUTH_URL=https://santateresasurfcam.com

# MongoDB (si es necesario)
MONGODB_URI=tu_mongodb_uri_aqui
```

## 📱 Instalación

1. **Clona el repositorio**
```bash
git clone https://github.com/tu-usuario/santateresasurfcam.git
cd santateresasurfcam
```

2. **Instala dependencias**
```bash
npm install
```

3. **Configura variables de entorno**
```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales
```

4. **Ejecuta en desarrollo**
```bash
npm run dev
```

## 🌐 SEO Optimizado

- **Dominio**: santateresasurfcam.com
- **Metadatos**: Optimizados para surf, Costa Rica, Santa Teresa
- **Sitemap**: Generado automáticamente
- **Robots.txt**: Configurado para mejor indexación
- **Open Graph**: Metadatos para redes sociales
- **Twitter Cards**: Optimizado para Twitter

## 🎥 Configuración de Video

### Twitch
- **Canal**: elsurfo
- **Layout**: video-with-chat
- **Calidad**: HD máxima
- **Autenticación**: Requerida para mejor experiencia

### YouTube
- **Video ID**: S4xhsAkiHKU
- **Título**: "Pura Vida & Epic Waves | Santa Teresa Live Surf Cam 24/7 | Costa Rica"
- **Calidad**: Estándar
- **Acceso**: Universal

## 🔄 Cambio de Servidor

Los usuarios pueden cambiar entre servidores usando el switcher en la interfaz:

1. **Twitch**: Recomendado para mejor calidad y experiencia
2. **YouTube**: Alternativo para acceso universal

## 📊 Monitoreo

- **Vercel Analytics**: Métricas de rendimiento
- **Speed Insights**: Optimización de velocidad
- **Console Logs**: Solo logs críticos de autenticación

## 🚀 Deployment

El proyecto se despliega automáticamente en Vercel en cada commit:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta al equipo de desarrollo.

---

**Santa Teresa Surf Cam** - Conectando surfistas con las mejores olas de Costa Rica 🌊