# Configuración de Administradores

## Problema Actual
El email `nicocorbal@gmail.com` no está autorizado para acceder como administrador.

## Solución

### 1. Configurar la Whitelist de Administradores

En el backend, necesitas configurar la variable de entorno `ADMIN_EMAIL_WHITELIST` con los emails autorizados:

```env
# En el archivo .env del backend
ADMIN_EMAIL_WHITELIST=nicocorbal@gmail.com,admin@take.com,otro@admin.com
```

### 2. Variables de Entorno Necesarias

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Admin Configuration
ADMIN_EMAIL_WHITELIST=nicocorbal@gmail.com,admin@take.com

# JWT Configuration
JWT_SECRET=tu_jwt_secret
```

### 3. Flujo de Autenticación de Admin

1. **Usuario hace clic en "Acceso Administrador"**
2. **Frontend redirige a `/api/admin/auth/login`**
3. **Backend redirige a Google OAuth**
4. **Usuario se autentica con Google**
5. **Google redirige a `/api/admin/auth/google/callback`**
6. **Backend valida email en `ADMIN_EMAIL_WHITELIST`**
7. **Si autorizado: genera token de admin**
8. **Si no autorizado: redirige a error**

### 4. Logs del Backend

Los logs muestran:
```
[warn]: Unauthorized admin login attempt: nicocorbal@gmail.com
```

Esto indica que el email no está en la whitelist.

### 5. Pasos para Solucionar

1. **Agregar el email a la whitelist:**
   ```env
   ADMIN_EMAIL_WHITELIST=nicocorbal@gmail.com
   ```

2. **Reiniciar el backend** para que tome los nuevos valores

3. **Intentar el login de admin nuevamente**

### 6. Verificación

Después de configurar la whitelist, el flujo debería ser:
1. Login exitoso
2. Redirección a `/admin/callback`
3. Token de admin generado
4. Acceso al dashboard como administrador

### 7. Seguridad

- Solo emails en la whitelist pueden ser administradores
- Los tokens de admin son diferentes a los de usuario normal
- La validación se hace en cada request de autenticación 