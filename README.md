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
Si deseas construir y ejecutar únicamente la aplicación de frontend:

1. **Construir la imagen de Docker**:
   ```bash
   docker build -t tech-blog-frontend .
   ```
2. **Ejecutar el contenedor**:
   ```bash
   docker run -d -p 4200:80 --name blog-client tech-blog-frontend
   ```
   *(Esto compilará el código de producción y levantará Nginx sirviendo la SPA en el puerto 4200 de tu máquina).*

### B. Orquestación Completa (Backend + Frontend)
En el directorio raíz del proyecto se incluye un archivo `docker-compose.yml` para levantar la solución completa de forma integrada con un solo comando.

Desde la carpeta raíz del proyecto, ejecuta:
```bash
docker-compose up --build -d
```

Este comando levantará la base de datos y la API de backend (puerto `3000`) junto con el cliente Angular servido por Nginx (puerto `4200` apuntando internamente al puerto `80`).
