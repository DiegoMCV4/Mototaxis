# Documentación Formal del Proyecto: Plataforma MotoTaxi

## 1. Introducción

El servicio de mototaxis representa uno de los medios de transporte urbano más utilizados en Latinoamérica, especialmente en ciudades donde la congestión vehicular hace indispensable la agilidad y el bajo costo de este tipo de servicio. Sin embargo, la mayoría de las operaciones se gestionan de manera informal, careciendo de tecnología que permita la trazabilidad del viaje, la seguridad del pasajero y la optimización del tiempo de respuesta del conductor.

La plataforma **MotoTaxi** nace como respuesta a esta necesidad, ofreciendo una solución de software completa que conecta en tiempo real a pasajeros y conductores de mototaxi mediante una aplicación móvil nativa y un panel de administración web. El sistema gestiona el ciclo de vida completo de un viaje: desde la solicitud del pasajero, la asignación del conductor, el rastreo GPS en tiempo real, el pago electrónico y la calificación del servicio.

Desde el punto de vista técnico, el proyecto ha sido desarrollado siguiendo una arquitectura de **microservicios** con el patrón **Hexagonal (Ports & Adapters)**, lo que permite que cada componente del sistema opere, se escale y se despliegue de manera completamente independiente. Esta decisión arquitectónica elimina los puntos únicos de fallo de los sistemas monolíticos y facilita la incorporación de nuevas funcionalidades sin interrumpir el servicio en producción. La infraestructura de backend reside en **Amazon Web Services (AWS)** sobre contenedores Docker, mientras que la capa de presentación pública se distribuye globalmente a través de **Vercel**, y los pipelines de integración continua son gestionados mediante **GitHub Actions**.

## 2. Objetivos del Proyecto

### 2.1 Objetivo General
Desarrollar una solución de software robusta, escalable y multiplataforma mediante la migración de un modelo monolítico hacia una arquitectura de microservicios, aplicando el patrón de arquitectura hexagonal para garantizar el desacoplamiento de la lógica de negocio y permitiendo el acceso concurrente desde dispositivos móviles, tablets y computadoras mediante despliegues en la nube.

### 2.2 Objetivos Específicos
*   **Diseño Arquitectónico:** Implementar 05 microservicios independientes que utilicen el patrón de Puertos y Adaptadores para aislar el dominio de la infraestructura tecnológica.
*   **Gestión de Persistencia:** Configurar bases de datos distintas (Relacionales y NoSQL) para asegurar la autonomía de datos de cada servicio.
*   **Seguridad:** Centralizar la autenticación y autorización mediante JWT, asegurando que el acceso sea uniforme para los clientes web y móviles.
*   **Desarrollo Multiplataforma:** Construir una interfaz web de alto rendimiento con React + Vite y una aplicación móvil nativa con React Native para entornos smartphone y tablet.
*   **Operaciones Cloud:** Desplegar la infraestructura de servicios en AWS y la capa de presentación en Vercel.
*   **Colaboración:** Evidenciar el trabajo en equipo a través de un flujo de trabajo profesional en GitHub con manejo de ramas y revisiones de código.

## 3. Arquitectura del Sistema

### 3.1 Arquitectura Hexagonal (Ports & Adapters)
Cada microservicio está estructurado utilizando el patrón de Arquitectura Hexagonal. Esto divide el código en tres capas principales:
*   **Dominio (Core):** Contiene las reglas de negocio y entidades puras, sin dependencias externas.
*   **Aplicación (Use Cases):** Orquesta los flujos de negocio utilizando los puertos definidos.
*   **Infraestructura (Adapters):** Implementa los detalles técnicos (bases de datos, APIs externas, controladores web). De esta forma, el framework web (Express) o la base de datos (MySQL/Redis) pueden ser reemplazados sin afectar la lógica central.

### 3.2 Definición de los 05 Microservicios
La lógica de la plataforma se ha dividido en los siguientes servicios de backend, todos gestionados a través de un **API Gateway** centralizado en el puerto `3000`:

| # | Microservicio | Puerto | Base de Datos | Tecnología | Propósito Principal |
|---|---|---|---|---|---|
| 1 | **Auth Service** | 3001 | MySQL (`mototaxi_auth`) | Node.js + Express + JWT | Registro, login y emisión de tokens de acceso. |
| 2 | **Rides Service** | 3002 | MySQL (`mototaxi_rides`) | Node.js + Express | Gestión del ciclo de vida completo de los viajes. |
| 3 | **Tracking Service** | 3004 | MySQL + Redis | Node.js + Socket.IO | Rastreo GPS en tiempo real y chat en vivo entre usuarios. |
| 4 | **Payments Service** | 3005 | MySQL (`mototaxi_payments`) | Node.js + Express | Procesamiento de tarifas y métodos de pago. |
| 5 | **Ratings Service** | 3003 | MongoDB (`mototaxi_ratings`) | Node.js + Express + Mongoose | Calificaciones y comentarios al finalizar el viaje. |

### 3.3 Gestión de Bases de Datos Independientes
Para cumplir con el principio de *Database-per-service*, cada microservicio posee su propia base de datos aislada. Ningún servicio accede directamente a la base de datos de otro; toda comunicación se realiza a través de las APIs y eventos.

| # | Base de Datos | Motor | Servicio Propietario | Tipo |
|---|---|---|---|---|
| 1 | `mototaxi_auth` | MySQL 8.0 | Auth Service | Relacional |
| 2 | `mototaxi_rides` | MySQL 8.0 | Rides Service + Tracking | Relacional |
| 3 | `mototaxi_payments` | MySQL 8.0 | Payments Service | Relacional |
| 4 | `mototaxi_ratings` | MongoDB 7.0 | Ratings Service | NoSQL Documental |
| 5 | Cache de ubicaciones | Redis 7 | Tracking Service | NoSQL In-Memory |

*   **MySQL:** Utilizado en *Auth*, *Rides* y *Payments* para mantener la integridad transaccional e historial de datos estructurados, incluyendo las tablas de `rides` y `messages` para el chat.
*   **MongoDB:** Empleado en el *Ratings Service* por su esquema flexible, ideal para almacenar documentos de calificación de estructura variable.
*   **Redis:** Empleado en el *Tracking Service* para el manejo ultra-rápido de coordenadas geoespaciales en tiempo real y la gestión de sesiones activas de WebSockets.

## 4. Seguridad y Acceso

### 4.1 Implementación de JSON Web Tokens (JWT)
El sistema confía en una arquitectura Stateless. Una vez que un usuario (conductor o pasajero) se autentica en el *Auth Service*, recibe un JWT firmado. Este token es validado por el **API Gateway** antes de enrutar cualquier petición hacia los microservicios, asegurando que sólo usuarios autorizados puedan acceder a los recursos.

### 4.2 HTTPS (Certbot) y DNS
Para garantizar la confidencialidad de los datos en tránsito, todo el tráfico hacia el API Gateway y los clientes web se cifra mediante SSL/TLS.
*   Se utilizan certificados gratuitos generados por **Let's Encrypt / Certbot**.
*   Se han configurado registros DNS (A y CNAME) para apuntar los dominios públicos a los servidores de AWS, forzando la redirección de HTTP a HTTPS mediante Nginx.

## 5. Interfaces de Usuario (Frontend)

### 5.1 Landing Page y Dashboard (React + Vite)
*   **Landing Page:** Sitio estático y altamente optimizado (SEO, velocidad) diseñado para la captación de usuarios y promoción de la app.
*   **Dashboard Administrativo:** Interfaz privada para los administradores que permite monitorizar viajes, gestionar usuarios y revisar reportes financieros.

### 5.2 Aplicación Móvil y Tablet (React Native)
Una única base de código que se compila para iOS y Android.
*   **Experiencia Nativa:** Uso de `react-native-maps` para visualización y `expo-location` para el rastreo del dispositivo en segundo plano.
*   **Diseño Responsivo:** Uso de un *ThemeContext* dinámico para adaptar la interfaz visual a tamaños de smartphone y tablet (incluyendo Dark/Light mode).

## 6. Estrategia de Despliegue (Cloud)

La infraestructura de producción ha sido desplegada utilizando **Amazon Web Services (AWS)** y **Vercel**, adoptando un enfoque basado en contenedores Docker para garantizar la portabilidad y reproducibilidad del entorno.

### 6.1 Backend en Amazon Web Services (AWS — EC2 + Docker Compose)

El backend completo se ejecuta sobre una instancia **Amazon EC2 (Ubuntu Server)** en la región `us-east-1`. La orquestación de los 12 contenedores (microservicios + bases de datos + Nginx) se realiza con **Docker Compose**, lo que garantiza que todos los servicios levanten en el orden correcto respetando sus dependencias (health checks).

**Arquitectura de la instancia EC2:**

| Capa | Contenedor | Tecnología | Puerto Expuesto |
|---|---|---|---|
| Reverse Proxy | Nginx | Nginx + Certbot (HTTPS) | 80, 443 |
| API Gateway | mototaxi-gateway | Node.js + Express | 3000 |
| Microservicio 1 | mototaxi-auth | Node.js + JWT | 3001 (interno) |
| Microservicio 2 | mototaxi-rides | Node.js + Express | 3002 (interno) |
| Microservicio 3 | mototaxi-ratings | Node.js + Mongoose | 3003 (interno) |
| Microservicio 4 | mototaxi-tracking | Node.js + Socket.IO | 3004 |
| Microservicio 5 | mototaxi-payments | Node.js + Express | 3005 (interno) |
| Base de datos 1 | mototaxi-db-auth | MySQL 8.0 | 3307 (interno) |
| Base de datos 2 | mototaxi-db-rides | MySQL 8.0 | 3308 (interno) |
| Base de datos 3 | mototaxi-mongodb | MongoDB 7.0 | 27017 (interno) |
| Base de datos 4 | mototaxi-redis | Redis 7 | 6379 (interno) |
| Base de datos 5 | mototaxi-db-payments | MySQL 8.0 | 3309 (interno) |

> **IP Pública del servidor:** `3.133.144.159`
> Solo los puertos 80, 443, 3000 y 3004 están expuestos al exterior mediante las reglas del **Security Group** de AWS. El resto de los servicios están aislados en la red interna Docker `mototaxi-network`.

**Flujo del tráfico en producción:**
```
Usuario (HTTPS) → Nginx (443) → API Gateway (3000) → Microservicio correspondiente → Base de datos propia
```

### 6.2 Frontend Landing Page en Vercel
La *Landing Page* pública (`/landing`) está desplegada en **Vercel** y disponible en:
🔗 **https://landing-psi-blond.vercel.app**

Vercel fue elegido por su CDN global, tiempos de carga mínimos y su integración continua (CI/CD) directamente con la rama `main` del repositorio de GitHub. Cada `git push` a `main` actualiza automáticamente el sitio en producción sin intervención manual.

### 6.3 Frontend de la Aplicación (Dashboard) en AWS
El panel administrativo web (`/frontend`) se sirve a través del mismo **Nginx** de la instancia EC2, compartiendo el dominio y el esquema de seguridad HTTPS configurado con **Certbot (Let's Encrypt)**. Los archivos compilados (`/dist`) son montados como volumen en el contenedor de Nginx.

**Pipeline CI/CD (GitHub Actions):**
Los tres workflows definidos en `.github/workflows/` automatizan el ciclo completo:
- `ci.yml` → Valida el código (lint + health checks) en cada `push`.
- `deploy-frontend.yml` → Publica la Landing en Vercel automáticamente.
- `deploy-backend.yml` → Preparado para escalar a AWS ECS/ECR en el futuro.

## 7. Caso de Uso y Ciclo de Vida del Desarrollo

**Metodología Ágil (Scrum):** El proyecto se ha regido bajo iteraciones o *Sprints* de 2 semanas, permitiendo entregar incrementos funcionales (ej. Primero autenticación, luego solicitud de viaje, por último mapa en tiempo real).

**Caso de Uso Principal: Solicitar un Viaje**
1. El Pasajero selecciona un destino en su App móvil.
2. El API de *Rides Service* crea un estado de viaje `searching`.
3. El *Tracking Service* utiliza Redis para notificar por WebSocket a los conductores cercanos.
4. Un conductor acepta; el sistema cambia el estado a `accepted` y sincroniza a ambos clientes.
5. Al concluir, el *Payments Service* liquida el costo y el *Ratings Service* evalúa a las partes.

## 8. Cronograma de Actividades
1. **Fase 1 (Semanas 1-2):** Definición de la arquitectura, diseño de bases de datos y setup de repositorios.
2. **Fase 2 (Semanas 3-5):** Desarrollo del Backend (5 microservicios + API Gateway) y pruebas de API.
3. **Fase 3 (Semanas 6-8):** Desarrollo de App Móvil (React Native) e integración de mapas (WebSockets).
4. **Fase 4 (Semanas 9-10):** Construcción del Dashboard y Landing Page (React).
5. **Fase 5 (Semana 11):** Integración, pruebas end-to-end, y resolución de bugs.
6. **Fase 6 (Semana 12):** Configuración de AWS, Vercel, DNS, HTTPS y despliegue a producción.

## 9. Anexos y Evidencias

### 9.1 Repositorios de GitHub
El código fuente ha sido versionado en el siguiente repositorio público de GitHub:

🔗 **Repositorio principal:** [https://github.com/DiegoMCV4/Mototaxis](https://github.com/DiegoMCV4/Mototaxis)

La estructura del repositorio es un **monorepo** organizado por carpetas (`/services`, `/mobile`, `/landing`, `/frontend`, `/database`, `/nginx`). Se utilizan ramas de *features* y *develop* para el desarrollo, y la rama `main` recibe únicamente código estable que activa los pipelines de CI/CD automáticamente vía **GitHub Actions**.

### 9.2 Evidencia del Equipo de Trabajo

**Historial de Commits (GitHub):**
A continuación se presenta un extracto del historial de control de versiones, demostrando la integración de la arquitectura y el trabajo realizado:

* **aa5372d** - diegx4: *feat: arquitectura completa - 5 microservicios hexagonales, 5 DBs independientes (MySQL/MongoDB/Redis), CI/CD GitHub Actions, Landing Page Vercel, Nginx HTTPS mrt.viewdns.net, documentacion completa* (2026-05-03)

*(Nota: Adicional a este historial de código, se recomienda adjuntar en el documento final capturas de pantalla de las reuniones por videollamada y del tablero Kanban utilizado en Jira/Trello).*

## 10. Fuentes de Información
1. Evans, E. (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley.
2. Newman, S. (2015). *Building Microservices*. O'Reilly Media.
3. Documentación Oficial de React Native: [https://reactnative.dev/](https://reactnative.dev/)
4. Documentación Oficial de AWS y Arquitecturas Cloud.
5. Estándar de JSON Web Tokens (RFC 7519).
