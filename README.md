# PanelIot

Dashboard responsive de telemetría para flotas, construido con Angular standalone,
Tailwind CSS, RxJS y Leaflet.

## Desarrollo local

```bash
npm install
npm start
```

El dashboard se sirve en `http://localhost:4200`. Los marcadores, métricas y
alertas usan un stream simulado en `src/app/services/telemetry.service.ts`.
Para integrar el backend, reemplaza el productor de ese servicio por el cliente
gRPC-Web generado desde los archivos `.proto`; conserva `vehicles$`, `alerts$`
y `telemetry$` como interfaces observables del dashboard.

El mapa usa tiles de OpenStreetMap; en modo oscuro se aplica un filtro a la
cartografía para mantener su legibilidad. Se necesita conexión a internet para
cargar los tiles y se conserva la atribución requerida por el proveedor.

## Verificación

```bash
npm run build
npm test -- --watch=false
```

## Despliegue en Vercel

La configuración de `vercel.json` compila el proyecto Angular, publica
`dist/PanelIot/browser` y envía las rutas del cliente a `index.html` para que
las recargas de la SPA no terminen en 404.
