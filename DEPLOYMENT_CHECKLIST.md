# NURisk Deployment Validation Checklist

**Version:** 1.0.0
**Date:** 2026-05-21

## Pre-Deployment Validation

### ✅ Runtime Topology

- [ ] Only ONE listener active (`main.ts`)
- [ ] No duplicate `app.listen()` or `server.listen()`
- [ ] Port 3000 available or fallback works
- [ ] No EADDRINUSE errors

### ✅ Build Verification

- [ ] Backend builds: `npm run build` (backend)
- [ ] Frontend builds: `npm run build` (frontend-web)
- [ ] No TypeScript errors
- [ ] No ESLint errors

### ✅ Contract Validation

- [ ] SDK imports canonical types only
- [ ] No `PaginatedResponse` (deprecated)
- [ ] Frontend uses `ListResponse<T>`

### ✅ Transport Validation

- [ ] SDK used for API calls
- [ ] No raw `axios.get/post/put/patch/delete` in feature layer
- [ ] Token refresh works

### ✅ Observability

- [ ] Startup logs visible
- [ ] Route registration logs visible
- [ ] Error states visible in UI

---

## Post-Deployment Smoke Tests

### ✅ Core Features

| Feature | Test | Expected |
|---------|------|----------|
| Dashboard | Visit `/` | KPI cards visible |
| Map | Visit `/map` | Map loads with tiles |
| Incidents | Visit `/incidents` | List loads or shows empty |
| Resources | Visit `/resources` | List loads or shows empty |
| Reports | Visit `/reports` | Reports load or shows empty |

### ✅ API Endpoints

| Endpoint | Test | Expected |
|----------|------|----------|
| GET /api/incidents | curl localhost:3000/api/incidents | 200 OK |
| GET /api/resources | curl localhost:3000/api/resources | 200 OK |
| GET /api/volunteers | curl localhost:3000/api/volunteers | 200 OK |
| GET /api/shelters | curl localhost:3000/api/shelters | 200 OK |

### ✅ Error States

| Test | Expected |
|------|----------|
| Invalid endpoint | 404 with error message |
| Invalid auth | 401 with error message |
| Server error | 500 with error message |

---

## Governance Gates

### ❌ FAIL If:

- [ ] Multiple listeners detected
- [ ] Legacy `app.js` listener active
- [ ] Raw transport in feature layer
- [ ] Silent fallbacks (`?? []` masking errors)
- [ ] Empty catch blocks
- [ ] Dashboard blank (no error shown)
- [ ] Map blank (no error shown)
- [ ] Resources blank (no error shown)
- [ ] Reports blank (no error shown)

---

## Rollback Triggers

Deploy MUST be rolled back if:

1. **Runtime**: EADDRINUSE or port conflict
2. **Build**: TypeScript/ESLint errors
3. **API**: All endpoints return 500
4. **UI**: All pages blank with no error
5. **Governance**: Any FAIL condition above

---

## Quick Validation Commands

```bash
# 1. Check listeners
lsof -i :3000

# 2. Build
cd backend && npm run build
cd frontend-web && npm run build

# 3. Test API
curl http://localhost:3000/api/incidents

# 4. Check frontend
curl http://localhost:5173
```

---

## Sign-Off

| Role | Name | Date |
|------|------|------|
| Engineering | | |
| QA | | |
| DevOps | | |
| Product | | |