# Documento del Proyecto: MotoTaxi

## 1. Introducción
En la actualidad, las plataformas de transporte urbano enfrentan desafíos significativos relacionados con la alta concurrencia de usuarios, la necesidad de respuestas en tiempo real y la gestión eficiente de transacciones. El proyecto **MotoTaxi** surge como una respuesta tecnológica a estos retos, proponiendo una plataforma integral de movilidad urbana. Para garantizar la escalabilidad, tolerancia a fallos y mantenibilidad del sistema, el proyecto ha migrado de un enfoque monolítico tradicional hacia una moderna arquitectura de microservicios. Este documento detalla los objetivos, la arquitectura elegida y las decisiones técnicas fundamentales que respaldan el desarrollo de la solución, asegurando una experiencia fluida tanto para pasajeros como para conductores a través de interfaces web y móviles.

---

## 2. Objetivos del Proyecto

### 2.1 Objetivo General
Desarrollar una solución de software robusta, escalable y multiplataforma mediante la migración de un modelo monolítico hacia una arquitectura de microservicios, aplicando el patrón de arquitectura hexagonal para garantizar el desacoplamiento de la lógica de negocio y permitiendo el acceso concurrente desde dispositivos móviles, tablets y computadoras mediante despliegues en la nube.

### 2.2 Objetivos Específicos
* **Diseño Arquitectónico:** Implementar 05 microservicios independientes que utilicen el patrón de Puertos y Adaptadores (Arquitectura Hexagonal) para aislar el dominio de la infraestructura tecnológica.
* **Gestión de Persistencia:** Configurar 05 bases de datos distintas (combinando motores Relacionales y NoSQL) para asegurar el principio de autonomía de datos de cada servicio.
* **Seguridad:** Centralizar la autenticación y autorización mediante JSON Web Tokens (JWT), asegurando que el acceso sea seguro y uniforme para los clientes web y móviles.
* **Desarrollo Multiplataforma:** Construir una interfaz web de alto rendimiento con React + Vite (Dashboard y Landing Page) y una aplicación móvil nativa con React Native para entornos smartphone y tablet.
* **Operaciones Cloud:** Desplegar la infraestructura de servicios en AWS y la capa de presentación pública en Vercel, configurando pipelines automatizados de CI/CD vía GitHub Actions.
* **Colaboración:** Evidenciar el trabajo en equipo a través de un flujo de trabajo profesional en GitHub con el manejo de ramas, control de versiones y revisiones de código.

---

## 3. Diseñar la Arquitectura del Sistema

La arquitectura del sistema MotoTaxi está diseñada bajo el paradigma de sistemas distribuidos, priorizando la resiliencia y el escalamiento horizontal independiente.

### 3.1 Arquitectura Hexagonal (Ports & Adapters)
Cada microservicio dentro de MotoTaxi implementa la Arquitectura Hexagonal. Este patrón de diseño aísla la lógica de negocio (el "Core" o "Dominio") de las dependencias externas (bases de datos, interfaces de usuario, frameworks externos). 
* **Puertos (Ports):** Definen los contratos (interfaces) de cómo el núcleo del negocio se comunica con el exterior.
* **Adaptadores (Adapters):** Implementan los puertos. Existen adaptadores de "Entrada" (como los Controladores Express que reciben peticiones HTTP) y adaptadores de "Salida" (como los Repositorios que ejecutan consultas SQL o llamadas a APIs de terceros).
* **Beneficio:** Esta separación permite cambiar el motor de base de datos (por ejemplo, pasar de MySQL a MongoDB en el servicio de calificaciones) sin necesidad de reescribir ni alterar los Casos de Uso del negocio.

### 3.2 Definición de los 05 Microservicios
El sistema se ha descompuesto en 5 microservicios altamente cohesivos y débilmente acoplados:

1. **Auth Service (Autenticación y Usuarios):** Responsable del registro, inicio de sesión, encriptación de contraseñas y emisión de tokens JWT.
2. **Rides Service (Gestión de Viajes):** Maneja el ciclo de vida del viaje, desde la solicitud del pasajero, la aceptación del conductor, hasta la finalización del trayecto.
3. **Payments Service (Pagos y Facturación):** Gestiona las transacciones financieras, pasarelas de pago y cálculo de tarifas dinámicas.
4. **Ratings Service (Calificaciones y Reseñas):** Administra el feedback post-viaje, permitiendo a pasajeros y conductores evaluarse mutuamente, afectando la reputación en el sistema.
5. **Tracking Service (Geolocalización en Tiempo Real):** Maneja la ubicación GPS de los conductores y pasajeros en tiempo real mediante WebSockets, permitiendo la asignación eficiente de viajes cercanos.

### 3.3 Gestión de Bases de Datos Independientes
Siguiendo las mejores prácticas de microservicios, se ha eliminado la base de datos centralizada. Cada microservicio es dueño absoluto de su propia persistencia, lo que evita cuellos de botella y acoplamiento de esquemas:

* **mototaxi_auth (MySQL):** Motor relacional para garantizar la integridad y unicidad de las credenciales de usuarios.
* **mototaxi_rides (MySQL):** Motor relacional estructurado para mantener el historial de viajes, estados y relaciones mediante identificadores (sin foreign keys directas a otros servicios).
* **mototaxi_payments (MySQL):** Motor relacional, necesario para garantizar transacciones ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad) en procesos financieros.
* **mototaxi_ratings (MongoDB):** Motor NoSQL orientado a documentos, ideal para almacenar reseñas y comentarios de estructura variable sin esquemas rígidos.
* **mototaxi_tracking (Redis):** Motor NoSQL en memoria (In-Memory Data Store), utilizado por su extrema velocidad y capacidades geoespaciales para almacenar y consultar la ubicación GPS en tiempo real de los choferes, además de persistencia secundaria en MySQL.
