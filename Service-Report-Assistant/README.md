# Service Report Assistant

Service Report Assistant es una aplicación de escritorio construida con Electron y React, diseñada para ayudar en el reporte de informes de las congregaciones. Esta aplicación permite gestionar datos de publicadores, calcular totales y promedios, y exportar informes en formato PDF.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
report-assistant
├── src
│   ├── main
│   │   └── main.ts          # Punto de entrada de la aplicación Electron
│   ├── preload
│   │   └── preload.ts       # Contexto de seguridad y comunicación entre procesos
│   └── renderer
│       ├── components
│       │   └── service-report-assistant.tsx  # Componente principal de la aplicación
│       ├── index.html       # Plantilla HTML de la interfaz de usuario
│       └── index.tsx        # Punto de entrada para el código de React
├── electron-builder.json     # Configuración para empaquetar la aplicación
├── forge.config.js           # Configuración para Electron Forge
├── package.json              # Configuración de npm y dependencias
├── tsconfig.json             # Configuración de TypeScript
└── README.md                 # Documentación del proyecto
```

## Instalación

Para instalar las dependencias del proyecto, ejecuta:

```
npm install
```

## Ejecución

Para iniciar la aplicación en modo de desarrollo, utiliza:

```
npm start
```

## Construcción

Para empaquetar la aplicación para producción, ejecuta:

```
npm run build
```

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.