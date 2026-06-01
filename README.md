# 🛡️ Asistencia COED

Sistema de control de asistencia escolar con geofencing GPS, QR por grado y exportación CSV.

---

## Árbol de archivos completo

```
asistencia-coed/
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── firestore.rules
├── .env.example
├── .gitignore
│
└── src/
    ├── main.jsx                          ← Entry point React
    ├── App.jsx                           ← Router + lazy loading
    ├── index.css                         ← Tailwind + variables CSS globales
    │
    ├── services/
    │   ├── firebase.js                   ← Inicialización Firebase (db, auth)
    │   ├── attendanceService.js          ← CRUD Firestore (asistencias)
    │   └── csvService.js                 ← Exportación CSV nativa
    │
    ├── context/
    │   └── AuthContext.jsx               ← Estado global de sesión (user, isAdmin)
    │
    ├── hooks/
    │   ├── useGeofencing.js              ← Haversine GPS (≤50m del COED)
    │   └── useAttendance.js              ← Lógica de marcado + anti-duplicado
    │
    ├── components/
    │   ├── common/
    │   │   ├── Icons.jsx                 ← Librería de SVG inline
    │   │   ├── PageLoader.jsx            ← Splash de carga global
    │   │   └── ProtectedRoute.jsx        ← Guard de rutas autenticadas
    │   │
    │   ├── student/
    │   │   ├── GeofenceStatus.jsx        ← Panel de estado GPS del alumno
    │   │   └── AttendanceResult.jsx      ← Paneles: éxito y duplicado
    │   │
    │   └── admin/
    │       ├── AdminSidebar.jsx          ← Sidebar de navegación admin
    │       ├── GradeCard.jsx             ← Tarjeta de grado + QR dinámico
    │       ├── FilterBar.jsx             ← Filtros fecha + grado + export
    │       ├── AttendanceTable.jsx       ← Tabla con skeleton/empty/data
    │       └── StatPill.jsx              ← Indicadores rápidos
    │
    └── pages/
        ├── Login.jsx                     ← Autenticación Firebase
        ├── MarcarAsistencia.jsx          ← Vista alumno (Mobile)
        └── admin/
            └── AdminDashboard.jsx        ← Dashboard admin (Desktop)
```

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# → Edita .env con tus credenciales de Firebase

# 3. Iniciar en desarrollo
npm run dev

# 4. Build para producción
npm run build
```

---

## Configuración Firebase

### 1. Crear proyecto en Firebase Console
Ve a https://console.firebase.google.com y crea un proyecto.

### 2. Habilitar Authentication
- Authentication → Sign-in method → Email/Password → Activar

### 3. Crear base de datos Firestore
- Firestore Database → Create database → Production mode

### 4. Desplegar reglas de seguridad
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### 5. Crear usuarios admin (custom claims)
En Firebase Admin SDK (script de Node.js o Cloud Function):
```javascript
const admin = require('firebase-admin');
admin.auth().setCustomUserClaims('UID_DEL_ADMIN', { admin: true });
```

---

## Rutas de la aplicación

| Ruta | Vista | Acceso |
|------|-------|--------|
| `/login` | Formulario de autenticación | Pública |
| `/marcar?sala=1A` | Marcado de asistencia | Alumno autenticado |
| `/admin/dashboard` | Panel de administración | Admin (custom claim) |

---

## Seguridad implementada

| Capa | Mecanismo | Descripción |
|------|-----------|-------------|
| **Geofencing** | Haversine en `useGeofencing.js` | Distancia ≤50m del COED obligatoria |
| **Timestamp** | `serverTimestamp()` Firebase | Nunca `new Date()` del dispositivo |
| **Anti-duplicado** | Query Firestore antes de insertar | Un registro por alumno por día |
| **QR por sección** | URL `?sala=ID` única por grado | Alumno de 1A no puede marcar en QR de 2B |
| **Firestore Rules** | `request.auth.uid == resource.uid` | Alumno solo escribe su propio documento |
| **Admin Claims** | `request.auth.token.admin == true` | Solo admins leen todos los registros |
| **Inmutabilidad** | `allow update, delete: if false` | Registros no pueden ser alterados |

---

## Dependencias clave

```json
{
  "firebase": "^10.12.0",    ← Backend: Auth + Firestore + serverTimestamp
  "qrcode.react": "^3.1.0",  ← Generación de QR en el dashboard admin
  "react-router-dom": "^6.23.0" ← Enrutamiento + parámetros URL (?sala=)
}
```
