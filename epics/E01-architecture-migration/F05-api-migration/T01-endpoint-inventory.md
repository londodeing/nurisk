# T01 - API Endpoint Inventory

**Task**: Document and migrate all existing API endpoints

**Current Endpoints** (from mainprd.md):

**Public Endpoints**:
- GET /api/ping - Health check
- GET /api/incidents/public - Map data
- GET /api/historical-data - 12,641 records
- POST /api/reports - Public reporting
- POST /api/auth/login - JWT issuance
- POST /api/auth/register - Account creation

**Protected Endpoints**:
- GET /api/incidents - Role/region filtered
- POST /api/incidents - Multi-part with photo
- PATCH /api/incidents/:id/assessment - Damage scoring
- GET /api/incidents/:id/full-report - SITREP data
- POST /api/buildings - Building assessment
- GET /api/volunteers - Regional profiles
- POST /api/chat/broadcast - Regional alerts
- GET /api/analytics/summary - KPI dashboard

**Migration Requirements**:
- Preserve all endpoint functionality
- Maintain RBAC filtering
- Keep multer file upload
- Preserve Socket.IO events

**Success Criteria**:
- All endpoints documented
- RBAC rules preserved
- File upload working
- Real-time features intact

**Estimated Time**: 4 hours
