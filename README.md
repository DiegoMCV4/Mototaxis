# 🏍️ MotoTaxi - App de Transporte con Microservicios

Una aplicación móvil moderna de transporte tipo mototaxi, construida con **arquitectura de microservicios**, **base de datos MySQL**, desplegable en **AWS**, y empaquetable como **app móvil Android** con Capacitor.

## 📐 Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                    📱 App Móvil (Capacitor)                  │
│                  React + Vite + Tailwind CSS                 │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│              🔀 API Gateway (Puerto 3000)                    │
│           Enrutador central + Proxy WebSocket                │
└──┬──────────┬──────────┬──────────┬──────────┬───────────────┘
   │          │          │          │          │
┌──▼──┐  ┌───▼──┐  ┌───▼──┐  ┌───▼──┐  ┌───▼──┐
│🔐   │  │🚗   │  │⭐   │  │📍   │  │💳   │
│Auth │  │Rides│  │Rate │  │Track│  │Pay  │
│3001 │  │3002 │  │3003 │  │3004 │  │3005 │
└──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘
   │        │        │        │        │
┌──▼────────▼────────▼────────▼────────▼───────────────────────┐
│                🗄️ MySQL (Amazon RDS)                         │
│    users | rides | ratings | payments | tracking | messages  │
└──────────────────────────────────────────────────────────────┘
```

## 🚀 Los 5 Microservicios

| # | Servicio | Puerto | Descripción |
|---|----------|--------|-------------|
| 1 | **auth-service** | 3001 | Registro, login, JWT, perfil de usuario |
| 2 | **rides-service** | 3002 | CRUD de viajes (solicitar, aceptar, iniciar, completar) |
| 3 | **ratings-service** | 3003 | Calificaciones y reviews |
| 4 | **tracking-service** | 3004 | Ubicación en tiempo real (Socket.io), chat, emergencias |
| 5 | **payments-service** | 3005 | Métodos de pago, wallet, transacciones |
| — | **api-gateway** | 3000 | Enrutador central hacia todos los microservicios |

## 🚀 Características

### Para Pasajeros
- ✅ Solicitar viajes en tiempo real
- 📍 Rastrear ubicación del conductor
- 💬 Chat con el conductor
- 🆘 Botón de emergencia
- 🧾 Historial de viajes
- ⭐ Calificación de conductores
- 💳 Múltiples métodos de pago
- 💰 Wallet digital

### Para Conductores
- 📍 Conectarse/desconectarse como disponible
- 📲 Recibir solicitudes de viajes
- 💰 Ver ganancias en tiempo real
- ⭐ Rating de pasajeros
- 🗺️ Compartir ubicación en vivo
- 💬 Chat con pasajeros

## 📋 Requisitos

- **Node.js** 16+
- **Docker** y **Docker Compose**
- **MySQL** 8.0 (incluido en Docker Compose)

## 🔧 Instalación y Ejecución

### Opción 1: Docker Compose (Recomendado)

```bash
# Levantar TODO (MySQL + 5 microservicios + API Gateway)
docker-compose up --build

# En segundo plano
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Opción 2: Ejecución Manual

```bash
# 1. Iniciar MySQL (debe estar corriendo en localhost:3306)
# 2. Ejecutar el script de base de datos
mysql -u root -p < database/init.sql

# 3. Instalar dependencias de cada microservicio
cd services/auth-service && npm install
cd ../rides-service && npm install
cd ../ratings-service && npm install
cd ../tracking-service && npm install
cd ../payments-service && npm install
cd ../api-gateway && npm install

# 4. Iniciar cada microservicio (en terminales separadas)
cd services/auth-service && npm start
cd services/rides-service && npm start
cd services/ratings-service && npm start
cd services/tracking-service && npm start
cd services/payments-service && npm start
cd services/api-gateway && npm start

# 5. Frontend
cd frontend && npm install && npm run dev
```

## 📱 App Móvil (Capacitor)

```bash
cd frontend

# Instalar Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/geolocation @capacitor/status-bar @capacitor/splash-screen

# Inicializar Capacitor
npx cap init

# Construir el frontend
npm run build

# Agregar plataforma Android
npx cap add android

# Sincronizar cambios
npx cap sync

# Abrir en Android Studio
npx cap open android
```

## ☁️ Despliegue en AWS

```bash
# Configurar AWS CLI
aws configure

# Ejecutar script de despliegue
chmod +x aws/deploy.sh
./aws/deploy.sh
```

Servicios AWS utilizados:
- **Amazon ECS (Fargate)**: Contenedores de microservicios
- **Amazon ECR**: Registro de imágenes Docker
- **Amazon RDS**: Base de datos MySQL administrada
- **Amazon S3 + CloudFront**: Frontend estático

## 👤 Cuentas de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Pasajero | `passenger@demo.com` | `password` |
| Conductor | `driver@demo.com` | `password` |

## 🗄️ Base de Datos

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios (pasajeros y conductores) |
| `rides` | Viajes con estados y ubicaciones |
| `ratings` | Calificaciones de viajes |
| `payment_methods` | Métodos de pago registrados |
| `transactions` | Historial de transacciones |
| `driver_locations` | Ubicación en tiempo real de conductores |
| `messages` | Mensajes de chat por viaje |
| `emergency_contacts` | Contactos de emergencia |

## 🔌 API Endpoints

### Auth Service (`/api/auth`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/verify` | Verificar token JWT |
| GET | `/api/user/:id` | Obtener perfil |
| PUT | `/api/user/:id` | Actualizar perfil |

### Rides Service (`/api/rides`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/rides/request` | Solicitar viaje |
| POST | `/api/rides/:id/accept` | Aceptar viaje |
| POST | `/api/rides/:id/start` | Iniciar viaje |
| POST | `/api/rides/:id/complete` | Completar viaje |
| POST | `/api/rides/:id/cancel` | Cancelar viaje |
| GET | `/api/rides/active/:userId` | Viajes activos |
| GET | `/api/rides/history/:userId` | Historial |
| GET | `/api/rides/available` | Viajes disponibles |

### Ratings Service (`/api/ratings`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/ratings` | Crear calificación |
| GET | `/api/ratings/:userId` | Obtener calificaciones |
| GET | `/api/ratings/average/:userId` | Promedio de calificación |

### Tracking Service (`/api/tracking`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/tracking/location` | Guardar ubicación |
| GET | `/api/tracking/drivers/nearby` | Conductores cercanos |
| GET | `/api/tracking/messages/:rideId` | Mensajes de chat |

### Payments Service (`/api/payments`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/payments/methods` | Agregar método de pago |
| GET | `/api/payments/methods/:userId` | Obtener métodos |
| DELETE | `/api/payments/methods/:methodId` | Eliminar método |
| POST | `/api/payments/charge` | Cobrar viaje |
| POST | `/api/payments/topup` | Recargar wallet |
| GET | `/api/payments/transactions/:userId` | Transacciones |
| GET | `/api/payments/wallet/:userId` | Balance del wallet |

## 🔌 WebSockets (Tracking Service)

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `driverLocation` | Client → Server | Ubicación del conductor |
| `driversUpdate` | Server → Client | Actualización de conductores |
| `newRideRequest` | Bidireccional | Nueva solicitud de viaje |
| `rideAccepted` | Server → Client | Viaje aceptado |
| `rideStarted` | Server → Client | Viaje iniciado |
| `rideCompleted` | Server → Client | Viaje completado |
| `message` | Client → Server | Enviar mensaje |
| `newMessage` | Server → Client | Nuevo mensaje |
| `emergencyCall` | Client → Server | Emergencia |
| `emergencyAlert` | Server → Client | Alerta de emergencia |

## 🏗️ Estructura del Proyecto

```
Moto/
├── docker-compose.yml              # Orquestación de servicios
├── .env.example                    # Variables de entorno
├── README.md
│
├── database/
│   └── init.sql                    # Schema de MySQL
│
├── services/
│   ├── api-gateway/                # Enrutador central
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   │
│   ├── auth-service/               # MS 1: Autenticación
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── server.js
│   │   └── db.js
│   │
│   ├── rides-service/              # MS 2: Viajes
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── server.js
│   │   └── db.js
│   │
│   ├── ratings-service/            # MS 3: Calificaciones
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── server.js
│   │   └── db.js
│   │
│   ├── tracking-service/           # MS 4: Tracking + Chat
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── server.js
│   │   └── db.js
│   │
│   └── payments-service/           # MS 5: Pagos
│       ├── Dockerfile
│       ├── package.json
│       ├── server.js
│       └── db.js
│
├── frontend/                       # App React (Capacitor)
│   ├── capacitor.config.ts
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── PassengerHome.jsx
│   │   │   ├── DriverHome.jsx
│   │   │   └── RideMap.jsx
│   │   ├── socket.js
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── aws/
    ├── deploy.sh                   # Script de despliegue
    └── task-definition.json        # Task definition ECS
```

## 🎨 Tecnologías

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Express.js, Node.js (5 microservicios) |
| **Base de datos** | MySQL 8.0 (Amazon RDS en producción) |
| **Comunicación** | REST API + WebSockets (Socket.io) |
| **Autenticación** | JWT + bcrypt |
| **Contenedores** | Docker + Docker Compose |
| **Cloud** | AWS (ECS Fargate, ECR, RDS, S3) |
| **App Móvil** | Capacitor (Android) |

## 📞 Soporte

Para cualquier pregunta o problema, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para transporte seguro y confiable**
