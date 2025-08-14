# 🗄️ Configuración de MongoDB Atlas

## 📋 Pasos para configurar MongoDB Atlas

### 1. Crear cuenta en MongoDB Atlas
1. Ve a [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea una cuenta gratuita
3. Selecciona el plan "Free" (M0)

### 2. Crear un Cluster
1. Haz clic en "Build a Database"
2. Selecciona "FREE" (M0)
3. Elige tu proveedor de nube (AWS, Google Cloud, o Azure)
4. Selecciona una región cercana
5. Haz clic en "Create"

### 3. Configurar Seguridad
1. **Database Access**:
   - Ve a "Database Access"
   - Haz clic en "Add New Database User"
   - Username: `surfcam_admin`
   - Password: Genera una contraseña segura
   - Role: "Atlas admin"
   - Haz clic en "Add User"

2. **Network Access**:
   - Ve a "Network Access"
   - Haz clic en "Add IP Address"
   - Para desarrollo: `0.0.0.0/0` (permite acceso desde cualquier lugar)
   - Para producción: Agrega solo las IPs específicas

### 4. Obtener Connection String
1. Ve a "Database" en tu cluster
2. Haz clic en "Connect"
3. Selecciona "Connect your application"
4. Copia el connection string

### 5. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
MONGODB_URI=mongodb+srv://surfcam_admin:tu_contraseña@cluster.mongodb.net/surfcam?retryWrites=true&w=majority
```

**Reemplaza:**
- `tu_contraseña` con la contraseña que generaste
- `cluster.mongodb.net` con tu cluster específico

### 6. Verificar la Conexión
1. Ejecuta `npm run dev`
2. Ve a `http://localhost:3000/admin`
3. Inicia sesión con:
   - Email: `josephquesada92@gmail.com`
   - Password: `surfoQ2194`

## 🔧 Estructura de la Base de Datos

### Colecciones que se crearán automáticamente:

1. **users** - Usuarios de la aplicación
2. **admins** - Administradores del sistema
3. **metrics** - Métricas y estadísticas

### Índices creados automáticamente:
- `email` (único)
- `accessType`
- `isActive`
- `subscription.status`

## 🚀 Despliegue en Producción

### Vercel
1. Agrega la variable `MONGODB_URI` en tu proyecto de Vercel
2. Configura el Network Access en MongoDB Atlas para permitir conexiones desde Vercel

### Otros proveedores
- Asegúrate de que la variable `MONGODB_URI` esté configurada
- Configura el Network Access apropiadamente

## 📊 Monitoreo

Puedes monitorear tu base de datos desde:
- MongoDB Atlas Dashboard
- Métricas en tiempo real en `/admin`

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de email de admin
- ✅ Índices para consultas eficientes
- ✅ Conexión segura con MongoDB Atlas
