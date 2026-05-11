# 🏍️ Motoch: Plataforma de Microservicios para Mototaxis
**Documento Técnico de Proyecto — Taller 4**
**UNACH | Facultad de Ingeniería**

---

## 1. Introducción
Motoch es una solución tecnológica integral diseñada para modernizar el servicio de transporte de mototaxis. El proyecto migra de un esquema tradicional a una infraestructura de **Microservicios** distribuida en la nube, garantizando alta disponibilidad, seguridad y una experiencia de usuario fluida tanto en entornos web como móviles.

## 2. Objetivos del Proyecto

### 2.1 Objetivo General
Desarrollar una solución de software robusta, escalable y multiplataforma mediante la migración de un modelo monolítico hacia una **Arquitectura de Microservicios**, aplicando el patrón de **Arquitectura Hexagonal** para garantizar el desacoplamiento de la lógica de negocio y permitiendo el acceso concurrente mediante despliegues en la nube.

### 2.2 Objetivos Específicos
*   **Diseño Arquitectónico:** Implementar 05 microservicios independientes utilizando el patrón de Puertos y Adaptadores.
*   **Gestión de Persistencia:** Configurar 05 bases de datos distintas (MySQL, MongoDB y Redis) para asegurar la autonomía de cada servicio.
*   **Seguridad:** Centralizar la autenticación mediante **JSON Web Tokens (JWT)** para clientes web y móviles.
*   **Desarrollo Multiplataforma:** Construir interfaces con React + Vite (Web) y React Native (Móvil/Tablet).
*   **Operaciones Cloud:** Desplegar la infraestructura de servicios en AWS y la capa de presentación en Vercel, configurando pipelines de **CI/CD via GitHub Actions**.

---

## 3. Arquitectura del Sistema

### 3.1 Arquitectura Hexagonal (Ports & Adapters)
Se implementó para aislar la lógica de negocio (Domain) de los detalles técnicos (Infrastructure).
*   **Capa de Dominio:** Entidades y reglas de negocio puras.
*   **Capa de Aplicación:** Casos de uso y orquestación.
*   **Capa de Infraestructura:** Adaptadores para bases de datos, APIs externas y controladores.

### 3.2 Definición de los 05 Microservicios
1.  **Auth-Service:** Gestión de usuarios y sesiones (Puerto 3001).
2.  **Rides-Service:** Orquestación de solicitudes de viaje (Puerto 3002).
3.  **Ratings-Service:** Sistema NoSQL de calificaciones (Puerto 3003).
4.  **Tracking-Service:** Seguimiento GPS en tiempo real vía WebSockets (Puerto 3004).
5.  **Payments-Service:** Gestión de transacciones y billetera digital (Puerto 3005).

### 3.3 Gestión de Bases de Datos Independientes
Cada servicio posee su propia persistencia para evitar el acoplamiento:
*   **MySQL (Auth, Rides, Payments):** Datos relacionales de alta consistencia.
*   **MongoDB (Ratings):** Flexibilidad para comentarios y reseñas.
*   **Redis (Tracking):** Almacenamiento en memoria para alta velocidad en coordenadas GPS.

---

## 4. Seguridad y Acceso

### 4.1 Implementación de JSON Web Tokens (JWT)
Se utiliza un esquema de seguridad centralizado donde el `Auth-Service` emite tokens firmados que son validados por el **API Gateway** y los microservicios, asegurando que solo usuarios autenticados operen en la plataforma.

### 4.2 HTTPS y DNS
*   **Certificado SSL:** Implementado mediante Certbot (Let's Encrypt) en el servidor AWS.
*   **Gateway:** Centralización del tráfico mediante Nginx como proxy inverso.

---

## 5. Interfaces de Usuario (Frontend)

### 5.1 Landing Page y Dashboard (React + Vite)
*   **URL:** [https://motoch-unach.vercel.app](https://motoch-unach.vercel.app)
*   Interfaz optimizada para marketing y administración de la flota.

### 5.2 Aplicación Móvil y Tablet (React Native)
*   **Nombre:** Motoch
*   **Tecnología:** Expo / React Native.
*   **Distribución:** Archivo APK nativo con ícono personalizado de Jaguar.

---

## 6. Estrategia de Despliegue (Cloud)

### 6.1 Backend en Amazon Web Services (AWS)
Arquitectura de doble instancia EC2:
*   **Instancia 1 (Puerta):** Nginx y API Gateway (IP: 3.133.144.159).
*   **Instancia 2 (Cerebro):** Orquestación de los 5 Microservicios y 5 Bases de Datos vía Docker Compose (IP: 18.118.101.175).

### 6.2 Frontend en Vercel
La Landing Page se despliega automáticamente en Vercel, asegurando latencia mínima y escalabilidad global.

### 6.3 Automatización (CI/CD)
Uso de **GitHub Actions** para que cada cambio en el código se despliegue automáticamente en AWS sin intervención manual.

---

## 7. Metodología de Desarrollo
Se aplicó **Metodología Ágil (Scrum)**:
*   **Sprints:** Ciclos de desarrollo de una semana para cada microservicio.
*   **Ciclo de Vida:** Análisis -> Diseño Hexagonal -> Desarrollo Dockerizado -> Pruebas de Integración -> Despliegue Cloud.

## 8. Cronograma de Actividades
1.  **Semana 1:** Diseño de arquitectura y setup de bases de datos.
2.  **Semana 2:** Desarrollo de Microservicios (Auth & Rides).
3.  **Semana 3:** Integración de GPS y Pagos.
4.  **Semana 4:** Despliegue en AWS, Landing Page y Generación de APK.

---

## 9. Anexos y Evidencias

### 9.1 Repositorios de GitHub
*   **Link:** [https://github.com/DiegoMCV4/Mototaxis](https://github.com/DiegoMCV4/Mototaxis)
*   Historial de ramas y Pull Requests visibles como evidencia de colaboración.

### 9.2 Evidencia del Equipo de Trabajo
*   **Integrantes:** Diego, Anuar, Pablo, Jesus.
*   **Materia:** Taller 4.
*   **Docente:** DR. GUTIÉRREZ ALFARO LUIS.

---

## 10. Fuente de Información
*   Documentación oficial de AWS, React, Docker y Patrones de Arquitectura de Software.
