# Configuración de Twitch API

## Variables de Entorno Requeridas

Para que la autenticación de Twitch funcione correctamente, necesitas configurar las siguientes variables de entorno en tu archivo `.env.local`:

```bash
# Twitch API Configuration
TWITCH_CLIENT_ID=tu_client_id_de_twitch_aqui
TWITCH_CLIENT_SECRET=tu_client_secret_de_twitch_aqui

# Application URLs
NEXTAUTH_URL=http://localhost:3000

# MongoDB (si es necesario)
MONGODB_URI=tu_mongodb_uri_aqui
```

## Cómo Obtener las Credenciales de Twitch

1. **Ve a [Twitch Developer Console](https://dev.twitch.tv/console)**
2. **Inicia sesión** con tu cuenta de Twitch
3. **Crea una nueva aplicación**:
   - Nombre: "SurfCam" (o el nombre que prefieras)
   - Categoría: "Website Integration"
   - URL de redirección: `http://localhost:3000/api/twitch/auth/callback`
4. **Copia el Client ID y Client Secret** de tu aplicación

## Configuración de la Aplicación

### Para Desarrollo Local:
```bash
TWITCH_CLIENT_ID=tu_client_id_aqui
TWITCH_CLIENT_SECRET=tu_client_secret_aqui
NEXTAUTH_URL=http://localhost:3000
```

### Para Producción (Vercel):
```bash
TWITCH_CLIENT_ID=tu_client_id_aqui
TWITCH_CLIENT_SECRET=tu_client_secret_aqui
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

## Funcionalidades Implementadas

### ✅ Autenticación Automática
- Verificación automática del estado de autenticación
- Almacenamiento seguro de tokens en localStorage
- Validación de tokens con la API de Twitch

### ✅ Modal de Login Amigable
- Interfaz moderna y atractiva
- Información clara sobre los beneficios
- Enlace directo para crear cuenta de Twitch

### ✅ Experiencia de Usuario Mejorada
- Estado de carga mientras verifica autenticación
- Mensaje claro cuando no está autenticado
- Información del usuario autenticado en el reproductor

### ✅ Integración Completa
- Callback de autenticación automático
- Manejo de errores robusto
- Limpieza automática de tokens inválidos

## Flujo de Autenticación

1. **Usuario visita la página** → Se verifica si está autenticado
2. **Si no está autenticado** → Se muestra el modal de login
3. **Usuario hace clic en "Iniciar sesión"** → Redirige a Twitch OAuth
4. **Usuario autoriza la aplicación** → Twitch redirige de vuelta
5. **Se almacenan los tokens** → Usuario puede ver el video y chatear

## Beneficios para el Usuario

- 🎥 **Acceso al video en vivo** sin restricciones
- 💬 **Participación en el chat** de Twitch
- ❤️ **Posibilidad de dar likes** y seguir al streamer
- ⭐ **Acceso a contenido premium** (si está disponible)
- 🔒 **Autenticación segura** con Twitch

## Notas Importantes

- Los tokens se almacenan localmente en el navegador
- Los tokens se validan automáticamente con cada carga
- Si un token expira, se limpia automáticamente
- La autenticación es completamente manejada por Twitch
