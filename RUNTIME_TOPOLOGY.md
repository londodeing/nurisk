# NURisk Runtime Topology

**Last Updated:** 2026-05-21

## Overview

This document describes the runtime architecture of the NURisk backend system.

## Runtime Entry Points

### Primary (Active)
| File | Type | Status | Port |
|------|------|--------|------|
| `backend/src/main.ts` | NestJS | **ACTIVE** | 3000 |

### Legacy (Deprecated)
| File | Type | Status | Notes |
|------|------|--------|-------|
| `backend/src/app.js` | Express | **DEPRECATED** | Do not start |

## Startup Chain

```
Development:
  nodemon/ts-node → backend/src/main.ts → NestFactory.create()

Production:
  Docker → node dist/main.js → NestFactory.create()
```

## Port Bindings

| Port | Service | Status |
|------|---------|--------|
| 3000 | NestJS Backend | Primary |
| 5432 | PostgreSQL | Database |
| 6379 | Redis | Cache/Queue |
| 7474 | Neo4j | Graph DB |
| 7687 | Neo4j Bolt | Graph DB |

## Configuration

### Environment Variables
- `PORT` - Backend port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - PostgreSQL host
- `JWT_SECRET` - JWT signing secret

### Global Prefix
All API routes are prefixed with `/api`:
- `/api/incidents`
- `/api/resources`
- `/api/auth`
- `/api/briefing`
- etc.

## Docker Configuration

### Services
- `postgres` - TimescaleDB with PostGIS
- `redis` - Cache
- `neo4j` - Graph database
- `backend` - NestJS application
- `frontend-web` - Vite React app

### Build Commands
```bash
# Development
npm run dev

# Production (Docker)
docker-compose up -d

# Direct
node dist/main.js
```

## Route Compatibility

### Frontend Proxy (Vite)
```js
proxy: {
  '/api': { target: 'http://localhost:3000', rewrite: (path) => path.replace(/^\/api/, '') }
}
```

### SDK
The SDK (`packages/sdk`) targets `http://localhost:3000` with `/api` prefix.

## Observability

### Startup Logs
```
[Nest] Global prefix: /api
[RUNTIME]     : NestJS (SINGLE ENTRY POINT)
[PORT]       : 3000
[PREFIX]     : /api
[STATUS] Active runtime: NestJS ONLY
[WARNING] Express (app.js) is DEPRECATED
```

### Route Registration
```
[ROUTES] Registered N routes
  - /incidents
  - /resources
  - /auth
  ...
```

## Legacy Isolation

The legacy `app.js` Express runtime is:
- **NOT deleted** - preserved for compatibility
- **NOT started** - commented out listen()
- **Marked deprecated** - JSDoc header

This ensures:
1. No EADDRINUSE conflicts
2. Backward compatibility for testing
3. Reference for migration

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Multiple Runtimes
If you see `[FATAL] Multiple runtime listeners detected`, ensure only one of:
- `npm run dev` (nodemon)
- `node dist/main.js`
- Docker container

is running.