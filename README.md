# Mission Control - Hermes Dashboard

Dashboard para monitorear tu instancia de Hermes.

## Setup

```bash
npm install
npm run dev
```

## Variables de Entorno

Copiar `.env.example` a `.env.local` y completar:

```
MISSION_CONTROL_USERNAME=admin
MISSION_CONTROL_PASSWORD=password
MISSION_CONTROL_API_KEY=tu-api-key
HERMES_BRIDGE_URL=http://tu-vps:3001
```

## Deploy a Vercel

```bash
npm run build
vercel --prod
```

## Arquitectura

```
Vercel → Hermes Bridge (VPS) → Hermes CLI
```

## Rutas

- `/` - Dashboard overview
- `/agents` - Sesiones activas
- `/activity` - Actividad reciente
- `/system` - Sistema y MCP
