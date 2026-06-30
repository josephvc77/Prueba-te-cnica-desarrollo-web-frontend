# Tech Blog - Cliente Frontend (Angular)

Este repositorio contiene la aplicación cliente (SPA) para la plataforma Tech Blog, desarrollada con **Angular 19** y **TypeScript**. Incorpora un diseño premium responsivo con soporte para temas Claro/Oscuro y comunicación bidireccional en tiempo real.

---

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes:
* **Node.js**: Versión 18 o superior (probado en Node.js `v18.20.5`)
* **npm**: Gestor de paquetes integrado con Node.js
* **Angular CLI** (Opcional): Si deseas ejecutar comandos `ng` globales, de lo contrario se ejecutarán a través del CLI local.

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

Este proceso generará la carpeta `dist/frontend` que contiene el bundle estático (HTML, CSS y JS optimizados, minificados y con nombres cifrados para evitar problemas de caché).

---

## 3. Ejecución

Para iniciar el servidor de desarrollo local de Angular:

```bash
npm start
```

*(Este comando ejecuta el CLI local de Angular: `ng serve`)*.

Una vez compilado, puedes abrir tu navegador en:
* **URL Local**: [http://localhost:4200](http://localhost:4200)

El servidor de desarrollo admite **HMR (Hot Module Replacement)**, por lo que cualquier cambio que realices en el código se reflejará instantáneamente en el navegador sin recargar toda la página.
