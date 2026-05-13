import { PrismaClient, Role, Permission, DisasterType, AssetCategory, AssetCondition, ShelterType, WarehouseType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { seedRegions } from './seed-regions';

const prisma = new PrismaClient();

const ALL_PERMISSIONS: Permission[] = [
  Permission.INCIDENT_CREATE,
  Permission.INCIDENT_READ,
  Permission.INCIDENT_UPDATE,
  Permission.INCIDENT_DELETE,
  Permission.INCIDENT_APPROVE,
  Permission.VOLUNTEER_CREATE,
  Permission.VOLUNTEER_READ,
  Permission.VOLUNTEER_UPDATE,
  Permission.VOLUNTEER_DELETE,
  Permission.VOLUNTEER_APPROVE,
  Permission.SHELTER_CREATE,
  Permission.SHELTER_READ,
  Permission.SHELTER_UPDATE,
  Permission.SHELTER_DELETE,
  Permission.WAREHOUSE_CREATE,
  Permission.WAREHOUSE_READ,
  Permission.WAREHOUSE_UPDATE,
  Permission.WAREHOUSE_DELETE,
  Permission.LOGISTICS_CREATE,
  Permission.LOGISTICS_READ,
  Permission.LOGISTICS_UPDATE,
  Permission.LOGISTICS_DELETE,
  Permission.USER_MANAGE,
  Permission.ROLE_MANAGE,
  Permission.PERMISSION_MANAGE,
  Permission.SYSTEM_SETTINGS,
  Permission.REPORT_CREATE,
  Permission.REPORT_READ,
  Permission.REPORT_UPDATE,
  Permission.REPORT_DELETE,
  Permission.ANALYTICS_VIEW,
  Permission.DASHBOARD_VIEW,
];

const ROLE_SEED_USERS: { username: string; role: Role; permissions: Permission[] }[] = [
  { username: 'admin', role: Role.RELAWAN_ADMIN, permissions: [
    Permission.INCIDENT_CREATE, Permission.INCIDENT_READ, Permission.INCIDENT_UPDATE, Permission.INCIDENT_DELETE, Permission.INCIDENT_APPROVE,
    Permission.VOLUNTEER_CREATE, Permission.VOLUNTEER_READ, Permission.VOLUNTEER_UPDATE, Permission.VOLUNTEER_DELETE, Permission.VOLUNTEER_APPROVE,
    Permission.SHELTER_CREATE, Permission.SHELTER_READ, Permission.SHELTER_UPDATE, Permission.SHELTER_DELETE,
    Permission.WAREHOUSE_CREATE, Permission.WAREHOUSE_READ, Permission.WAREHOUSE_UPDATE, Permission.WAREHOUSE_DELETE,
    Permission.LOGISTICS_CREATE, Permission.LOGISTICS_READ, Permission.LOGISTICS_UPDATE, Permission.LOGISTICS_DELETE,
    Permission.REPORT_CREATE, Permission.REPORT_READ, Permission.REPORT_UPDATE, Permission.REPORT_DELETE,
    Permission.ANALYTICS_VIEW, Permission.DASHBOARD_VIEW,
  ]},
  { username: 'operator', role: Role.PWNU, permissions: [
    Permission.INCIDENT_CREATE, Permission.INCIDENT_READ, Permission.INCIDENT_UPDATE,
    Permission.VOLUNTEER_CREATE, Permission.VOLUNTEER_READ, Permission.VOLUNTEER_UPDATE,
    Permission.SHELTER_CREATE, Permission.SHELTER_READ, Permission.SHELTER_UPDATE,
    Permission.WAREHOUSE_CREATE, Permission.WAREHOUSE_READ, Permission.WAREHOUSE_UPDATE,
    Permission.LOGISTICS_CREATE, Permission.LOGISTICS_READ, Permission.LOGISTICS_UPDATE,
    Permission.REPORT_CREATE, Permission.REPORT_READ, Permission.REPORT_UPDATE,
    Permission.ANALYTICS_VIEW, Permission.DASHBOARD_VIEW,
  ]},
  { username: 'viewer', role: Role.PCNU, permissions: [
    Permission.INCIDENT_READ,
    Permission.VOLUNTEER_READ,
    Permission.SHELTER_READ,
    Permission.WAREHOUSE_READ,
    Permission.LOGISTICS_READ,
    Permission.REPORT_READ,
    Permission.ANALYTICS_VIEW,
    Permission.DASHBOARD_VIEW,
  ]},
  { username: 'volunteer', role: Role.RELAWAN, permissions: [
    Permission.INCIDENT_READ,
    Permission.VOLUNTEER_READ,
    Permission.REPORT_CREATE, Permission.REPORT_READ,
    Permission.DASHBOARD_VIEW,
  ]},
  { username: 'bnpb', role: Role.BNPB, permissions: [
    Permission.INCIDENT_CREATE, Permission.INCIDENT_READ, Permission.INCIDENT_UPDATE, Permission.INCIDENT_APPROVE,
    Permission.VOLUNTEER_CREATE, Permission.VOLUNTEER_READ, Permission.VOLUNTEER_UPDATE, Permission.VOLUNTEER_APPROVE,
    Permission.SHELTER_CREATE, Permission.SHELTER_READ, Permission.SHELTER_UPDATE,
    Permission.WAREHOUSE_CREATE, Permission.WAREHOUSE_READ, Permission.WAREHOUSE_UPDATE,
    Permission.LOGISTICS_CREATE, Permission.LOGISTICS_READ, Permission.LOGISTICS_UPDATE,
    Permission.REPORT_CREATE, Permission.REPORT_READ, Permission.REPORT_UPDATE,
    Permission.ANALYTICS_VIEW, Permission.DASHBOARD_VIEW,
  ]},
];

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    throw new Error('SEED_ADMIN_PASSWORD environment variable is required');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      passwordHash,
      fullName: 'Super Admin',
      email: 'superadmin@nurisk.io',
      role: Role.SUPER_ADMIN,
      permissions: ALL_PERMISSIONS,
      isActive: true,
    },
  });

  console.log(`Created super admin user: ${superAdmin.username}`);

  for (const userData of ROLE_SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        username: userData.username,
        passwordHash,
        fullName: userData.username.charAt(0).toUpperCase() + userData.username.slice(1),
        email: `${userData.username}@nurisk.io`,
        role: userData.role,
        permissions: userData.permissions,
        isActive: true,
      },
    });

    console.log(`Created role seed user: ${user.username} (${user.role})`);
  }

  // Seed reference data using raw SQL for enums
  console.log('Seeding reference data...');
  
  // Seed DisasterType
  const disasterTypes = [
    'GEMBALA',      // earthquake
    'BANJIR',       // flood
    'VOLKANO',      // volcano
    'LONGSOR',      // landslide
    'TSUNAMI',      // tsunami
    'KEBAKARAN_HUTAN', // forest fire
    'KEBAKARAN_BANGUNAN', // building fire
  ];
  
  for (const type of disasterTypes) {
    try {
      await prisma.$executeRaw`INSERT INTO "DisasterType" ("disasterType") VALUES (${type}) ON CONFLICT DO NOTHING`;
    } catch (error) {
      // Ignore errors for now - in production we'd want better error handling
      console.log(`Could not seed DisasterType ${type}: ${error.message}`);
    }
  }
  
  // Seed AssetCategory (already exists in schema, but let's ensure they're seeded)
  const assetCategories = ['FOOD', 'MEDICINE', 'CLOTHING', 'SHELTER', 'TOOLS', 'OTHER'];
  for (const category of assetCategories) {
    try {
      await prisma.$executeRaw`INSERT INTO "AssetCategory" ("category") VALUES (${category}) ON CONFLICT DO NOTHING`;
    } catch (error) {
      console.log(`Could not seed AssetCategory ${category}: ${error.message}`);
    }
  }
  
  // Seed AssetCondition
  const assetConditions = ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'EXPIRED'];
  for (const condition of assetConditions) {
    try {
      await prisma.$executeRaw`INSERT INTO "AssetCondition" ("condition") VALUES (${condition}) ON CONFLICT DO NOTHING`;
    } catch (error) {
      console.log(`Could not seed AssetCondition ${condition}: ${error.message}`);
    }
  }
  
  // Seed ShelterType
  const shelterTypes = ['EVAKUASI', 'SEMENTARA', 'PERMANEN', 'BERGERAK'];
  for (const type of shelterTypes) {
    try {
      await prisma.$executeRaw`INSERT INTO "ShelterType" ("type") VALUES (${type}) ON CONFLICT DO NOTHING`;
    } catch (error) {
      console.log(`Could not seed ShelterType ${type}: ${error.message}`);
    }
  }
  
  // Seed WarehouseType (already exists in schema)
  const warehouseTypes = ['GUDANG', 'POSKO', 'DISTRIBUSI'];
  for (const type of warehouseTypes) {
    try {
      await prisma.$executeRaw`INSERT INTO "WarehouseType" ("type") VALUES (${type}) ON CONFLICT DO NOTHING`;
    } catch (error) {
      console.log(`Could not seed WarehouseType ${type}: ${error.message}`);
    }
  }
  
  console.log('Reference data seeding completed');

  console.log('User seed completed, seeding regions...');
  await seedRegions();

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
