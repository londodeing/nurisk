import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  try {
    const result = await prisma.$queryRawUnsafe(`SELECT postgis_full_version()`);
    const version = result[0]?.postgis_full_version;
    if (version && version.length > 0) {
      console.log(`PostGIS version: ${version}`);
      process.exit(0);
    } else {
      console.error('PostGIS not installed or empty version returned');
      process.exit(1);
    }
  } catch (err) {
    console.error('Failed to verify PostGIS:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
