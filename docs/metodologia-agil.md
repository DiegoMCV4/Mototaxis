# ⚡ Metodología Ágil — MotoTaxi

## Metodología Aplicada: **SCRUM**

El desarrollo de MotoTaxi siguió la metodología **Scrum** adaptada a equipos académicos, con sprints de 2 semanas, revisiones de código vía Pull Requests en GitHub y entregas incrementales.

---

## Roles del Equipo

| Rol Scrum | Responsabilidad |
|---|---|
| **Product Owner** | Define el backlog, prioriza funcionalidades, valida entregables |
| **Scrum Master** | Facilita ceremonias, remueve impedimentos, garantiza el proceso |
| **Dev Team** | Diseño, desarrollo e integración de microservicios y frontend |

---

## Sprints del Proyecto

```mermaid
gantt
    title Plan de Sprints — MotoTaxi
    dateFormat  YYYY-MM-DD
    section Sprint 0 — Planificación
    Definición de requisitos      :done, s0a, 2026-04-01, 7d
    Diseño de arquitectura        :done, s0b, after s0a, 7d
    Setup de repositorio GitHub   :done, s0c, after s0a, 3d

    section Sprint 1 — Base del Sistema
    Auth Service + JWT            :done, s1a, 2026-04-15, 7d
    Base de datos MySQL (auth)    :done, s1b, 2026-04-15, 5d
    Docker Compose inicial        :done, s1c, after s1a, 5d

    section Sprint 2 — Core de Negocio
    Rides Service (CRUD viajes)   :done, s2a, 2026-04-22, 7d
    Tracking Service + WebSocket  :done, s2b, 2026-04-22, 7d
    Redis para ubicaciones        :done, s2c, after s2b, 3d

    section Sprint 3 — Pagos y Calificaciones
    Payments Service + Wallet     :done, s3a, 2026-04-29, 7d
    Ratings Service + MongoDB     :done, s3b, 2026-04-29, 7d
    API Gateway centralizado      :done, s3c, after s3a, 5d

    section Sprint 4 — Frontend y Cloud
    Frontend React + Vite         :done, s4a, 2026-05-06, 7d
    Landing Page (Vercel)         :done, s4b, 2026-05-06, 5d
    Nginx + HTTPS Certbot         :done, s4c, after s4a, 3d

    section Sprint 5 — CI/CD y Despliegue
    GitHub Actions CI/CD          :active, s5a, 2026-05-13, 7d
    Deploy AWS ECS                :s5b, after s5a, 5d
    Pruebas de integración        :s5c, after s5b, 3d

    section Sprint 6 — Cierre
    Documentación final           :s6a, 2026-05-20, 5d
    Demo y presentación           :s6b, after s6a, 3d
```

---

## Ceremonias Scrum

| Ceremonia | Frecuencia | Duración | Descripción |
|---|---|---|---|
| **Sprint Planning** | Inicio de cada sprint | 1 hora | Selección de ítems del backlog y asignación |
| **Daily Standup** | Diario | 15 min | ¿Qué hice? ¿Qué haré? ¿Bloqueos? |
| **Sprint Review** | Fin de cada sprint | 30 min | Demo de lo entregado al Product Owner |
| **Sprint Retrospective** | Fin de cada sprint | 30 min | ¿Qué mejorar en el próximo sprint? |

---

## Product Backlog (User Stories priorizadas)

| ID | Prioridad | Historia de Usuario | Estado |
|---|---|---|---|
| US-01 | 🔴 Alta | Como pasajero, quiero registrarme y hacer login | ✅ Done |
| US-02 | 🔴 Alta | Como pasajero, quiero solicitar un viaje | ✅ Done |
| US-03 | 🔴 Alta | Como conductor, quiero aceptar y gestionar viajes | ✅ Done |
| US-04 | 🔴 Alta | Como usuario, quiero ver la ubicación en tiempo real | ✅ Done |
| US-05 | 🟡 Media | Como pasajero, quiero pagar digitalmente | ✅ Done |
| US-06 | 🟡 Media | Como usuario, quiero calificar al otro participante | ✅ Done |
| US-07 | 🟡 Media | Como usuario, quiero chatear durante el viaje | ✅ Done |
| US-08 | 🟡 Media | Como pasajero, quiero activar emergencia | ✅ Done |
| US-09 | 🟠 Baja  | Como usuario, quiero modo oscuro | ✅ Done |
| US-10 | 🟠 Baja  | Como admin, quiero ver métricas del sistema | 🔄 En progreso |

---

## Flujo de Trabajo GitHub

```
main ←── develop ←── feature/us-01-auth
                ←── feature/us-02-rides
                ←── feature/us-05-payments
                ←── hotfix/fix-jwt-expiry
```

- **`main`**: código en producción (protegida, requiere PR aprobado)
- **`develop`**: integración continua de features
- **`feature/*`**: desarrollo de cada User Story
- **`hotfix/*`**: correcciones urgentes en producción

### Reglas de Merge
1. Todo cambio pasa por **Pull Request**
2. Requiere revisión de al menos **1 miembro del equipo**
3. CI debe estar en verde (GitHub Actions)
4. Se hace squash merge para mantener historial limpio
