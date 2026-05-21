import request from 'supertest';

// Note: This e2e test requires the Express app to be running
// In a real CI/CD environment, you would use test containers or a dedicated test database.

describe('Incident CRUD (e2e)', () => {
  const baseUrl = 'http://localhost:7860';
  let server: any;

  // Test incident data
  const testIncident = {
    location: { lat: -6.9667, lng: 110.4205, address: 'Semarang Utara' },
    disaster_type: 'BANJIR',
    priority: 'HIGH' as const,
    description: 'Banjir bandang di wilayah Semarang Utara',
    source: 'PUBLIC',
    region: 'SEMARANG',
  };

  let createdIncidentId: number;
  let incidentNumber: string;

  beforeAll((done) => {
    // Get the underlying HTTP server - connect to running server
    server = request(baseUrl);
    done();
  });

  describe('Full CRUD Lifecycle', () => {
    it('should create a new incident (POST /incidents-crud)', async () => {
      const response = await server
        .post('/api/incidents-crud')
        .send(testIncident)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Laporan kejadian berhasil dibuat');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.incident_number).toMatch(/^INC-\d{8}-\d{4}$/);

      createdIncidentId = response.body.data.id;
      incidentNumber = response.body.data.incident_number;
    });

    it('should reject create with invalid data - missing location', async () => {
      const invalidDto = {
        disaster_type: 'BANJIR',
        priority: 'HIGH' as const,
        description: 'Test description',
      };

      const response = await server
        .post('/api/incidents-crud')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should reject create with invalid data - empty disaster_type', async () => {
      const invalidDto = {
        location: { lat: -6.9667, lng: 110.4205 },
        disaster_type: '',
        priority: 'HIGH' as const,
        description: 'Test description',
      };

      const response = await server
        .post('/api/incidents-crud')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should reject create with invalid data - invalid priority', async () => {
      const invalidDto = {
        location: { lat: -6.9667, lng: 110.4205 },
        disaster_type: 'BANJIR',
        priority: 'INVALID' as any,
        description: 'Test description',
      };

      const response = await server
        .post('/api/incidents-crud')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should reject create with invalid data - empty description', async () => {
      const invalidDto = {
        location: { lat: -6.9667, lng: 110.4205 },
        disaster_type: 'BANJIR',
        priority: 'HIGH' as const,
        description: '',
      };

      const response = await server
        .post('/api/incidents-crud')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should reject create with invalid data - description too long', async () => {
      const invalidDto = {
        location: { lat: -6.9667, lng: 110.4205 },
        disaster_type: 'BANJIR',
        priority: 'HIGH' as const,
        description: 'a'.repeat(2001),
      };

      const response = await server
        .post('/api/incidents-crud')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should get all incidents with pagination (GET /incidents-crud)', async () => {
      const response = await server
        .get('/api/incidents-crud')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(20);
    });

    it('should get incidents with filters (GET /incidents-crud?status=REPORTED)', async () => {
      const response = await server
        .get('/api/incidents-crud')
        .query({ status: 'REPORTED' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get incidents with pagination (GET /incidents-crud?page=1&limit=10)', async () => {
      const response = await server
        .get('/api/incidents-crud')
        .query({ page: '1', limit: '10' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should get incidents with sorting (GET /incidents-crud?sortBy=created_at&sortOrder=DESC)', async () => {
      const response = await server
        .get('/api/incidents-crud')
        .query({ sortBy: 'created_at', sortOrder: 'DESC' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should get incidents as GeoJSON (GET /incidents-crud/geo)', async () => {
      const response = await server
        .get('/api/incidents-crud/geo')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.type).toBe('FeatureCollection');
      expect(response.body.data.features).toBeDefined();
      expect(Array.isArray(response.body.data.features)).toBe(true);
    });

    it('should get incidents as GeoJSON with filters (GET /incidents-crud/geo?status=REPORTED)', async () => {
      const response = await server
        .get('/api/incidents-crud/geo')
        .query({ status: 'REPORTED' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('FeatureCollection');
    });

    it('should get incident by ID (GET /incidents-crud/:id)', async () => {
      const response = await server
        .get(`/api/incidents-crud/${createdIncidentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(createdIncidentId);
      expect(response.body.data.incident_number).toBe(incidentNumber);
    });

    it('should return 404 for non-existent incident (GET /incidents-crud/99999)', async () => {
      const response = await server
        .get('/api/incidents-crud/99999')
        .expect(404);

      expect(response.body.message).toBe('Kejadian tidak ditemukan');
    });

    it('should update incident (PATCH /incidents-crud/:id)', async () => {
      const updateDto = {
        priority: 'CRITICAL' as const,
        description: 'Updated description after e2e test',
      };

      const response = await server
        .patch(`/api/incidents-crud/${createdIncidentId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Kejadian berhasil diperbarui');
      expect(response.body.data).toBeDefined();
    });

    it('should update incident status (PATCH /incidents-crud/:id with status transition)', async () => {
      const updateDto = {
        status: 'VERIFIED',
      };

      const response = await server
        .patch(`/api/incidents-crud/${createdIncidentId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject invalid status transition (PATCH /incidents-crud/:id from COMPLETED to REPORTED)', async () => {
      // First create a new incident to test invalid transition
      const newIncident = await server
        .post('/api/incidents-crud')
        .send(testIncident);

      const newId = newIncident.body.data.id;

      // Update to COMPLETED first
      await server
        .patch(`/api/incidents-crud/${newId}`)
        .send({ status: 'VERIFIED' });

      await server
        .patch(`/api/incidents-crud/${newId}`)
        .send({ status: 'ASSESSED' });

      await server
        .patch(`/api/incidents-crud/${newId}`)
        .send({ status: 'COMMANDED' });

      await server
        .patch(`/api/incidents-crud/${newId}`)
        .send({ status: 'ACTION' });

      await server
        .patch(`/api/incidents-crud/${newId}`)
        .send({ status: 'COMPLETED' });

      // Try to go back to REPORTED - should fail
      const response = await server
        .patch(`/api/incidents-crud/${newId}`)
        .send({ status: 'REPORTED' })
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should reject update with invalid data (PATCH /incidents-crud/:id with invalid priority)', async () => {
      const invalidDto = {
        priority: 'INVALID' as any,
      };

      const response = await server
        .patch(`/api/incidents-crud/${createdIncidentId}`)
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe('Validasi Gagal');
    });

    it('should soft delete incident (DELETE /incidents-crud/:id)', async () => {
      const response = await server
        .delete(`/api/incidents-crud/${createdIncidentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Kejadian berhasil dihapus');
      expect(response.body.data).toBeDefined();
    });

    it('should return 404 for already deleted incident (DELETE /incidents-crud/:id)', async () => {
      const response = await server
        .delete(`/api/incidents-crud/${createdIncidentId}`)
        .expect(404);

      expect(response.body.message).toBe('Kejadian tidak ditemukan');
    });

    it('should restore soft-deleted incident (POST /incidents-crud/:id/restore)', async () => {
      const response = await server
        .post(`/api/incidents-crud/${createdIncidentId}/restore`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Kejadian berhasil dipulihkan');
      expect(response.body.data).toBeDefined();
    });

    it('should reject restore for non-deleted incident (POST /incidents-crud/:id/restore)', async () => {
      const response = await server
        .post(`/api/incidents-crud/${createdIncidentId}/restore`)
        .expect(400);

      expect(response.body.message).toBe('Kejadian tidak dalam status terhapus');
    });

    it('should include deleted incident when includeDeleted=true (GET /incidents-crud/:id?includeDeleted=true)', async () => {
      // First delete the incident
      await server
        .delete(`/api/incidents-crud/${createdIncidentId}`);

      // Then try to get with includeDeleted
      const response = await server
        .get(`/api/incidents-crud/${createdIncidentId}`)
        .query({ includeDeleted: 'true' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.deleted_at).toBeDefined();
    });
  });

  describe('Status Transition Tests', () => {
    let testIncidentId: number;

    it('should allow status transition from REPORTED to VERIFIED', async () => {
      const createResponse = await server
        .post('/api/incidents-crud')
        .send(testIncident);

      testIncidentId = createResponse.body.data.id;

      const response = await server
        .patch(`/api/incidents-crud/${testIncidentId}`)
        .send({ status: 'VERIFIED' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow status transition from VERIFIED to ASSESSED', async () => {
      const response = await server
        .patch(`/api/incidents-crud/${testIncidentId}`)
        .send({ status: 'ASSESSED' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow status transition from ASSESSED to COMMANDED', async () => {
      const response = await server
        .patch(`/api/incidents-crud/${testIncidentId}`)
        .send({ status: 'COMMANDED' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow status transition from COMMANDED to ACTION', async () => {
      const response = await server
        .patch(`/api/incidents-crud/${testIncidentId}`)
        .send({ status: 'ACTION' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow status transition from ACTION to COMPLETED', async () => {
      const response = await server
        .patch(`/api/incidents-crud/${testIncidentId}`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow transition to REJECTED from any state', async () => {
      // Create new incident
      const createResponse = await server
        .post('/api/incidents-crud')
        .send(testIncident);

      const newId = createResponse.body.data.id;

      const response = await server
        .patch(`/api/incidents-crud/${newId}`)
        .send({ status: 'REJECTED' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow transition to DISMISSED from any state', async () => {
      // Create new incident
      const createResponse = await server
        .post('/api/incidents-crud')
        .send(testIncident);

      const newId = createResponse.body.data.id;

      const response = await server
        .patch(`/api/incidents-crud/${newId}`)
        .send({ status: 'DISMISSED' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});