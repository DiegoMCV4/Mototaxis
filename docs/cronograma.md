# 📅 Cronograma de Actividades — MotoTaxi

## Resumen del Proyecto

| Campo | Detalle |
|---|---|
| **Duración total** | 8 semanas (2 meses) |
| **Metodología** | Scrum — Sprints de 2 semanas |
| **Inicio** | Abril 2026 |
| **Cierre** | Mayo 2026 |

---

## Diagrama de Gantt

```mermaid
gantt
    title Cronograma MotoTaxi — Plataforma de Microservicios
    dateFormat  YYYY-MM-DD
    axisFormat  %d-%b

    section 📐 Diseño y Planificación
    Análisis de requisitos                    :done, 2026-04-01, 4d
    Diseño de arquitectura hexagonal          :done, 2026-04-03, 5d
    Definición de 5 microservicios            :done, 2026-04-05, 3d
    Diseño de base de datos (5 independientes):done, 2026-04-06, 4d
    Setup repositorio GitHub (ramas)          :done, 2026-04-08, 1d

    section 🔧 Infraestructura Base
    Docker + Docker Compose                   :done, 2026-04-10, 3d
    API Gateway centralizado                  :done, 2026-04-11, 4d
    MySQL (auth, rides, payments)             :done, 2026-04-12, 3d
    MongoDB (ratings-service)                 :done, 2026-04-13, 3d
    Redis (tracking-service)                  :done, 2026-04-14, 2d

    section 🔐 Microservicio 1 — Auth
    Modelos de dominio (User, JWT)            :done, 2026-04-15, 2d
    Casos de uso (Register, Login)            :done, 2026-04-16, 2d
    Repositorio MySQL + adaptadores           :done, 2026-04-17, 2d
    Endpoints REST + testing                  :done, 2026-04-18, 2d

    section 🚗 Microservicio 2 — Rides
    Modelo Ride + estados del viaje           :done, 2026-04-19, 2d
    Casos de uso (Request, Accept, Complete)  :done, 2026-04-20, 3d
    Integración con Tracking vía WebSocket    :done, 2026-04-21, 2d

    section 📍 Microservicio 3 — Tracking
    WebSocket con Socket.io                   :done, 2026-04-22, 3d
    Integración Redis para ubicaciones        :done, 2026-04-23, 2d
    Chat en viaje + emergencias               :done, 2026-04-24, 2d

    section ⭐ Microservicio 4 — Ratings
    Schema MongoDB con Mongoose               :done, 2026-04-25, 2d
    Repository Pattern (MongoRatingRepository):done, 2026-04-26, 2d
    Endpoints calificaciones                  :done, 2026-04-27, 2d

    section 💳 Microservicio 5 — Payments
    Wallet, métodos de pago, transacciones    :done, 2026-04-28, 3d
    Integración con Rides al completar viaje  :done, 2026-04-29, 2d

    section 🌐 Frontend
    React + Vite + Tailwind                   :done, 2026-04-30, 4d
    Login / Registro                          :done, 2026-05-01, 2d
    PassengerHome + DriverHome                :done, 2026-05-02, 3d
    Mapa GPS en tiempo real (Leaflet)         :done, 2026-05-03, 2d
    Dark Mode + Toast notifications           :done, 2026-05-03, 1d

    section 🚀 Landing Page (Vercel)
    Diseño UI landing page                    :done, 2026-05-04, 2d
    Secciones Hero, Features, Arquitectura    :done, 2026-05-05, 2d
    Deploy en Vercel                          :done, 2026-05-06, 1d

    section 🔒 Seguridad y HTTPS
    Nginx reverse proxy                       :done, 2026-05-07, 2d
    Certbot SSL (mrt.viewdns.net)             :done, 2026-05-08, 1d
    Headers de seguridad + Rate Limiting      :done, 2026-05-09, 1d

    section ⚙️ CI/CD
    GitHub Actions — CI (lint + health check) :done, 2026-05-09, 2d
    GitHub Actions — Deploy backend (AWS ECS) :done, 2026-05-10, 2d
    GitHub Actions — Deploy frontend (Vercel) :done, 2026-05-11, 1d

    section ☁️ Despliegue en AWS
    Amazon ECR (imágenes Docker)              :active, 2026-05-12, 2d
    Amazon ECS Fargate (microservicios)       :2026-05-13, 3d
    Amazon RDS (MySQL producción)             :2026-05-13, 2d
    S3 + CloudFront (frontend app)            :2026-05-15, 2d

    section 📄 Documentación y Cierre
    Documentación de casos de uso             :done, 2026-05-16, 2d
    Cronograma y metodología ágil             :done, 2026-05-17, 1d
    Fuentes de información                    :done, 2026-05-18, 1d
    Evidencias del equipo (GitHub commits)    :2026-05-19, 2d
    Demo y presentación final                 :milestone, 2026-05-21, 0d
```

---

## Hitos Clave

| Hito | Fecha | Estado |
|---|---|---|
| ✅ Arquitectura definida | 08 Abr 2026 | Completado |
| ✅ 5 Microservicios operativos localmente | 29 Abr 2026 | Completado |
| ✅ Frontend funcional con Login/Dashboard | 03 May 2026 | Completado |
| ✅ CI/CD con GitHub Actions | 11 May 2026 | Completado |
| 🔄 Despliegue en AWS ECS | 15 May 2026 | En progreso |
| ⬜ Demo y presentación final | 21 May 2026 | Pendiente |
