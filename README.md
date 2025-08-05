# TAKE - Admin Dashboard

Un dashboard administrativo minimalista y sobrio construido con React y Tailwind CSS.

## 🎯 Características

- **Diseño Minimalista**: Paleta blanco y negro sin colores llamativos
- **Interfaz Sobria**: Diseño limpio y profesional
- **Tipografía Clara**: Fuente Inter con excelente legibilidad
- **Layout Responsivo**: Adaptable a diferentes dispositivos
- **CRUD Completo**: Operaciones de Create, Read, Update, Delete
- **Estadísticas en Tiempo Real**: Métricas y leaderboards
- **Autenticación**: Login con contraseña o passkey

## 🛠️ Tecnologías Utilizadas

- **React 18**: Biblioteca de interfaz de usuario
- **Tailwind CSS**: Framework de CSS utility-first
- **React Router DOM**: Navegación y enrutamiento
- **Vite**: Herramienta de construcción rápida
- **PostCSS**: Procesamiento de CSS
- **ESLint**: Linting de código JavaScript

## 📁 Estructura del Proyecto

```
src/
├── components/
│   └── layout/
│       ├── Layout.jsx
│       └── Sidebar.jsx
├── pages/
│   ├── Login.jsx
│   ├── Menu.jsx
│   ├── Events.jsx
│   ├── Rewards.jsx
│   └── Game.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## 🎨 Características de Diseño

### Paleta de Colores
- **Fondo blanco**: #FFFFFF
- **Texto negro**: #111111
- **Líneas divisoras**: #E5E7EB
- **Sin colores de acento llamativos**

### Componentes Especiales
- **Transiciones Suaves**: transition-all duration-200 ease-in-out
- **Hover Minimalista**: Subrayado o sombreado leve
- **Espaciado Consistente**: px-6, py-4, gap-4
- **Tipografía Inter**: text-lg, font-medium para títulos

## 🚀 Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <repository-url>
   cd TAKE
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**:
   ```
   http://localhost:5173
   ```

## 📋 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza la build de producción
- `npm run lint`: Ejecuta el linter

## 🎯 Funcionalidades Principales

### Página de Login
- **Autenticación con Contraseña**: Formulario tradicional
- **Autenticación con Passkey**: Método moderno de autenticación
- **Diseño Minimalista**: Interfaz limpia y centrada

### Sidebar de Navegación
- **Menu**: CRUD de ítems del menú
- **Events**: CRUD de eventos
- **Rewards**: CRUD + estadísticas de recompensas
- **Game**: Leaderboard de jugadores

### Secciones Específicas

#### Menu Management
- **Create Item**: Agregar nuevos ítems al menú
- **Read Items**: Ver lista de ítems disponibles
- **Update Item**: Editar ítems existentes
- **Delete Item**: Eliminar ítems del menú

#### Events Management
- **Create Event**: Crear nuevos eventos
- **Read Events**: Ver lista de eventos
- **Update Event**: Editar eventos existentes
- **Delete Event**: Eliminar eventos

#### Rewards Management
- **Create Reward**: Crear nuevas recompensas
- **Read Rewards**: Ver lista de recompensas
- **Update Reward**: Editar recompensas existentes
- **Delete Reward**: Eliminar recompensas
- **Estadísticas**:
  - Usuarios con más sellos
  - Total de sellos
  - Cafés gratis dados
  - Total de recompensas dadas

#### Game Leaderboard
- **Watch Leaderboard**: Ver ranking de jugadores
- **Estadísticas del Juego**:
  - Total de jugadores
  - Puntuación promedio
  - Total de sellos

## 🔧 Configuración

### Variables de Entorno
El proyecto requiere configuración mínima de variables de entorno. Copia `env.example` como `.env` y configura:

```bash
# Variable requerida
VITE_API_BASE_URL=http://localhost:3000/api

# Variables opcionales
VITE_DEMO_MODE=true
VITE_USE_MOCK_DATA=false
```

**Nota importante**: El frontend NO maneja credenciales de Google OAuth. El backend es responsable de toda la configuración de autenticación.

### Validación de Configuración
El sistema incluye validación automática de configuración:
- ✅ Verificación de variables de entorno requeridas
- ✅ Health checks del backend
- ✅ Validación de endpoints de autenticación
- ✅ Verificación de configuración CORS
- ✅ Diagnóstico completo del sistema

### Manejo de Errores Mejorado
- 🔍 **Errores específicos**: Categorización por tipo (configuración, red, CORS, autorización)
- 🏥 **Health checks**: Verificación automática del estado del sistema
- 🔄 **Reintentos**: Funcionalidad de reintento para verificaciones fallidas
- 📊 **Diagnóstico**: Panel de estado del sistema con detalles técnicos

### Tailwind CSS
El proyecto está configurado con Tailwind CSS minimalista:
- Paleta de colores blanco y negro
- Tipografía Inter optimizada
- Transiciones suaves
- Componentes reutilizables

### React Router
- Navegación declarativa
- Rutas protegidas
- Estados activos en enlaces
- Navegación programática

## 🎨 Personalización

### Modificar Colores
Edita `tailwind.config.js` para cambiar la paleta de colores:

```javascript
colors: {
  primary: {
    DEFAULT: '#111111',
    light: '#374151',
  },
  gray: {
    light: '#F9FAFB',
    medium: '#E5E7EB',
    dark: '#6B7280',
  },
  text: {
    primary: '#111111',
    secondary: '#6B7280',
  }
}
```

### Agregar Componentes
Los componentes están organizados por funcionalidad:
- `components/layout/`: Componentes de estructura
- `pages/`: Páginas completas con lógica CRUD

## 🔌 Preparación para Backend

El proyecto está completamente preparado para recibir endpoints de Supabase. Se han creado:

### 📁 Estructura de Servicios
```
src/
├── services/
│   ├── api.js              # Servicio base para Supabase
│   ├── menuService.js      # CRUD para menu_items y categories
│   ├── eventsService.js    # CRUD para events
│   ├── rewardsService.js   # CRUD para rewards + estadísticas
│   ├── gameService.js      # CRUD para games y high_scores
│   └── userService.js      # CRUD para users y wallets
├── types/
│   └── database.js         # Tipos basados en el esquema
├── hooks/
│   └── useApi.js           # Hooks para manejo de estado API
└── components/common/
    ├── ErrorMessage.jsx    # Componente de errores
    └── LoadingSpinner.jsx  # Componente de loading
```

### 🎯 Servicios Implementados

#### Menu Service
- `getMenuItems()` - Obtener items con categorías
- `createMenuItem(data)` - Crear item
- `updateMenuItem(id, data)` - Actualizar item
- `deleteMenuItem(id)` - Eliminar item
- `getMenuItemsByCategory(categoryId)` - Filtrar por categoría

#### Events Service
- `getEvents()` - Obtener todos los eventos
- `createEvent(data)` - Crear evento
- `updateEvent(id, data)` - Actualizar evento
- `deleteEvent(id)` - Eliminar evento
- `getPublishedEvents()` - Eventos publicados

#### Rewards Service
- `getRewards()` - Obtener recompensas
- `createReward(data)` - Crear recompensa
- `updateReward(id, data)` - Actualizar recompensa
- `deleteReward(id)` - Eliminar recompensa

#### Rewards Statistics Service
- `getTotalSeals()` - Total de sellos
- `getTopUsersBySeals()` - Usuarios con más sellos
- `getTotalFreeCoffees()` - Cafés gratis dados
- `getTotalRewardsGiven()` - Total de recompensas

#### Game Service
- `getGames()` - Obtener juegos
- `getHighScores()` - Obtener puntuaciones
- `getTopScores()` - Leaderboard
- `createHighScore(data)` - Crear puntuación

#### User Service
- `getUsers()` - Obtener usuarios
- `getUserByEmail(email)` - Buscar por email
- `createUser(data)` - Crear usuario
- `updateUser(id, data)` - Actualizar usuario

#### Wallet Service
- `getAppleWallet(userId)` - Wallet de Apple
- `getGoogleWallet(userId)` - Wallet de Google
- `addSealsToWallet(userId, seals)` - Agregar sellos
- `getWalletStats()` - Estadísticas de wallets

### 🔧 Configuración de Variables de Entorno

Crear archivo `.env` con:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 📚 Documentación de Endpoints

Ver `src/docs/endpoints.md` para la documentación completa de todos los endpoints esperados basados en el esquema de Supabase.

## 🚀 Próximos Pasos

- [ ] Configurar variables de entorno de Supabase
- [ ] Conectar servicios con endpoints reales
- [ ] Implementar autenticación real
- [ ] Agregar validación de datos
- [ ] Implementar cache y optimización
- [ ] Agregar tests unitarios y de integración
- [ ] Optimizar rendimiento
- [ ] Implementar PWA para acceso offline

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.
