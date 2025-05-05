# Congregation Tracker App

Aplicación de escritorio para generar informes. Construida con React y Electron.

## Requisitos previos

- Node.js (versión 14 o superior)
- npm o yarn

## Instrucciones de instalación

Sigue estos pasos para configurar el entorno de desarrollo:

1. Clona el repositorio:
   ```
   git clone <url-del-repositorio>
   cd congregation-tracker
   ```

2. Instala las dependencias:
   ```
   npm install
   ```
   o
   ```
   yarn
   ```

3. Inicia la aplicación en modo desarrollo:
   ```
   npm start
   ```
   o
   ```
   yarn start
   ```

## Compilación

Para compilar la aplicación para producción:

```
npm run make
```
o
```
yarn make
```

Esto generará los archivos ejecutables en la carpeta `out/make`.

## Características

- Gestión de grupos de publicadores
- Seguimiento mensual de actividad
- Exportación de datos a PDF
- Interfaz de usuario intuitiva

## Estructura del proyecto

- `src/`: Código fuente de la aplicación
  - `components/`: Componentes de React
  - `electron/`: Código específico de Electron
- `public/`: Archivos estáticos
- `.webpack/`: Archivos compilados (generados)
- `out/`: Archivos de distribución (generados)

## Licencia

MIT