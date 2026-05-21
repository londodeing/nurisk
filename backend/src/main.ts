import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { AuditService } from './common/services/audit.service';
import { RateLimiterMiddleware } from './common/middleware/rate-limiter.middleware';
import pool from './config/database';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  // =============================================================
  //  DATABASE CONNECTION & MIGRATIONS
  // =============================================================
  try {
    const client = await pool.connect();
    client.release();
    console.log('✅ DATABASE: PostgreSQL Connected');

    // Run migrations
    await runMigrations();
  } catch (err) {
    console.error('❌ DATABASE CONNECTION FAILED:', (err as Error).message);
    await app.close().catch(() => {});
    process.exit(1);
  }

  // =============================================================
  //  CORS CONFIGURATION
  // =============================================================
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin tidak diizinkan — ${origin}`), false);
    },
    credentials: true,
  });

  // =============================================================
  //  GLOBAL PREFIX (SINGLE ENTRY POINT CONSOLIDATION)
  // =============================================================
  app.setGlobalPrefix('api');
  console.log('[Nest] Global prefix: /api');

  // =============================================================
  //  GLOBAL FILTERS
  // =============================================================
  app.useGlobalFilters(new HttpExceptionFilter());

  // =============================================================
  //  GLOBAL INTERCEPTORS
  // =============================================================
  app.useGlobalInterceptors(
    new ApiResponseInterceptor(),
  );
  app.useGlobalInterceptors(
    new AuditLogInterceptor(new AuditService()),
  );

  // =============================================================
  //  MIDDLEWARE
  // =============================================================
  // LoggerMiddleware is now registered in AppModule via configure()

  const rateLimiter = new RateLimiterMiddleware();
  app.use((req: Request, res: Response, next: NextFunction) => rateLimiter.use(req, res, next));

  const desiredPort = parseInt(process.env.PORT || '3000');
  const maxPortAttempts = 5;

  async function listenWithFallback(attempt: number): Promise<void> {
    const currentPort = desiredPort + (attempt - 1);
    try {
      await app.listen(currentPort);

      // =====================================================
      // OBSERVABILITY: Runtime Topology Logging
      // =====================================================
      console.log(`
  =====================================================
  PUSDATIN NESTJS ENGINE STARTED
  =====================================================
  [RUNTIME]     : NestJS (SINGLE ENTRY POINT)
  [PORT]       : ${currentPort}${currentPort !== desiredPort ? ` (fallback from ${desiredPort})` : ''}
  [PREFIX]     : /api
  [ENV]        : ${process.env.NODE_ENV || 'development'}
  [TIMESTAMP]  : ${new Date().toISOString()}
  =====================================================
      `);

      // Log registered routes
      const httpAdapter = app.getHttpAdapter();
      const instance = httpAdapter.getInstance();
      if (instance && instance._router) {
        const routes = instance._router.stack
          .filter((layer: any) => layer.route)
          .map((layer: any) => layer.route.path);
        console.log(`[ROUTES] Registered ${routes.length} routes`);
        routes.forEach((path: string) => console.log(`  - ${path}`));
      }

      console.log('[STATUS] Active runtime: NestJS ONLY');
      console.log('[WARNING] Express (app.js) is DEPRECATED');

      const shutdown = async (signal: string) => {
        console.log(`\n[shutdown] Received ${signal}. Closing gracefully...`);
        await app.close();
        console.log('[shutdown] Server closed.');
        process.exit(0);
      };
      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));
    } catch (err: any) {
      if (err.code === 'EADDRINUSE' && attempt < maxPortAttempts) {
        console.warn(`[port] Port ${currentPort} in use, trying ${currentPort + 1}...`);
        await listenWithFallback(attempt + 1);
      } else {
        throw err;
      }
    }
  }

  await listenWithFallback(1);
}

async function migrateCoordinates() {
  console.log('[SYSTEM] Migrating coordinates to PostGIS...');

  const tables = ['incidents', 'volunteers', 'shelters', 'warehouses', 'assets'];
  let totalMigrated = 0;

  for (const table of tables) {
    // Check if table has a JSONB location column
    const checkResult = await pool.query(`
      SELECT data_type
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = 'location'
    `, [table]);

    if (checkResult.rows.length === 0) continue;
    if (checkResult.rows[0].data_type !== 'jsonb') continue;

    // Migrate from JSONB location to PostGIS geometry
    const result = await pool.query(`
      UPDATE ${table}
      SET location = ST_SetSRID(
        ST_MakePoint(
          (location->>'lng')::float,
          (location->>'lat')::float
        ), 4326
      )
      WHERE location IS NOT NULL 
      AND location->>'lat' IS NOT NULL 
      AND location->>'lng' IS NOT NULL
      AND (location::text NOT LIKE '%geometry%')
    `);

    totalMigrated += result.rowCount ?? 0;
  }

  console.log(`[SYSTEM] Migrated ${totalMigrated} coordinates to PostGIS`);
}

async function createSpatialIndexes() {
  console.log('[SYSTEM] Creating spatial indexes...');

  const indexes = [
    { name: 'incidents_location_idx', table: 'incidents', column: 'location' },
    { name: 'volunteers_location_idx', table: 'volunteers', column: 'location' },
    { name: 'shelters_location_idx', table: 'shelters', column: 'location' },
    { name: 'warehouses_location_idx', table: 'warehouses', column: 'location' },
    { name: 'assets_location_idx', table: 'assets', column: 'location' },
  ];

  for (const idx of indexes) {
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS ${idx.name} 
        ON ${idx.table} USING GIST (${idx.column})
      `);
    } catch {
      // Skip GiST index if column type doesn't support it (e.g. varchar)
    }
  }

  console.log(`[SYSTEM] Created ${indexes.length} spatial indexes`);
}

async function runMigrations() {
  console.log('[SYSTEM] Verifying Database Extensions...');

  // Enable PostGIS extensions
  await pool.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
  await pool.query(`CREATE EXTENSION IF NOT EXISTS postgis_topology`);

  // Ensure assets table exists before geometry migration
  await pool.query(`
    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      quantity INTEGER DEFAULT 0,
      unit VARCHAR(50),
      location JSONB,
      warehouse_id INTEGER,
      qr_code VARCHAR(100),
      status VARCHAR(50) DEFAULT 'available',
      description TEXT DEFAULT '',
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      region VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      purchase_date DATE,
      purchase_price DECIMAL(10, 2),
      supplier VARCHAR(255),
      notes TEXT
    )
  `);

  // Verify PostGIS
  const postgisVersion = await pool.query(`SELECT postgis_version()`);
  console.log(`[SYSTEM] PostGIS: ${postgisVersion.rows[0].postgis_version}`);

  console.log('[SYSTEM] Verifying Database Columns...');

  // Incidents table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS incidents (
      id SERIAL PRIMARY KEY,
      incident_number VARCHAR(50) UNIQUE,
      location JSONB,
      disaster_type VARCHAR(100),
      priority VARCHAR(20) DEFAULT 'LOW',
      description TEXT,
      source VARCHAR(50) DEFAULT 'PUBLIC',
      status VARCHAR(50) DEFAULT 'REPORTED',
      region VARCHAR(100),
      reported_by INTEGER,
      priority_score INTEGER DEFAULT 0,
      deleted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status_changed_at TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE
    )
  `);

  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255),
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'RELAWAN',
      region VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Volunteers table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      full_name VARCHAR(255),
      phone VARCHAR(50),
      email VARCHAR(255),
      nik VARCHAR(16) UNIQUE,
      birth_date DATE,
      gender VARCHAR(20),
      blood_type VARCHAR(5),
      regency VARCHAR(100),
      district VARCHAR(100),
      village VARCHAR(100),
      detail_address TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      medical_history TEXT,
      expertise TEXT,
      experience TEXT,
      status VARCHAR(50) DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Building assessments table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS building_assessments (
      id SERIAL PRIMARY KEY,
      nama_gedung VARCHAR(255),
      fungsi VARCHAR(50),
      fungsi_lain VARCHAR(255),
      alamat TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      imb VARCHAR(20) DEFAULT 'tidak',
      slf VARCHAR(20) DEFAULT 'tidak',
      odnk INTEGER DEFAULT 0,
      ibu_hamil INTEGER DEFAULT 0,
      sakit_kronis INTEGER DEFAULT 0,
      lansia INTEGER DEFAULT 0,
      balita INTEGER DEFAULT 0,
      anak_anak INTEGER DEFAULT 0,
      dewasa_sehat INTEGER DEFAULT 0,
      pernah_terjadi BOOLEAN DEFAULT FALSE,
      ancaman JSONB DEFAULT '{}',
      riwayat_desa TEXT,
      struktur VARCHAR(20) DEFAULT 'tidak_tahu',
      non_struktural VARCHAR(20) DEFAULT 'tidak',
      fasilitas JSONB DEFAULT '[]',
      peralatan JSONB DEFAULT '[]',
      dana_darurat VARCHAR(20) DEFAULT 'tidak',
      anggaran VARCHAR(20) DEFAULT 'tidak',
      asuransi VARCHAR(20) DEFAULT 'tidak',
      kerjasama VARCHAR(255),
      peduli VARCHAR(20) DEFAULT 'cukup',
      konflik BOOLEAN DEFAULT FALSE,
      section INTEGER DEFAULT 1,
      total_score INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT FALSE,
      region VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Audit logs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      correlation_id VARCHAR(36),
      user_id INTEGER REFERENCES users(id),
      method VARCHAR(10) NOT NULL,
      path VARCHAR(500) NOT NULL,
      body JSONB,
      query JSONB,
      status_code INTEGER,
      response_body JSONB,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Historical disasters table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS historical_disasters (
      id SERIAL PRIMARY KEY,
      region VARCHAR(100) NOT NULL,
      disaster_type VARCHAR(100) NOT NULL,
      event_date TIMESTAMP NOT NULL,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      time VARCHAR(10) DEFAULT '00:00'
    )
  `);

  // Reporter contact opt-in flow
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reporter_contact (
      id SERIAL PRIMARY KEY,
      incident_id INTEGER REFERENCES incidents(id),
      phone_hash VARCHAR(64) NOT NULL,
      email_hash VARCHAR(64),
      phone_last4 VARCHAR(4),
      consent_given BOOLEAN DEFAULT FALSE,
      phone_verified BOOLEAN DEFAULT FALSE,
      email_verified BOOLEAN DEFAULT FALSE,
      otp_code VARCHAR(6),
      otp_expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Missions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS missions (
      id SERIAL PRIMARY KEY,
      incident_id INTEGER REFERENCES incidents(id),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      location VARCHAR(255),
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP,
      required_skills VARCHAR(500),
      capacity INTEGER DEFAULT 10,
      status VARCHAR(50) DEFAULT 'DRAFT',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Mission deployments table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS volunteer_deployments (
      id SERIAL PRIMARY KEY,
      mission_id INTEGER REFERENCES missions(id),
      volunteer_id INTEGER REFERENCES volunteers(id),
      role VARCHAR(100),
      status VARCHAR(50) DEFAULT 'PENDING',
      deployed_at TIMESTAMP,
      recalled_at TIMESTAMP,
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // GPS Check-in table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS check_ins (
      id SERIAL PRIMARY KEY,
      mission_id INTEGER REFERENCES missions(id),
      volunteer_id INTEGER REFERENCES volunteers(id),
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      accuracy DECIMAL(6, 2),
      altitude DECIMAL(8, 2),
      timestamp TIMESTAMP NOT NULL,
      inside_zone BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Geofence alerts table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS geofence_alerts (
      id SERIAL PRIMARY KEY,
      mission_id INTEGER REFERENCES missions(id),
      volunteer_id INTEGER REFERENCES volunteers(id),
      alert_type VARCHAR(50) NOT NULL,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      message TEXT,
      acknowledged BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ICS positions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ics_positions (
      id SERIAL PRIMARY KEY,
      incident_id INTEGER REFERENCES incidents(id),
      user_id INTEGER REFERENCES users(id),
      role VARCHAR(50) NOT NULL,
      parent_id INTEGER REFERENCES ics_positions(id),
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ended_at TIMESTAMP,
      status VARCHAR(20) DEFAULT 'ACTIVE'
    )
  `);

  // ICS assignment log table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ics_assignment_log (
      id SERIAL PRIMARY KEY,
      ics_position_id INTEGER REFERENCES ics_positions(id),
      user_id INTEGER REFERENCES users(id),
      role VARCHAR(50),
      action VARCHAR(20) NOT NULL,
      performed_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // State transitions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS state_transitions (
      id SERIAL PRIMARY KEY,
      incident_id INTEGER REFERENCES incidents(id),
      from_state VARCHAR(50),
      to_state VARCHAR(50),
      triggered_by INTEGER REFERENCES users(id),
      reason TEXT,
      transitioned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Incident logs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS incident_logs (
      id SERIAL PRIMARY KEY,
      incident_id INTEGER REFERENCES incidents(id),
      action VARCHAR(50),
      actor_id INTEGER REFERENCES users(id),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Warehouses table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50),
      region VARCHAR(100),
      address TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      contact_person VARCHAR(255),
      phone VARCHAR(20),
      email VARCHAR(255),
      operating_hours VARCHAR(100),
      status VARCHAR(20) DEFAULT 'active',
      deleted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  try {
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at)
    `);
  } catch {
    // audit_logs may use actor_id instead of user_id in existing deployments
  }

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_incidents_region ON incidents(region)
  `);

  console.log('✅ DATABASE: All Intelligence Columns Verified');

  // Migrate lat/lng from JSONB to PostGIS geometry
  await migrateCoordinates();

  // Add geometry columns to tables that don't already have location
  const geometryColumns = [
    { table: 'incidents', column: 'location', type: 'Point' },
    { table: 'volunteers', column: 'location', type: 'Point' },
    { table: 'shelters', column: 'location', type: 'Point' },
    { table: 'warehouses', column: 'location', type: 'Point' },
    { table: 'assets', column: 'location', type: 'Point' },
  ];

  for (const col of geometryColumns) {
    await pool.query(`
      ALTER TABLE ${col.table} 
      ADD COLUMN IF NOT EXISTS ${col.column} geometry(${col.type}, 4326)
    `);
  }

  // Create GiST indexes on geometry columns
  await createSpatialIndexes();

  console.log('✅ DATABASE: Migration Complete');
}

bootstrap();