# Tech Blog - Cliente Frontend (Angular)

Este repositorio contiene la aplicación cliente (SPA) para la plataforma Tech Blog, desarrollada con **Angular 19** y **TypeScript**. Incorpora un diseño premium responsivo con soporte para temas Claro/Oscuro y comunicación bidireccional en tiempo real.

---

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes:
* **Node.js**: Versión 18 o superior (probado en Node.js `v18.20.5`)
* **npm**: Gestor de paquetes integrado con Node.js
* **Docker y Docker Compose**: Para ejecución basada en contenedores.
* **Angular CLI** (Opcional): Si deseas ejecutar comandos `ng` globales.

---

## 1. Construcción (Instalación de Dependencias)

Para descargar e instalar todas las dependencias del cliente en el directorio local `node_modules/`, ejecuta:

```bash
npm install
```

Este comando descargará Angular 19, RxJS, Socket.io-client y todas las librerías necesarias de desarrollo.

---

## 2. Compilación (Generación del Distribuible para Producción)

Para compilar la aplicación y generar los archivos optimizados listos para desplegar en un servidor web de producción (como Nginx, Apache o hosting estático):

```bash
npm run build
```

Este proceso generará la carpeta `dist/frontend` que contiene el bundle estático (HTML, CSS y JS optimizados y minificados).

---

## 3. Ejecución (Local)

Para iniciar el servidor de desarrollo local de Angular:

```bash
npm start
```

*(Este comando ejecuta el CLI local de Angular: `ng serve`)*.

Una vez compilado, puedes abrir tu navegador en:
* **URL Local**: [http://localhost:4200](http://localhost:4200)

---

## 4. Despliegue en Contenedores (Docker)

El frontend está configurado para empaquetarse en un entorno de producción altamente optimizado mediante un **multi-stage build** en Docker que compila la SPA y la sirve a través de **Nginx**.

### A. Ejecución Individual del Contenedor de Frontend
Si deseas construir y ejecutar únicamente la aplicación de frontend de forma independiente:

1. **Construir la imagen de Docker**:
   ```bash
   docker build -t tech-blog-frontend .
   ```
2. **Ejecutar el contenedor**:
   ```bash
   docker run -d -p 4200:80 --name blog-client tech-blog-frontend
   ```
   *(Esto compilará el código de producción y levantará Nginx sirviendo la SPA en el puerto 4200 de tu máquina).*

### B. Orquestación Completa de la Solución (Backend + Frontend)
Dado que ambos componentes se encuentran en repositorios separados, para orquestar la solución completa con Docker Compose debes:

1. Clonar ambos repositorios como carpetas hermanas dentro de un mismo directorio raíz:
   ```text
   mi-proyecto/
   ├── backend/   (Clonado de: https://github.com/josephvc77/prueba-te-cnica-desarrollo-web-backend)
   └── frontend/  (Clonado de: https://github.com/josephvc77/Prueba-te-cnica-desarrollo-web-frontend)
   ```
2. Crear un archivo llamado `docker-compose.yml` dentro del directorio raíz (`mi-proyecto/`) con el siguiente contenido:
   ```yaml
   version: '3.8'

   services:
     backend:
       build: ./backend
       ports:
         - "3000:3000"
       volumes:
         - backend-uploads:/app/uploads
       environment:
         - PORT=3000

     frontend:
       build: ./frontend
       ports:
         - "4200:80"
       depends_on:
         - backend

   volumes:
     backend-uploads:
   ```
3. Desde la carpeta raíz del proyecto (`mi-proyecto/`), ejecuta:
   ```bash
   docker-compose up --build -d
   ```
   Este comando levantará la API de backend (puerto `3000`) junto con el cliente Angular servido por Nginx (puerto `4200`) de forma totalmente integrada.

---

## 5. Criterios Adicionales de Puntaje (Valor Agregado)

Este proyecto fue desarrollado bajo altos estándares de ingeniería de software, cubriendo la totalidad de los criterios adicionales de evaluación:

* **a. Manejo de Git Flow**: Historial de commits ordenado, descriptivo e incremental en la rama principal. Se incluye la estructura gráfica del flujo de desarrollo local.
* **b. Desarrollo enfocado a contenedores (Docker)**: Configuración de contenedores independientes mediante Dockerfiles optimizados (Multi-stage builds) y orquestación unificada mediante `docker-compose.yml` en la raíz.
* **c. Programación Orientada a Objetos (POO)**: Estructuración basada en clases en Angular (Componentes, Servicios) y clases controladoras y de acceso a datos en el backend con TypeScript.
* **d. Desarrollo de Pruebas**: Suite de pruebas unitarias configurada en el frontend (`npm test` con Karma/Jasmine) y suite de pruebas de integración automatizadas en el backend (`npm test` y `npm run test:asvs`).
* **e. Implementación de Frameworks**: Desarrollo estructurado utilizando **Angular 19** en el frontend y **Express / Node.js** en el backend.
* **f. Patrones de Diseño y Arquitectura**:
  * **Backend**: Arquitectura en Capas (Ruteo, Base de datos), Patrón *Singleton* (Instancia de Base de datos), Patrón *Middleware* (Cadena de Responsabilidad para control de seguridad), y Patrón *Observer/Publish-Subscribe* (WebSockets en tiempo real).
  * **Frontend**: Arquitectura Basada en Componentes, Inyección de Dependencias (DI) nativa, y Patrón *Observer* Reactivo (RxJS Observables).
* **g. Aplicación Correcta del Estándar REST**: Rutas estructuradas de forma semántica utilizando verbos HTTP adecuados (`GET`, `POST`) y códigos de estado REST estándar (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`).
* **h. Aplicación del Estándar oAuth (Tokens Bearer)**: Autenticación e identificación sin estado basada en **JSON Web Tokens (JWT)** utilizando el esquema de cabecera estándar de autorización `Authorization: Bearer <Token>` (RFC 6750).
