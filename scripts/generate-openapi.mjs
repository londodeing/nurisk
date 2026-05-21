import { writeFileSync } from 'fs';
import { resolve } from 'path';

const OUTPUT_PATH = resolve(process.cwd(), 'docs', 'openapi.json');

async function generate() {
  try {
    const { NestFactory } = await import('@nestjs/core');
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
    const { AppModule } = await import('../backend/dist/app.module.js');

    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
      .setTitle('Nurisk API')
      .setDescription('Nurisk disaster response platform API')
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('incidents', 'Incident management')
      .addTag('volunteers', 'Volunteer management')
      .addTag('shelters', 'Shelter management')
      .addTag('warehouses', 'Warehouse management')
      .addTag('chat', 'Chat / messaging')
      .addTag('notifications', 'Push notifications')
      .addTag('audit', 'Audit log')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    writeFileSync(OUTPUT_PATH, JSON.stringify(document, null, 2), 'utf8');
    console.log(`✅ OpenAPI spec written to ${OUTPUT_PATH}`);
    await app.close();
  } catch (err) {
    console.error('❌ Failed to generate OpenAPI spec:', err.message);
    console.log('⚠️  Ensure backend is built first (pnpm --filter backend build)');
    process.exit(1);
  }
}

generate();
